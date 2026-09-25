import pandas as pd
import numpy as np
from typing import List, Dict, Any
from forecasting import run_forecast


def run_whatif(
    transactions: List[Dict[str, Any]],
    scenario: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Simulate hypothetical financial decision and recompute 30-day forecast.
    
    scenario = {
        "monthly_delta": -8000,   # negative = cost increase, positive = revenue increase
        "description": "Hire 2 employees at $4,000/month each"
    }
    """
    monthly_delta = float(scenario.get('monthly_delta', 0))

    if not transactions:
        return _empty_whatif(monthly_delta)

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df = df.dropna(subset=['date']).sort_values('date')

    # Compute baseline metrics
    daily = df.groupby('date')['amount'].sum()
    monthly_net = float(daily.resample('MS').sum().mean())
    last_balance = float(daily.cumsum().iloc[-1])

    # Runway = how many months until cash hits zero
    # If monthly_net is positive, business is cash-flow positive (no finite runway)
    baseline_runway = (last_balance / abs(monthly_net)) if monthly_net < 0 else min(last_balance / max(abs(monthly_net), 1), 99.0)

    # Adjusted metrics
    adjusted_monthly_net = monthly_net + monthly_delta
    adjusted_runway = (last_balance / abs(adjusted_monthly_net)) if adjusted_monthly_net < 0 else min(last_balance / max(abs(adjusted_monthly_net), 1), 99.0)

    # Build adjusted forecast
    base_forecast = run_forecast(transactions)
    daily_delta = monthly_delta / 30.0

    adjusted_forecast = []
    cumulative_delta = 0.0
    for i, point in enumerate(base_forecast['forecast']):
        cumulative_delta += daily_delta
        adjusted_forecast.append({
            'date': point['date'],
            'predicted': round(point['predicted'] + cumulative_delta),
            'lower': round(point['lower'] + cumulative_delta),
            'upper': round(point['upper'] + cumulative_delta),
        })

    return {
        'baseline_runway': round(baseline_runway, 1),
        'adjusted_runway': round(max(adjusted_runway, 0), 1),
        'impact_30d': round(monthly_delta),
        'impact_90d': round(monthly_delta * 3),
        'monthly_delta': round(monthly_delta),
        'forecast': adjusted_forecast,
    }


def _empty_whatif(monthly_delta: float) -> Dict[str, Any]:
    return {
        'baseline_runway': 6.2,
        'adjusted_runway': 4.8,
        'impact_30d': round(monthly_delta),
        'impact_90d': round(monthly_delta * 3),
        'monthly_delta': round(monthly_delta),
        'forecast': [],
    }
