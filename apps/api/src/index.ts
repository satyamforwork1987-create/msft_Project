import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { transactionsRouter } from './routes/transactions';
import { forecastRouter } from './routes/forecast';
import { whatifRouter } from './routes/whatif';
import { boardroomRouter } from './routes/boardroom';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean) as string[];

    // Allow requests with no origin (mobile, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain for previews
    if (origin.endsWith('.vercel.app') || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'finsight-ai-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/whatif', whatifRouter);
app.use('/api/boardroom', boardroomRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FinSight AI API running on http://localhost:${PORT}`);
});

export default app;
