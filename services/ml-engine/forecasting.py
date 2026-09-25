import pandas as pd
import numpy as np
from typing import List, Dict, Any


def run_forecast(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Run time-series forecasting on transactions to predict 30-day cash flow.
    Uses Prophet if available, falls back to EWMA + seasonal decomposition.
    """
    if not transactions:
        return _empty_forecast()

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df = df.dropna(subset=['date']).sort_values('date')

    # Aggregate to daily net cash flow
    daily = df.groupby('date')['amount'].sum().reset_index()
    daily.columns = ['ds', 'y']

    # Compute cumulative cash position
    daily['y_cumulative'] = daily['y'].cumsum()

    try:
        from prophet import Prophet  # type: ignore
        return _prophet_forecast(daily)
    except ImportError:
        return _ewma_forecast(daily)


def _prophet_forecast(daily: pd.DataFrame) -> Dict[str, Any]:
    from prophet import Prophet  # type: ignore

    # Use daily net amounts (not cumulative) for Prophet
    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.3,
        interval_width=0.8,
    )
    model.fit(daily[['ds', 'y']])

    future = model.make_future_dataframe(periods=30)
    forecast_df = model.predict(future)

    # Convert net daily to cumulative from last known balance
    last_cumulative = float(daily['y_cumulative'].iloc[-1])
    last_date = daily['ds'].iloc[-1]
    future_only = forecast_df[forecast_df['ds'] > last_date].tail(30)

    cumulative_delta = future_only['yhat'].cumsum()
    cumulative_lower = future_only['yhat_lower'].cumsum()
    cumulative_upper = future_only['yhat_upper'].cumsum()

    forecast_points = []
    for i, row in future_only.iterrows():
        idx = list(future_only.index).index(i)
        forecast_points.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted': round(last_cumulative + float(cumulative_delta.iloc[idx])),
            'lower': round(last_cumulative + float(cumulative_lower.iloc[idx])),
            'upper': round(last_cumulative + float(cumulative_upper.iloc[idx])),
        })

    trend_delta = forecast_points[-1]['predicted'] - forecast_points[0]['predicted']
    trend = 'up' if trend_delta > 500 else ('down' if trend_delta < -500 else 'stable')

    return {
        'forecast': forecast_points,
        'trend': trend,
        'summary': _generate_summary(forecast_points, trend),
    }


def _ewma_forecast(daily: pd.DataFrame) -> Dict[str, Any]:
    """Exponential weighted moving average fallback."""
    last_cumulative = float(daily['y_cumulative'].iloc[-1])
    avg_daily = float(daily['y'].ewm(span=14).mean().iloc[-1])
    std_daily = float(daily['y'].rolling(14).std().iloc[-1] or daily['y'].std())

    forecast_points = []
    cumulative = last_cumulative
    last_date = daily['ds'].iloc[-1]

    for i in range(1, 31):
        next_date = last_date + pd.Timedelta(days=i)
        # Add some seasonality (payday spikes on 1st, 15th)
        day_of_month = next_date.day
        day_factor = 1.8 if day_of_month == 1 else (0.3 if day_of_month in [5, 15, 25] else 1.0)
        daily_delta = avg_daily * day_factor
        cumulative += daily_delta

        forecast_points.append({
            'date': next_date.strftime('%Y-%m-%d'),
            'predicted': round(cumulative),
            'lower': round(cumulative - 2 * std_daily),
            'upper': round(cumulative + 2 * std_daily),
        })

    trend_delta = forecast_points[-1]['predicted'] - forecast_points[0]['predicted']
    trend = 'up' if trend_delta > 500 else ('down' if trend_delta < -500 else 'stable')
    return {'forecast': forecast_points, 'trend': trend, 'summary': _generate_summary(forecast_points, trend)}


def _generate_summary(forecast_points: list, trend: str) -> str:
    start = forecast_points[0]['predicted']
    end = forecast_points[-1]['predicted']
    delta = end - start
    pct = (delta / abs(start) * 100) if start != 0 else 0
    direction = 'increase' if delta > 0 else 'decrease'
    return (
        f"Cash position projected to {direction} by ${abs(delta):,.0f} ({abs(pct):.1f}%) "
        f"over the next 30 days. Trend: {trend.upper()}. "
        f"Estimated end-of-month balance: ${end:,.0f}."
    )


def _empty_forecast() -> Dict[str, Any]:
    import datetime
    today = datetime.date.today()
    return {
        'forecast': [
            {'date': str(today + datetime.timedelta(days=i)), 'predicted': 0, 'lower': 0, 'upper': 0}
            for i in range(1, 31)
        ],
        'trend': 'stable',
        'summary': 'No transaction data available for forecasting.',
    }
