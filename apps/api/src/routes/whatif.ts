import { Router, Request, Response } from 'express';
import { runWhatIf } from '../services/mlServiceClient';
import { DEMO_TRANSACTIONS, DEMO_WHATIF } from '../data/demoData';

export const whatifRouter = Router();

whatifRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { transactions, scenario } = req.body;
    if (!scenario || typeof scenario.monthly_delta !== 'number') {
      res.status(400).json({ error: 'scenario.monthly_delta is required' });
      return;
    }
    const data = transactions?.length ? transactions : DEMO_TRANSACTIONS;
    const result = await runWhatIf(data, scenario);
    res.json(result);
  } catch (err: any) {
    console.warn('[WhatIf] ML service unavailable, using demo what-if');
    const { scenario } = req.body;
    const delta = scenario?.monthly_delta ?? -8000;
    res.json({ ...DEMO_WHATIF, monthly_delta: delta });
  }
});
