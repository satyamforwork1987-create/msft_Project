const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  is_anomaly?: boolean;
  anomaly_score?: number;
  features_triggered?: string[];
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

export interface AgentResponse {
  agent: string;
  persona: string;
  response: string;
  stance: 'Caution' | 'Neutral' | 'Support';
  color: string;
}

export interface OrchestratorResult {
  verdict: 'Proceed' | 'Delay' | 'Reject' | 'Conditional';
  confidence: 'High' | 'Medium' | 'Low';
  recommendation: string;
  rationale: string;
}

export interface BoardroomResult {
  decision: string;
  agents: AgentResponse[];
  orchestrator: OrchestratorResult;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  category: string;
  icon: string;
  relatedTransactionIds: string[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
  anomalies: Transaction[];
  source: 'demo' | 'upload';
}

// ── API Methods ────────────────────────────────────────────────────────────────
export const api = {
  loadDemoData: () =>
    apiFetch<TransactionsResponse>('/api/transactions/demo'),

  uploadFile: async (file: File): Promise<TransactionsResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/transactions/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as any).error || `Upload error ${res.status}`);
    }
    return res.json();
  },

  getForecast: (transactions?: Transaction[]) =>
    apiFetch<ForecastResult>('/api/forecast', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),

  getDemoForecast: () =>
    apiFetch<ForecastResult>('/api/forecast/demo'),

  runWhatIf: (
    scenario: { monthly_delta: number; description: string },
    transactions?: Transaction[]
  ) =>
    apiFetch<WhatIfResult>('/api/whatif', {
      method: 'POST',
      body: JSON.stringify({ scenario, transactions }),
    }),

  runBoardroom: (decision: string, context?: string) =>
    apiFetch<BoardroomResult>('/api/boardroom', {
      method: 'POST',
      body: JSON.stringify({ decision, context }),
    }),
};
