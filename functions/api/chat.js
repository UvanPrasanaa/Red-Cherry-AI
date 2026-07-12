// Cloudflare Pages Function
// This runs on Cloudflare's Workers runtime and is automatically served at:
//   https://<your-site>.pages.dev/api/chat
// No separate backend host needed — it lives in the same project as your frontend.
//
// Required: set GROQ_API_KEY as an environment variable / secret in
// Cloudflare Pages → Settings → Environment variables (Production + Preview).

const MODEL = 'llama-3.3-70b-versatile';
const MAX_HISTORY_MESSAGES = 20; // keep request payloads bounded
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Red Cherry AI, a helpful, friendly assistant. Give clear, accurate, well-structured answers. When helping with code, explain briefly and keep examples correct and runnable.`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in Cloudflare Pages environment variables.');
    return json({ error: 'Server misconfiguration: missing Groq API key.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { messages } = body || {};

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

  try {
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (groqRes.status === 401) {
      console.error('Groq API rejected the key (401).');
      return json({ error: 'Server misconfiguration: invalid Groq API key.' }, 500);
    }
    if (groqRes.status === 429) {
      return json({ error: 'Groq rate limit reached. Please wait a moment and try again.' }, 429);
    }
    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => '');
      console.error('Groq API error:', groqRes.status, errText);
      return json({ error: 'Something went wrong talking to the AI. Please try again.' }, 502);
    }

    const completion = await groqRes.json();
    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return json({ error: 'Model returned an empty response. Please try again.' }, 502);
    }

    return json({ reply });
  } catch (err) {
    console.error('Groq API error:', err?.message || err);
    return json({ error: 'Something went wrong talking to the AI. Please try again.' }, 500);
  }
}

// Reject non-POST methods on this route.
export async function onRequestGet() {
  return json({ error: 'Method not allowed. Use POST.' }, 405);
}
