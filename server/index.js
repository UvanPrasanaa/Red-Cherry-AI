import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!process.env.GROQ_API_KEY) {
  console.warn(
    '\n⚠️  GROQ_API_KEY is not set. Copy server/.env.example to server/.env and add your key.\n' +
    '   Get a free key at https://console.groq.com/keys\n'
  );
}

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// Basic abuse protection — 30 requests per minute per IP.
// Tune this to taste once you have real usage numbers.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});

app.use('/api/chat', chatLimiter, chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'red-cherry-ai-server' });
});

app.listen(PORT, () => {
  console.log(`Red Cherry AI server running on http://localhost:${PORT}`);
});
