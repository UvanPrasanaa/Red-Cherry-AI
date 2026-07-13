// Cloudflare Pages Function
// This runs on Cloudflare's Workers runtime and is automatically served at:
//   https://<your-site>.pages.dev/api/chat
// No separate backend host needed — it lives in the same project as your frontend.
//
// Required: set GEMINI_API_KEY as an environment variable / secret in
// Cloudflare Pages → Settings → Environment variables (Production + Preview).
// Get a key from https://aistudio.google.com/apikey

const MODEL = 'gemini-3.5-flash';
const MAX_HISTORY_MESSAGES = 20; // keep request payloads bounded
const MAX_MEMORY_FACTS = 30; // keep the system prompt bounded
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const BASE_SYSTEM_PROMPT = `You are Red Cherry AI, a helpful, friendly assistant. Answer in a single paragraph by default — no headers, no bullet lists — unless the user's question genuinely needs step-by-step instructions, code, or a list to be understood, in which case use the minimum structure necessary. Give clear, accurate answers. When helping with code, explain briefly and keep examples correct and runnable.

Only if the user explicitly asks who made/created/built/owns you, who your developer or owner is, or similar (e.g. "who created you", "who is your owner", "who made this"), respond with exactly one sentence: "I was developed by Uvan Prasanaa V (Developer) and Sukesh D (Co-Developer)." Do not mention this unprompted, and do not mention Google, Gemini, or any other underlying model/provider by name — if asked what model or engine you run on, say you're powered by Red Cherry AI's own Nemo - 1 model.

The user may have shared personal details or asked you to remember something in past conversations; these are listed below under "Things to remember about this user," if any. Use them naturally when relevant, the way a friend who already knows you would — don't recite the list back or announce that you're using stored information.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// Handle the browser's CORS preflight request.
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in Cloudflare Pages environment variables.');
    return json({ error: 'Server misconfiguration: missing Gemini API key.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { messages, memory } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'Request must include a non-empty "messages" array.' }, 400);
  }

  const trimmed = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

  if (trimmed.length === 0) {
    return json({ error: 'No valid messages to send.' }, 400);
  }

  // Long-term memory facts the client has captured from things the user
  // said (e.g. "remember I'm vegetarian", "my name is..."). These persist
  // in the user's browser and are sent with every request so the model
  // has continuity without us needing a database.
  const memoryFacts = Array.isArray(memory)
    ? memory
        .filter((m) => typeof m === 'string' && m.trim())
        .slice(0, MAX_MEMORY_FACTS)
        .map((m) => m.trim().slice(0, 300))
    : [];

  const systemPrompt =
    memoryFacts.length > 0
      ? `${BASE_SYSTEM_PROMPT}\n\nThings to remember about this user:\n${memoryFacts.map((f) => `- ${f}`).join('\n')}`
      : BASE_SYSTEM_PROMPT;

  // Gemini has no separate system-message role in the contents array;
  // it's passed via systemInstruction instead. Roles otherwise map
  // user -> user, assistant -> model.
  const contents = trimmed.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (geminiRes.status === 401 || geminiRes.status === 403) {
      console.error('Gemini API rejected the key:', geminiRes.status);
      return json({ error: 'Server misconfiguration: invalid Gemini API key.' }, 500);
    }
    if (geminiRes.status === 429) {
      return json({ error: 'Rate limit reached. Please wait a moment and try again.' }, 429);
    }
    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('Gemini API error:', geminiRes.status, errText);
      return json({ error: 'Something went wrong talking to the AI. Please try again.' }, 502);
    }

    const completion = await geminiRes.json();
    const reply = completion.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();

    if (!reply) {
      return json({ error: 'Model returned an empty response. Please try again.' }, 502);
    }

    return json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err?.message || err);
    return json({ error: 'Something went wrong talking to the AI. Please try again.' }, 500);
  }
}

// Reject non-POST methods on this route.
export async function onRequestGet() {
  return json({ error: 'Method not allowed. Use POST.' }, 405);
}
