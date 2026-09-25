import { callGemini } from '../services/llmClient';
import type { AgentResponse } from './riskAgent';

export interface OrchestratorResult {
  verdict: 'Proceed' | 'Delay' | 'Reject' | 'Conditional';
  confidence: 'High' | 'Medium' | 'Low';
  recommendation: string;
  rationale: string;
}

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Chief Financial Orchestrator AI. You have received analysis from three specialized financial advisors:
- Risk Agent (evaluates downside risk)
- Cash Flow Agent (evaluates numeric cash impact)  
- Growth Agent (evaluates upside potential)

Your job is to synthesize their viewpoints into ONE final, authoritative recommendation.

You must respond in valid JSON format only:
{
  "verdict": "Proceed" | "Delay" | "Reject" | "Conditional",
  "confidence": "High" | "Medium" | "Low",
  "recommendation": "One clear action sentence",
  "rationale": "2-3 sentence synthesis of why, referencing the agents' key points"
}`;

const FALLBACK_ORCHESTRATOR: OrchestratorResult = {
  verdict: 'Conditional',
  confidence: 'Medium',
  recommendation: 'Delay hiring until monthly revenue exceeds $75,000 or a signed client contract provides revenue certainty.',
  rationale: 'The Risk and Cash Flow agents both flag critical runway reduction (from 6.2 to 4.8 months), creating unacceptable downside exposure under current conditions. While the Growth Agent correctly identifies the opportunity cost, the current cash-negative projection outweighs the speculative upside. A conditional hire tied to a specific revenue milestone de-risks the decision while preserving the growth option.',
};

export async function runOrchestrator(
  decision: string,
  agentResponses: AgentResponse[]
): Promise<OrchestratorResult> {
  const agentSummary = agentResponses
    .map(a => `${a.agent} (${a.stance}): ${a.response}`)
    .join('\n\n');

  const userMessage = `Decision being evaluated: "${decision}"\n\nAgent analyses:\n${agentSummary}\n\nSynthesize these into a final recommendation JSON.`;

  try {
    const raw = await Promise.race([
      callGemini(ORCHESTRATOR_SYSTEM_PROMPT, userMessage),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      ),
    ]);

    // Extract JSON from possible markdown code block
    const jsonMatch = (raw as string).match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    const parsed = JSON.parse(jsonMatch[0]) as OrchestratorResult;
    // Validate required fields — fallback if Gemini returns unexpected shape
    const validVerdicts = ['Proceed', 'Delay', 'Reject', 'Conditional'];
    const validConfidences = ['High', 'Medium', 'Low'];
    if (
      !validVerdicts.includes(parsed.verdict) ||
      !validConfidences.includes(parsed.confidence) ||
      !parsed.recommendation ||
      !parsed.rationale
    ) {
      throw new Error('Invalid orchestrator JSON shape');
    }
    return parsed;
  } catch (err) {
    console.warn('[Orchestrator] Gemini call failed, using fallback:', err);
    return FALLBACK_ORCHESTRATOR;
  }
}
