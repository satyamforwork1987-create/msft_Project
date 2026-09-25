'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Brain, TrendingUp, Shield, Zap, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { api, type BoardroomResult, type AgentResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

const AGENT_ICONS = {
  'Risk Agent': Shield,
  'Cash Flow Agent': TrendingUp,
  'Growth Agent': Brain,
};

const STANCE_CONFIG = {
  Caution: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  Neutral: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  Support: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
};

const VERDICT_CONFIG = {
  Proceed: { cls: 'verdict-proceed', icon: CheckCircle2 },
  Conditional: { cls: 'verdict-conditional', icon: AlertCircle },
  Delay: { cls: 'verdict-delay', icon: Clock },
  Reject: { cls: 'verdict-reject', icon: AlertCircle },
};

const CONFIDENCE_CONFIG = {
  High: 'text-emerald-400',
  Medium: 'text-amber-400',
  Low: 'text-red-400',
};

const QUICK_DECISIONS = [
  'Hire 2 employees at $4,000/month each',
  'Cut marketing budget by 20%',
  'Delay vendor payment by 30 days',
  'Sign a $8,000/month enterprise client contract',
  'Invest $15,000 in new equipment',
];

export function BoardroomPanel() {
  const [decision, setDecision] = useState('');
  const [result, setResult] = useState<BoardroomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'agents' | 'orchestrator' | 'done'>('idle');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!decision.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPhase('agents');

    try {
      const res = await api.runBoardroom(decision);
      // Show orchestrator synthesis step for visual effect
      setPhase('orchestrator');
      await new Promise(r => setTimeout(r, 800));
      setResult(res);
      setPhase('done');
    } catch (err: any) {
      setError(err.message || 'Boardroom session failed');
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDecision = (d: string) => {
    setDecision(d);
    setResult(null);
    setPhase('idle');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Quick Decision Chips */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Try a scenario
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_DECISIONS.map((d, i) => (
            <button
              key={i}
              onClick={() => handleQuickDecision(d)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                decision === d
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={decision}
          onChange={e => setDecision(e.target.value)}
          placeholder="Describe a financial decision to debate..."
          disabled={loading}
          className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!decision.trim() || loading}
          className={cn(
            'px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2',
            decision.trim() && !loading
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {(['Risk Agent', 'Cash Flow Agent', 'Growth Agent'] as const).map((agent, i) => {
              const Icon = AGENT_ICONS[agent];
              return (
                <motion.div
                  key={agent}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{agent}</p>
                    <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/50 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground animate-pulse">Analyzing...</span>
                </motion.div>
              );
            })}
            {phase === 'orchestrator' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Orchestrator synthesizing...</p>
                  <p className="text-xs text-muted-foreground">Gemini AI generating final recommendation</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && phase === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Agent Chat Bubbles */}
            <div className="space-y-3">
              {result.agents.map((agent, i) => {
                const Icon = AGENT_ICONS[agent.agent as keyof typeof AGENT_ICONS] || Users;
                const stance = STANCE_CONFIG[agent.stance];
                return (
                  <motion.div
                    key={agent.agent}
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                    className={cn('rounded-xl border p-4', stance.bg, stance.border)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-background/30 flex items-center justify-center">
                        <div className="w-3.5 h-3.5" style={{ color: agent.color }}>
                          <Icon className="w-full h-full" />
                        </div>
                        </div>
                        <span className="font-semibold text-sm text-foreground">{agent.agent}</span>
                      </div>
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5', stance.bg, stance.border, stance.text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', stance.dot)} />
                        {agent.stance}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{agent.response}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Orchestrator Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className="rounded-xl border border-primary/30 bg-primary/5 p-5 glow-primary"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Orchestrator Final Verdict</p>
                  <p className="text-xs text-muted-foreground">Synthesized by Gemini AI</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {(() => {
                    const vc = VERDICT_CONFIG[result.orchestrator.verdict];
                    const VIcon = vc.icon;
                    return (
                      <span className={cn('flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full', vc.cls)}>
                        <VIcon className="w-4 h-4" />
                        {result.orchestrator.verdict}
                      </span>
                    );
                  })()}
                  <span className={cn('text-xs font-semibold', CONFIDENCE_CONFIG[result.orchestrator.confidence])}>
                    {result.orchestrator.confidence} confidence
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                  <p className="text-sm font-medium text-foreground">{result.orchestrator.recommendation}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{result.orchestrator.rationale}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          <p className="font-semibold mb-1">Boardroom session failed</p>
          <p className="text-red-300/70">{error}</p>
        </div>
      )}
    </div>
  );
}
