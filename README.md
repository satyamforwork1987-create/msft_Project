# FinSight AI 🏛️

> **Multi-agent explainable financial intelligence platform for small businesses**

FinSight AI is a hackathon project that combines ML anomaly detection, time-series forecasting, and a live AI Boardroom where three specialized agents debate your financial decisions in real time.

---

## 🏗️ Monorepo Structure

```
finsight-ai/
├── apps/
│   ├── web/          # Next.js 14 frontend (Vercel)
│   └── api/          # Node.js/Express backend (Render/Railway)
├── services/
│   └── ml-engine/    # Python FastAPI — IsolationForest + Prophet
└── supabase/
    └── schema.sql    # PostgreSQL schema with RLS
```

---

## ⚡ Quick Start (Local Demo)

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm / pip

### 1. Clone & Environment Setup
```bash
git clone <your-repo>
cd finsight-ai
cp .env.example .env
# Fill in your API keys (Gemini, Groq, Supabase)
```

### 2. Start the ML Service (FastAPI)
```bash
cd services/ml-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the API (Node.js)
```bash
cd apps/api
npm install
npm run dev  # Runs on http://localhost:8080
```

### 4. Start the Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev  # Runs on http://localhost:3000
```

Open **http://localhost:3000** and click **"Launch with Demo Data"** — no API keys needed for the core features!

---

## 🎯 Feature Overview

### 1. Upload or Demo Data
Upload a CSV/Excel of transactions, or click "Launch with Demo Data" to use 71 pre-loaded realistic transactions for a SaaS consulting business.

### 2. Anomaly Detection
- Algorithm: **IsolationForest** (200 trees, 8% contamination)
- Features: amount z-score per category, day-of-week, transaction size, category frequency
- Each anomaly shows the exact features that triggered the flag

### 3. 30-Day Cash Flow Forecast
- Model: **Prophet** (with EWMA fallback)
- Outputs: predicted cash position + 80% confidence bands
- Auto-generated plain-English trend summary

### 4. 🏛️ AI Boardroom (The Differentiator)
Three agents run **in parallel** via `Promise.all()`:

| Agent | Model | Role |
|-------|-------|------|
| Risk Agent | Groq llama-3.1-8b-instant | Downside risk & worst-case |
| Cash Flow Agent | Groq llama-3.1-8b-instant | Runway & liquidity impact |
| Growth Agent | Groq llama-3.1-8b-instant | Upside & opportunity cost |
| **Orchestrator** | **Gemini 1.5 Flash** | **Final synthesized verdict** |

- Each agent responds with a **stance**: Caution / Neutral / Support
- Staggered Framer Motion animation makes it feel like a live boardroom
- 5-second timeout with pre-written fallback ensures **demo never breaks**

### 5. What-If Simulator
Pick a scenario (hire employees, cut marketing, delay vendors) and see the recomputed 30-day forecast vs. baseline with runway impact.

### 6. Explainability Drawer
Click any anomaly or recommendation to open a slide-in panel showing:
- IsolationForest feature contributions
- Anomaly score with visual bar
- Related transactions

### 7. Recommendations (Rule-Based)
Plain-English recommendations from the anomaly + forecast pipeline — **zero API dependency**, always works.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend API | Node.js + Express + TypeScript |
| ML Service | Python + FastAPI |
| Anomaly Detection | scikit-learn IsolationForest |
| Forecasting | Prophet (Facebook) |
| AI — Fast Agents | Groq (llama-3.1-8b-instant) |
| AI — Orchestrator | Google Gemini 1.5 Flash |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel (frontend) + Render (API + ML) |

---

## 🔑 Environment Variables

See `.env.example` for all required variables. The minimum for a working local demo:

```bash
# Only needed for AI Boardroom live calls
GEMINI_API_KEY=...
GROQ_API_KEY=...

# The rest is optional — demo data doesn't need Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd apps/web
vercel --prod
```
Set `NEXT_PUBLIC_API_URL` to your Railway/Render API URL.

### API + ML → Railway (recommended)
Both `apps/api` and `services/ml-engine` can be deployed as separate Railway services.
Set `ML_SERVICE_URL` in the API service environment to the FastAPI service URL.

---

## 📊 Demo Dataset
The demo dataset (`apps/api/src/data/demoData.ts`) simulates 6 months of a growing SaaS consulting business:
- 71 transactions across Revenue, Payroll, Marketing, SaaS, Office, Rent, Equipment, Travel, Legal categories
- 4 pre-flagged anomalies (emergency server, team offsite, trade show, large Q2 project kickoff)
- Growing revenue trend: 3 new clients added over April–June

---

## 🎨 Design System
- **Dark mode default** with light mode toggle
- CSS variables for theming (shadcn/ui pattern)
- Glassmorphism cards, gradient text, glow effects
- Responsive grid layout

---

*Built for hackathon demo. Prioritizes reliability and visual polish over production hardening.*
