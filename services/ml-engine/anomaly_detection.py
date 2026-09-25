import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any


def detect_anomalies(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Run IsolationForest anomaly detection on a list of transactions.
    Returns the same transactions enriched with anomaly metadata.
    """
    if not transactions:
        return []

    df = pd.DataFrame(transactions)

    # --- Feature engineering ---
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['abs_amount'] = df['amount'].abs()

    # Category frequency encoding
    cat_freq = df['category'].value_counts(normalize=True).to_dict()
    df['cat_frequency'] = df['category'].map(cat_freq).fillna(0)

    # Amount z-score within category
    cat_mean = df.groupby('category')['amount'].transform('mean')
    cat_std = df.groupby('category')['amount'].transform('std').fillna(1)
    df['amount_zscore'] = (df['amount'] - cat_mean) / cat_std

    feature_cols = ['abs_amount', 'day_of_week', 'day_of_month', 'month', 'cat_frequency', 'amount_zscore']
    X = df[feature_cols].fillna(0).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # IsolationForest
    clf = IsolationForest(
        n_estimators=200,
        contamination=0.08,  # ~8% anomaly rate
        random_state=42,
        max_features=len(feature_cols),
    )
    preds = clf.fit_predict(X_scaled)
    scores = clf.score_samples(X_scaled)  # more negative = more anomalous

    # Normalize scores to 0–1 range (1 = most anomalous)
    score_min, score_max = scores.min(), scores.max()
    norm_scores = 1 - (scores - score_min) / (score_max - score_min + 1e-9)

    results = []
    for i, txn in enumerate(transactions):
        is_anomaly = bool(preds[i] == -1)
        anomaly_score = float(round(norm_scores[i], 3))

        # Explain which features triggered the anomaly
        features_triggered = []
        if is_anomaly:
            row = df.iloc[i]
            if abs(row['amount_zscore']) > 1.5:
                features_triggered.append(f"Amount is {abs(row['amount_zscore']):.1f}σ from category mean")
            if row['abs_amount'] > df['abs_amount'].quantile(0.90):
                features_triggered.append(f"Top 10% largest transaction (${row['abs_amount']:,.0f})")
            if row['day_of_week'] >= 5:
                features_triggered.append("Weekend transaction (unusual)")
            if not features_triggered:
                features_triggered.append("Unusual pattern in combined features")

        results.append({
            **txn,
            'is_anomaly': is_anomaly,
            'anomaly_score': anomaly_score,
            'features_triggered': features_triggered,
        })

    return results
