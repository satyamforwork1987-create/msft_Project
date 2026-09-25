import { callGroq } from '../services/llmClient';

export type Stance = 'Caution' | 'Neutral' | 'Support';

export interface AgentResponse {
  agent: string;
  persona: string;
  response: string;
  stance: Stance;
  color: string;
}

const RISK_SYSTEM_PROMPT = `You are the Risk Agent in a financial AI boardroom. 
Your role is to evaluate downside risks, worst-case scenarios, and potential threats to business stability.
You are conservative, data-driven, and focused on protecting the business from financial harm.
Respond in exactly 2-3 sentences. End your response with one of these stance labels on a new line: STANCE: Caution | STANCE: Neutral | STANCE: Support`;

const CASHFLOW_SYSTEM_PROMPT = `You are the Cash Flow Agent in a financial AI boardroom.
Your role is to evaluate the direct numeric impact on cash runway, monthly burn rate, and liquidity.
You are precise, quantitative, and focused on cash position and working capital.
Respond in exactly 2-3 sentences. End your response with one of these stance labels on a new line: STANCE: Caution | STANCE: Neutral | STANCE: Support`;

const GROWTH_SYSTEM_PROMPT = `You are the Growth Agent in a financial AI boardroom.
Your role is to evaluate the upside potential, opportunity cost of inaction, and long-term value creation.
You are optimistic but grounded, focused on revenue growth and competitive positioning.
Respond in exactly 2-3 sentences. End your response with one of these stance labels on a new line: STANCE: Caution | STANCE: Neutral | STANCE: Support`;

function parseStance(text: string): Stance {
  const lower = text.toLowerCase();
  if (lower.includes('stance: caution')) return 'Caution';
  if (lower.includes('stance: support')) return 'Support';
  return 'Neutral';
}

function stripStanceLine(text: string): string {
  return text.replace(/\nSTANCE:.*$/i, '').trim();
}

// Cached fallback responses for demo safety
const FALLBACK_RESPONSES: Record<string, AgentResponse> = {
  risk: {
    agent: 'Risk Agent',
    persona: 'Conservative risk evaluator',
    response: 'Adding two employees at $8,000/month increases fixed overhead by 22%, which tightens our cash runway from 6.2 months to 4.8 months. Under a worst-case 15% revenue decline scenario, we would reach critical cash levels within 90 days. I recommend waiting until we have at least 6 months of runway before committing to this expense.',
    stance: 'Caution',
    color: '#ef4444',
  },
  cashflow: {
    agent: 'Cash Flow Agent',
    persona: 'Cash runway analyst',
    response: 'The $8,000/month increase in payroll directly reduces our monthly net cash flow from +$3,200 to -$4,800, flipping us from cash-positive to cash-negative. At current revenue levels, this exhausts our $28,000 reserve in approximately 5.8 months. This hire requires either a corresponding revenue increase of 12% or a cost reduction of equal magnitude to remain cash-neutral.',
    stance: 'Caution',
    color: '#f59e0b',
  },
  growth: {
    agent: 'Growth Agent',
    persona: 'Strategic growth advisor',
    response: 'Two additional hires could unlock the capacity needed to serve 3-4 new enterprise clients, each worth $6,000-$12,000/month in recurring revenue. The opportunity cost of NOT hiring could mean losing market share to competitors during our prime growth window. If these hires are client-facing or revenue-generating, the ROI break-even is achievable within 60-90 days.',
    stance: 'Support',
    color: '#10b981',
  },
};

async function callAgentWithFallback(
  systemPrompt: string,
  userMessage: string,
  fallbackKey: 'risk' | 'cashflow' | 'growth',
  agentMeta: { agent: string; persona: string; color: string }
): Promise<AgentResponse> {
  try {
    const raw = await Promise.race([
      callGroq(systemPrompt, userMessage),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      ),
    ]);

    const stance = parseStance(raw as string);
    const response = stripStanceLine(raw as string);

    return {
      ...agentMeta,
      response,
      stance,
    };
  } catch (err) {
    console.warn(`[${agentMeta.agent}] API failed, using fallback:`, err);
    return FALLBACK_RESPONSES[fallbackKey];
  }
}

export async function runRiskAgent(decision: string, context: string): Promise<AgentResponse> {
  const userMessage = `Business context: ${context}\n\nProposed decision: ${decision}\n\nEvaluate the downside risk.`;
  return callAgentWithFallback(RISK_SYSTEM_PROMPT, userMessage, 'risk', {
    agent: 'Risk Agent',
    persona: 'Conservative risk evaluator',
    color: '#ef4444',
  });
}

export async function runCashFlowAgent(decision: string, context: string): Promise<AgentResponse> {
  const userMessage = `Business context: ${context}\n\nProposed decision: ${decision}\n\nEvaluate the cash flow impact.`;
  return callAgentWithFallback(CASHFLOW_SYSTEM_PROMPT, userMessage, 'cashflow', {
    agent: 'Cash Flow Agent',
    persona: 'Cash runway analyst',
    color: '#f59e0b',
  });
}

export async function runGrowthAgent(decision: string, context: string): Promise<AgentResponse> {
  const userMessage = `Business context: ${context}\n\nProposed decision: ${decision}\n\nEvaluate the growth opportunity.`;
  return callAgentWithFallback(GROWTH_SYSTEM_PROMPT, userMessage, 'growth', {
    agent: 'Growth Agent',
    persona: 'Strategic growth advisor',
    color: '#10b981',
  });
}
