import { Router, Request, Response } from 'express';
import { runRiskAgent, runCashFlowAgent, runGrowthAgent } from '../agents/riskAgent';
import { runOrchestrator } from '../agents/orchestratorAgent';

export const boardroomRouter = Router();

boardroomRouter.post('/', async (req: Request, res: Response) => {
  const { decision, context } = req.body;

  if (!decision || typeof decision !== 'string') {
    res.status(400).json({ error: 'decision string is required' });
    return;
  }

  const businessContext = context || 
    'Small business with $28,000 in cash reserves, monthly revenue of $22,000, monthly expenses of $18,800, giving a monthly net of $3,200 and a 6.2-month runway.';

  try {
    // Run 3 agents in parallel with Groq (fast, snappy for UI animation)
    const [riskResult, cashFlowResult, growthResult] = await Promise.all([
      runRiskAgent(decision, businessContext),
      runCashFlowAgent(decision, businessContext),
      runGrowthAgent(decision, businessContext),
    ]);

    const agents = [riskResult, cashFlowResult, growthResult];

    // Orchestrator synthesizes with Gemini (higher quality final call)
    const orchestratorResult = await runOrchestrator(decision, agents);

    res.json({
      decision,
      agents,
      orchestrator: orchestratorResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Boardroom] Unexpected error:', err);
    res.status(500).json({ error: 'Boardroom session failed', detail: err.message });
  }
});
