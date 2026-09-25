import { Router, Request, Response } from 'express';
import { runForecast } from '../services/mlServiceClient';
import { DEMO_TRANSACTIONS, DEMO_FORECAST } from '../data/demoData';

export const forecastRouter = Router();

forecastRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body;
    const data = transactions?.length ? transactions : DEMO_TRANSACTIONS;
    const result = await runForecast(data);
    res.json(result);
  } catch (err: any) {
    console.warn('[Forecast] ML service unavailable, using demo forecast');
    res.json(DEMO_FORECAST);
  }
});

forecastRouter.get('/demo', async (_req: Request, res: Response) => {
  try {
    const result = await runForecast(DEMO_TRANSACTIONS);
    res.json(result);
  } catch {
    res.json(DEMO_FORECAST);
  }
});
