// Lifetime memory, backed by Firestore instead of localStorage/cookies —
// so it follows the user's account across devices and browsers rather
// than being stuck on whichever machine they said it on.
//
// Each user's facts live in a single document: memory/{uid}
//   { facts: string[], enabled: boolean, updatedAt: serverTimestamp }

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const memoryDocRef = (uid) => doc(db, 'memory', uid);

// Small in-memory cache per uid so we don't re-fetch from Firestore on
// every keystroke/render — callers should still await the async
// functions below, but repeated reads within a session are cheap.
const cache = new Map();

async function loadDoc(uid) {
  if (!uid) return { facts: [], enabled: true };
  if (cache.has(uid)) return cache.get(uid);
  try {
    const snap = await getDoc(memoryDocRef(uid));
    const data = snap.exists() ? snap.data() : {};
    const value = {
      facts: Array.isArray(data.facts) ? data.facts : [],
      enabled: data.enabled !== false,
    };
    cache.set(uid, value);
    return value;
  } catch (err) {
    console.error('Failed to load memory from Firestore:', err);
    return { facts: [], enabled: true };
  }
}

async function saveDoc(uid, value) {
  cache.set(uid, value);
  try {
    await setDoc(memoryDocRef(uid), { ...value, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('Failed to save memory to Firestore:', err);
  }
}

export async function isMemoryEnabled(uid) {
  const { enabled } = await loadDoc(uid);
  return enabled;
}

export async function setMemoryEnabled(uid, enabled) {
  const current = await loadDoc(uid);
  const next = { ...current, enabled };
  await saveDoc(uid, next);
  return next;
}

export async function getMemories(uid) {
  const { facts } = await loadDoc(uid);
  return facts;
}

export async function addMemory(uid, fact) {
  const trimmed = fact.trim();
  if (!trimmed || !uid) return getMemories(uid);
  const current = await loadDoc(uid);
  if (current.facts.some((f) => f.toLowerCase() === trimmed.toLowerCase())) return current.facts;
  const facts = [...current.facts, trimmed];
  await saveDoc(uid, { ...current, facts });
  return facts;
}

export async function removeMemory(uid, index) {
  const current = await loadDoc(uid);
  const facts = current.facts.filter((_, i) => i !== index);
  await saveDoc(uid, { ...current, facts });
  return facts;
}

export async function clearMemories(uid) {
  const current = await loadDoc(uid);
  await saveDoc(uid, { ...current, facts: [] });
  return [];
}

// Lightweight heuristics for pulling durable facts out of a message —
// things explicitly said to be remembered, or common self-introductions.
// Not exhaustive, but covers the common "remember this" / "my name is"
// phrasing without needing a model round-trip just to detect intent.
const PATTERNS = [
  { re: /\bremember(?: that)?[:,]?\s+(.{3,200})/i, format: (m) => m[1].trim().replace(/[.!]+$/, '') },
  { re: /\bmy name is\s+([a-z][a-z '.-]{1,40})/i, format: (m) => `Their name is ${m[1].trim()}` },
  { re: /\bcall me\s+([a-z][a-z '.-]{1,40})/i, format: (m) => `They like to be called ${m[1].trim()}` },
  { re: /\bi'?m\s+(\d{1,2})\s*(?:years old|yo)\b/i, format: (m) => `They are ${m[1]} years old` },
  { re: /\bi live in\s+([a-z][a-z ,'.-]{1,60})/i, format: (m) => `They live in ${m[1].trim().replace(/[.!]+$/, '')}` },
  { re: /\bi work as (?:a |an )?([a-z][a-z ,'.-]{1,60})/i, format: (m) => `They work as ${m[1].trim().replace(/[.!]+$/, '')}` },
];

export function extractMemories(text) {
  const facts = [];
  for (const { re, format } of PATTERNS) {
    const match = text.match(re);
    if (match) facts.push(format(match));
  }
  return facts;
}
