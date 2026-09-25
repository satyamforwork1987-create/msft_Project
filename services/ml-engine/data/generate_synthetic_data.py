"""
Generate synthetic transaction data for FinSight AI demos.
Run: python generate_synthetic_data.py
Outputs: demo_transactions.csv
"""

import csv
import random
import datetime
from pathlib import Path

random.seed(42)

CATEGORIES = {
    'Revenue': {'min': 2000, 'max': 25000, 'freq': 0.25, 'typical_positive': True},
    'Payroll': {'min': 3500, 'max': 8000, 'freq': 0.20, 'typical_positive': False},
    'Marketing': {'min': 500, 'max': 3500, 'freq': 0.12, 'typical_positive': False},
    'SaaS': {'min': 200, 'max': 1200, 'freq': 0.10, 'typical_positive': False},
    'Office': {'min': 100, 'max': 800, 'freq': 0.08, 'typical_positive': False},
    'Rent': {'min': 1500, 'max': 2500, 'freq': 0.06, 'typical_positive': False},
    'Equipment': {'min': 500, 'max': 15000, 'freq': 0.05, 'typical_positive': False},
    'Travel': {'min': 300, 'max': 10000, 'freq': 0.07, 'typical_positive': False},
    'Legal': {'min': 800, 'max': 4000, 'freq': 0.04, 'typical_positive': False},
    'Software': {'min': 500, 'max': 3000, 'freq': 0.03, 'typical_positive': False},
}

DESCRIPTIONS = {
    'Revenue': ['Client Retainer', 'Project Invoice', 'Consulting Fee', 'New Client Onboarding', 'Subscription Revenue'],
    'Payroll': ['Staff Payroll', 'Contractor Payment', 'Freelancer Invoice', 'Bonus Payment'],
    'Marketing': ['Google Ads', 'LinkedIn Ads', 'Content Marketing', 'SEO Services', 'Trade Show'],
    'SaaS': ['AWS Cloud', 'Stripe Fees', 'HubSpot CRM', 'Slack License', 'Figma Pro'],
    'Office': ['Office Supplies', 'Team Lunch', 'Utilities', 'Cleaning Service'],
    'Rent': ['Office Rent', 'Coworking Space'],
    'Equipment': ['Laptop Purchase', 'Server Hardware', 'Peripherals', 'Camera Equipment'],
    'Travel': ['Team Offsite', 'Conference Travel', 'Client Visit', 'Sales Trip'],
    'Legal': ['Legal Retainer', 'Contract Review', 'IP Registration', 'Compliance'],
    'Software': ['Annual License Renewal', 'Productivity Software', 'Security Tools'],
}


def generate_transactions(months: int = 6) -> list:
    transactions = []
    start_date = datetime.date.today() - datetime.timedelta(days=months * 30)
    
    txn_id = 1
    current_date = start_date

    while current_date <= datetime.date.today():
        # Generate 1-4 transactions per day (business days weighted)
        if current_date.weekday() < 5:  # weekday
            n = random.choices([0, 1, 2, 3], weights=[0.3, 0.4, 0.2, 0.1])[0]
        else:  # weekend (less frequent, anomalous)
            n = random.choices([0, 1], weights=[0.9, 0.1])[0]

        for _ in range(n):
            category = random.choices(
                list(CATEGORIES.keys()),
                weights=[v['freq'] for v in CATEGORIES.values()]
            )[0]
            cat_config = CATEGORIES[category]
            desc = random.choice(DESCRIPTIONS[category])
            
            amount = random.uniform(cat_config['min'], cat_config['max'])
            # Inject anomaly: occasionally 3-5x the normal amount
            if random.random() < 0.05:
                amount *= random.uniform(3, 5)
            
            if not cat_config['typical_positive']:
                amount = -amount

            transactions.append({
                'id': f't{txn_id:04d}',
                'date': str(current_date),
                'amount': round(amount, 2),
                'category': category,
                'description': desc,
            })
            txn_id += 1

        current_date += datetime.timedelta(days=1)

    return transactions


def write_csv(transactions: list, output_path: str = 'demo_transactions.csv'):
    path = Path(output_path)
    with open(path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'date', 'amount', 'category', 'description'])
        writer.writeheader()
        writer.writerows(transactions)
    print(f"✅ Generated {len(transactions)} transactions → {path.absolute()}")


if __name__ == '__main__':
    txns = generate_transactions(months=6)
    write_csv(txns)
