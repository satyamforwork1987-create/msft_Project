import { Router, Request, Response } from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { runAnomalyDetection } from '../services/mlServiceClient';
import { DEMO_TRANSACTIONS } from '../data/demoData';

export const transactionsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory store for demo (replace with Supabase in production)
let currentTransactions: unknown[] = [];

transactionsRouter.get('/demo', async (_req: Request, res: Response) => {
  try {
    currentTransactions = DEMO_TRANSACTIONS;
    const anomalies = await runAnomalyDetection(DEMO_TRANSACTIONS).catch(() =>
      DEMO_TRANSACTIONS.map((t: any) => ({ ...t, is_anomaly: false, anomaly_score: 0, features_triggered: [] }))
    );
    res.json({ transactions: DEMO_TRANSACTIONS, anomalies, source: 'demo' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

transactionsRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    let transactions: unknown[] = [];
    const { mimetype, buffer, originalname } = req.file;

    if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
      transactions = result.data.map((row: any) => ({
        id: uuidv4(),
        date: row.date || row.Date || row.DATE,
        amount: parseFloat(row.amount || row.Amount || row.AMOUNT || '0'),
        category: row.category || row.Category || 'Uncategorized',
        description: row.description || row.Description || row.memo || '',
      }));
    } else {
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet);
      transactions = raw.map((row: any) => ({
        id: uuidv4(),
        date: row.date || row.Date || row.DATE,
        amount: parseFloat(row.amount || row.Amount || '0'),
        category: row.category || row.Category || 'Uncategorized',
        description: row.description || row.Description || row.memo || '',
      }));
    }

    currentTransactions = transactions;
    const anomalies = await runAnomalyDetection(transactions).catch(() =>
      transactions.map((t: any) => ({ ...t, is_anomaly: false, anomaly_score: 0, features_triggered: [] }))
    );

    res.json({ transactions, anomalies, source: 'upload' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

transactionsRouter.get('/current', (_req: Request, res: Response) => {
  res.json({ transactions: currentTransactions.length ? currentTransactions : DEMO_TRANSACTIONS });
});
