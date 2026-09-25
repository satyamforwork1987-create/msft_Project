// Realistic synthetic demo data for a small SaaS/consulting business
// This data is always preloaded so the live demo never depends on a working upload

export const DEMO_TRANSACTIONS = [
  // === JANUARY 2024 ===
  { id: 't001', date: '2024-01-02', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't002', date: '2024-01-05', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jan Week 1' },
  { id: 't003', date: '2024-01-08', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't004', date: '2024-01-10', amount: 5200, category: 'Revenue', description: 'Project Invoice - Nexus Ltd' },
  { id: 't005', date: '2024-01-12', amount: -1200, category: 'Marketing', description: 'Google Ads Campaign' },
  { id: 't006', date: '2024-01-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jan Week 3' },
  { id: 't007', date: '2024-01-18', amount: -450, category: 'Office', description: 'Office Supplies' },
  { id: 't008', date: '2024-01-20', amount: 3400, category: 'Revenue', description: 'Consulting - BlueSky Inc' },
  { id: 't009', date: '2024-01-22', amount: -2100, category: 'Software', description: 'Annual Software Licenses' },
  { id: 't010', date: '2024-01-25', amount: -800, category: 'Marketing', description: 'LinkedIn Ads' },
  { id: 't011', date: '2024-01-28', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jan Week 4' },
  { id: 't012', date: '2024-01-30', amount: -1800, category: 'Rent', description: 'Office Rent - January' },

  // === FEBRUARY 2024 ===
  { id: 't013', date: '2024-02-01', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't014', date: '2024-02-05', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Feb Week 1' },
  { id: 't015', date: '2024-02-07', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't016', date: '2024-02-09', amount: 7800, category: 'Revenue', description: 'New Project - TechFlow' },
  { id: 't017', date: '2024-02-12', amount: -15200, category: 'Equipment', description: 'Emergency Server Replacement', anomalyHint: true },
  { id: 't018', date: '2024-02-14', amount: -1200, category: 'Marketing', description: 'Valentine Campaign' },
  { id: 't019', date: '2024-02-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Feb Week 3' },
  { id: 't020', date: '2024-02-20', amount: 4100, category: 'Revenue', description: 'Consulting - Vertex Corp' },
  { id: 't021', date: '2024-02-22', amount: -850, category: 'SaaS', description: 'Slack, Notion, Figma licenses' },
  { id: 't022', date: '2024-02-26', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Feb Week 4' },
  { id: 't023', date: '2024-02-28', amount: -1800, category: 'Rent', description: 'Office Rent - February' },

  // === MARCH 2024 ===
  { id: 't024', date: '2024-03-01', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't025', date: '2024-03-04', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Mar Week 1' },
  { id: 't026', date: '2024-03-06', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't027', date: '2024-03-08', amount: 6500, category: 'Revenue', description: 'Project Invoice - Meridian' },
  { id: 't028', date: '2024-03-10', amount: -3200, category: 'Marketing', description: 'Trade Show Expense', anomalyHint: true },
  { id: 't029', date: '2024-03-12', amount: 2100, category: 'Revenue', description: 'Upsell - Nexus Ltd' },
  { id: 't030', date: '2024-03-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Mar Week 3' },
  { id: 't031', date: '2024-03-18', amount: -650, category: 'Office', description: 'Team Lunch & Utilities' },
  { id: 't032', date: '2024-03-20', amount: 4800, category: 'Revenue', description: 'New Client Onboarding - Crest' },
  { id: 't033', date: '2024-03-22', amount: -1200, category: 'Marketing', description: 'SEO Services' },
  { id: 't034', date: '2024-03-26', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Mar Week 4' },
  { id: 't035', date: '2024-03-29', amount: -1800, category: 'Rent', description: 'Office Rent - March' },

  // === APRIL 2024 ===
  { id: 't036', date: '2024-04-01', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't037', date: '2024-04-02', amount: 5500, category: 'Revenue', description: 'Client Retainer - Crest (new)' },
  { id: 't038', date: '2024-04-05', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Apr Week 1' },
  { id: 't039', date: '2024-04-07', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't040', date: '2024-04-09', amount: 4200, category: 'Revenue', description: 'Project Invoice - BlueSky Inc' },
  { id: 't041', date: '2024-04-11', amount: -1200, category: 'Marketing', description: 'Content Marketing' },
  { id: 't042', date: '2024-04-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Apr Week 3' },
  { id: 't043', date: '2024-04-17', amount: -550, category: 'SaaS', description: 'HubSpot CRM' },
  { id: 't044', date: '2024-04-19', amount: 8900, category: 'Revenue', description: 'Q2 Project Kickoff - TechFlow', anomalyHint: true },
  { id: 't045', date: '2024-04-22', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Apr Week 4' },
  { id: 't046', date: '2024-04-25', amount: -2400, category: 'Legal', description: 'Legal Retainer - Contract Review' },
  { id: 't047', date: '2024-04-30', amount: -1800, category: 'Rent', description: 'Office Rent - April' },

  // === MAY 2024 ===
  { id: 't048', date: '2024-05-01', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't049', date: '2024-05-01', amount: 5500, category: 'Revenue', description: 'Client Retainer - Crest' },
  { id: 't050', date: '2024-05-05', amount: -4200, category: 'Payroll', description: 'Staff Payroll - May Week 1' },
  { id: 't051', date: '2024-05-07', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't052', date: '2024-05-10', amount: 6800, category: 'Revenue', description: 'Project Invoice - Meridian' },
  { id: 't053', date: '2024-05-13', amount: -1800, category: 'Marketing', description: 'Paid Social Campaign' },
  { id: 't054', date: '2024-05-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - May Week 3' },
  { id: 't055', date: '2024-05-18', amount: -9500, category: 'Travel', description: 'Team Offsite - Q2 Planning', anomalyHint: true },
  { id: 't056', date: '2024-05-20', amount: 3200, category: 'Revenue', description: 'Consulting - Vertex Corp' },
  { id: 't057', date: '2024-05-24', amount: -4200, category: 'Payroll', description: 'Staff Payroll - May Week 4' },
  { id: 't058', date: '2024-05-28', amount: -1800, category: 'Rent', description: 'Office Rent - May' },
  { id: 't059', date: '2024-05-30', amount: 4500, category: 'Revenue', description: 'New Client - Orbital AI' },

  // === JUNE 2024 ===
  { id: 't060', date: '2024-06-01', amount: 18500, category: 'Revenue', description: 'Client Retainer - Apex Corp' },
  { id: 't061', date: '2024-06-01', amount: 5500, category: 'Revenue', description: 'Client Retainer - Crest' },
  { id: 't062', date: '2024-06-03', amount: 4500, category: 'Revenue', description: 'Client Retainer - Orbital AI' },
  { id: 't063', date: '2024-06-05', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jun Week 1' },
  { id: 't064', date: '2024-06-07', amount: -890, category: 'SaaS', description: 'AWS Cloud Services' },
  { id: 't065', date: '2024-06-10', amount: 5200, category: 'Revenue', description: 'Project Invoice - TechFlow' },
  { id: 't066', date: '2024-06-12', amount: -1200, category: 'Marketing', description: 'Google Ads' },
  { id: 't067', date: '2024-06-15', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jun Week 3' },
  { id: 't068', date: '2024-06-18', amount: 7200, category: 'Revenue', description: 'New Project - NeuralStack' },
  { id: 't069', date: '2024-06-20', amount: -650, category: 'Office', description: 'Office Expenses' },
  { id: 't070', date: '2024-06-24', amount: -4200, category: 'Payroll', description: 'Staff Payroll - Jun Week 4' },
  { id: 't071', date: '2024-06-28', amount: -1800, category: 'Rent', description: 'Office Rent - June' },
];

// Pre-computed 30-day forecast (Prophet output)
const today = new Date();
const generateForecast = () => {
  const points = [];
  let base = 28000; // current cash balance
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    // Simulate typical monthly pattern
    const dayOfMonth = d.getDate();
    let delta = 0;
    if (dayOfMonth === 1) delta = 22000; // revenue
    if (dayOfMonth === 5 || dayOfMonth === 15 || dayOfMonth === 25) delta = -4200; // payroll
    if (dayOfMonth === 7) delta = -890; // AWS
    if (dayOfMonth === 12 || dayOfMonth === 22) delta = -1200; // marketing
    if (dayOfMonth === 28) delta = -1800; // rent
    base += delta;
    const noise = (Math.random() - 0.5) * 800;
    points.push({
      date: dateStr,
      predicted: Math.round(base + noise),
      lower: Math.round(base + noise - 2400),
      upper: Math.round(base + noise + 2400),
    });
  }
  return points;
};

export const DEMO_FORECAST = {
  forecast: generateForecast(),
  trend: 'up' as const,
  summary: 'Cash position projected to grow 12% over 30 days driven by recurring retainer revenue. Payroll remains the largest expense category at 58% of monthly outflows.',
};

export const DEMO_WHATIF = {
  baseline_runway: 6.2,
  adjusted_runway: 4.8,
  impact_30d: -8000,
  impact_90d: -24000,
  monthly_delta: -8000,
  forecast: generateForecast().map(p => ({
    ...p,
    predicted: p.predicted - 8000,
    lower: p.lower - 8000,
    upper: p.upper - 8000,
  })),
};

// Rule-based recommendations (always works, zero API dependency)
export const DEMO_RECOMMENDATIONS = [
  {
    id: 'rec-001',
    priority: 'high',
    title: 'Server replacement expense flagged as anomaly',
    detail: 'The $15,200 emergency server replacement in February was 8.4x your average monthly equipment spend. Consider a hardware maintenance reserve of $1,500/month to avoid future emergency cash outflows.',
    category: 'Risk',
    icon: 'alert',
    relatedTransactionIds: ['t017'],
  },
  {
    id: 'rec-002',
    priority: 'high',
    title: 'Team offsite exceeded travel budget by 217%',
    detail: 'The $9,500 team offsite in May represents 217% of your $3,000 estimated quarterly travel budget. Setting a per-event cap of $5,000 would have saved $4,500.',
    category: 'Cost Control',
    icon: 'trending-down',
    relatedTransactionIds: ['t055'],
  },
  {
    id: 'rec-003',
    priority: 'medium',
    title: 'Revenue concentration risk: 62% from one client',
    detail: 'Apex Corp retainer ($18,500/month) represents 62% of your average monthly revenue. Loss of this contract would reduce monthly income by $18,500, exhausting cash reserves in ~1.5 months.',
    category: 'Revenue',
    icon: 'pie-chart',
    relatedTransactionIds: ['t001', 't013', 't024', 't036', 't048', 't060'],
  },
  {
    id: 'rec-004',
    priority: 'medium',
    title: 'Positive trend: New clients added 3 months running',
    detail: 'You added Crest (Apr), Orbital AI (May), and NeuralStack (Jun) as clients. If this trend continues, monthly revenue could reach $35,000+ by Q4, improving runway from 6.2 to 9+ months.',
    category: 'Growth',
    icon: 'trending-up',
    relatedTransactionIds: ['t037', 't049', 't062'],
  },
  {
    id: 'rec-005',
    priority: 'low',
    title: 'SaaS costs stable at $890/month — review for consolidation',
    detail: 'AWS costs have been consistent at $890/month. With 3 new clients added, ensure your current tier is sufficient. Proactive scaling planning can prevent emergency upgrades (like Feb\'s server incident).',
    category: 'Operations',
    icon: 'server',
    relatedTransactionIds: ['t003', 't015', 't026', 't039', 't051', 't064'],
  },
];
