'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Sparkles, ArrowRight, BarChart2, Shield, Brain, TrendingUp, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Anomaly Detection',
    desc: 'IsolationForest ML model flags unusual transactions with explainable feature-level reasoning.',
    color: '#ef4444',
  },
  {
    icon: TrendingUp,
    title: '30-Day Cash Flow Forecast',
    desc: 'Prophet time-series model predicts your cash position with confidence bands.',
    color: '#6366f1',
  },
  {
    icon: Brain,
    title: 'AI Boardroom',
    desc: 'Three specialized AI agents debate your decisions in parallel — Risk, Cash Flow, and Growth.',
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'What-If Simulator',
    desc: 'Recompute your financial forecast under any hypothetical decision in real time.',
    color: '#06b6d4',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await api.loadDemoData();
      router.push('/dashboard');
    } catch {
      router.push('/dashboard'); // navigate anyway, dashboard has its own data loading
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      await api.uploadFile(file);
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg gradient-text">FinSight AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
          >
            Dashboard →
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Agent Explainable Financial Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Your AI-Powered
            <br />
            <span className="gradient-text">Financial Boardroom</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your transactions and watch three AI agents debate your financial decisions in real time —
            detecting anomalies, forecasting cash flow, and generating plain-English recommendations.
          </p>

          {/* Upload Area */}
          <div className="max-w-lg mx-auto">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className={`relative rounded-2xl border-2 border-dashed transition-all p-8 mb-4 cursor-pointer ${
                dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-card/50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
              />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-semibold mb-1">Drop your CSV or Excel file here</p>
              <p className="text-sm text-muted-foreground">Supports .csv, .xlsx — any standard bank/accounting export</p>
            </motion.div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadDemo}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 glow-primary"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Launch with Demo Data
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Pre-loaded with 6 months of realistic small business data
            </p>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
                className="rounded-xl border border-border bg-card/60 p-5 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground mb-3">Powered by</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Next.js 14', 'FastAPI', 'IsolationForest', 'Prophet', 'Gemini AI', 'Groq', 'Supabase', 'Framer Motion'].map(tech => (
              <span key={tech} className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
