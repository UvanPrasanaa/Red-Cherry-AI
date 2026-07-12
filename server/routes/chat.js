import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';
const MAX_HISTORY_MESSAGES = 20; // keep request payloads bounded

const SYSTEM_PROMPT = `You are Red Cherry AI, a helpful, friendly assistant. Give clear, accurate, well-structured answers. When helping with code, explain briefly and keep examples correct and runnable.`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Request must include a non-empty "messages" array.' });
    }

    // Only forward the fields Groq expects, and only the most recent turns.
    const trimmed = messages
      .slice(-MAX_HISTORY_MESSAGES)
      .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'No valid messages to send.' });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({ error: 'Model returned an empty response. Please try again.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Groq API error:', err?.message || err);

    if (err?.status === 401) {
      return res.status(500).json({ error: 'Server misconfiguration: invalid Groq API key.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'Groq rate limit reached. Please wait a moment and try again.' });
    }

    res.status(500).json({ error: 'Something went wrong talking to the AI. Please try again.' });
  }
});

export default router;
