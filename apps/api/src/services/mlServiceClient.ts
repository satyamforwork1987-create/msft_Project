import dotenv from 'dotenv';
dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface AnomalyResult {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  anomaly_score: number;
  is_anomaly: boolean;
  features_triggered: string[];
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface ForecastResult {
  forecast: ForecastPoint[];
  trend: 'up' | 'down' | 'stable';
  summary: string;
}

export interface WhatIfResult {
  baseline_runway: number;
  adjusted_runway: number;
  impact_30d: number;
  impact_90d: number;
  monthly_delta: number;
  forecast: ForecastPoint[];
}

async function fetchML<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${ML_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ML service error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function runAnomalyDetection(transactions: unknown[]): Promise<AnomalyResult[]> {
  return fetchML<AnomalyResult[]>('/anomaly', { transactions });
}

export async function runForecast(transactions: unknown[]): Promise<ForecastResult> {
  return fetchML<ForecastResult>('/forecast', { transactions });
}

export async function runWhatIf(transactions: unknown[], scenario: {
  monthly_delta: number;
  description: string;
}): Promise<WhatIfResult> {
  return fetchML<WhatIfResult>('/whatif', { transactions, scenario });
}
