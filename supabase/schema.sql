-- FinSight AI — Supabase Schema
-- Run this in your Supabase SQL Editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Businesses ───────────────────────────────────────────────────────────────
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- Row Level Security
alter table businesses enable row level security;
create policy "Users can manage their own business"
  on businesses for all
  using (auth.uid() = user_id);

-- ── Transactions ─────────────────────────────────────────────────────────────
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  date date not null,
  amount numeric(12, 2) not null,
  category text not null default 'Uncategorized',
  description text,
  is_anomaly boolean default false,
  anomaly_score numeric(5, 3),
  features_triggered text[],
  created_at timestamptz default now()
);

create index if not exists idx_transactions_business_id on transactions(business_id);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_transactions_is_anomaly on transactions(is_anomaly);

alter table transactions enable row level security;
create policy "Users can manage transactions for their businesses"
  on transactions for all
  using (
    business_id in (
      select id from businesses where user_id = auth.uid()
    )
  );

-- ── Boardroom Sessions ────────────────────────────────────────────────────────
create table if not exists boardroom_sessions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  decision text not null,
  context text,
  risk_agent_response jsonb,
  cashflow_agent_response jsonb,
  growth_agent_response jsonb,
  orchestrator_result jsonb,
  created_at timestamptz default now()
);

alter table boardroom_sessions enable row level security;
create policy "Users can access their boardroom sessions"
  on boardroom_sessions for all
  using (
    business_id in (
      select id from businesses where user_id = auth.uid()
    )
  );

-- ── Forecasts ─────────────────────────────────────────────────────────────────
create table if not exists forecasts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  generated_at timestamptz default now(),
  trend text check (trend in ('up', 'down', 'stable')),
  summary text,
  forecast_data jsonb not null,
  transaction_count integer
);

alter table forecasts enable row level security;
create policy "Users can access their forecasts"
  on forecasts for all
  using (
    business_id in (
      select id from businesses where user_id = auth.uid()
    )
  );
