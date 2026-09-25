'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { BarChart2, Sun, Moon, ArrowLeft, Info } from 'lucide-react';
import { BoardroomPanel } from '@/components/BoardroomPanel';

export default function BoardroomPage() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const [initialDecision, setInitialDecision] = useState('');

  useEffect(() => {
    const d = searchParams.get('decision');
    if (d) setInitialDecision(decodeURIComponent(d));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <span className="text-border">|</span>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <BarChart2 className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm gradient-text">FinSight AI</span>
            </Link>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl">
              🏛️
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">AI Boardroom</h1>
              <p className="text-sm text-muted-foreground">Multi-agent financial decision simulator</p>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card/60 p-4 flex gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>
                <span className="text-foreground font-medium">How it works: </span>
                Type or select a financial decision. Three specialized AI agents analyze it in parallel using{' '}
                <span className="text-primary font-medium">Groq</span> (ultra-fast inference), then a master{' '}
                <span className="text-purple-400 font-medium">Gemini Orchestrator</span> synthesizes their arguments into a final verdict.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                ⚡ 5-second timeout with graceful fallback — the demo never breaks.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Agent Personas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { emoji: '🛡️', name: 'Risk Agent', desc: 'Downside risk & worst-case analysis', color: '#ef4444' },
            { emoji: '💰', name: 'Cash Flow Agent', desc: 'Numeric runway & liquidity impact', color: '#f59e0b' },
            { emoji: '🚀', name: 'Growth Agent', desc: 'Upside & opportunity cost', color: '#10b981' },
          ].map(agent => (
            <div key={agent.name} className="rounded-xl border border-border bg-card p-3 text-center">
              <span className="text-2xl block mb-1">{agent.emoji}</span>
              <p className="font-semibold text-xs text-foreground">{agent.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{agent.desc}</p>
              <div className="mt-1.5 h-0.5 rounded-full mx-auto w-8" style={{ background: agent.color }} />
            </div>
          ))}
        </motion.div>

        {/* Boardroom Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <BoardroomPanel />
        </motion.div>

        {/* Architecture Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground"
        >
          <p className="font-semibold text-foreground mb-1">Architecture</p>
          <p>
            3 Groq (llama-3.1-8b-instant) calls run via <code className="text-primary">Promise.all()</code> on the Node.js backend.
            The Orchestrator then calls <code className="text-purple-400">gemini-1.5-flash</code> with all three agent outputs
            to produce the synthesized verdict. Both have 5s timeout fallbacks pre-written for demo safety.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
