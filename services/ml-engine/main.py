from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import uvicorn

from anomaly_detection import detect_anomalies
from forecasting import run_forecast
from whatif_simulation import run_whatif

app = FastAPI(
    title="FinSight AI — ML Engine",
    description="Anomaly detection (IsolationForest) + Cash flow forecasting (Prophet) microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Transaction(BaseModel):
    id: Optional[str] = None
    date: str
    amount: float
    category: Optional[str] = "Uncategorized"
    description: Optional[str] = ""


class AnomalyRequest(BaseModel):
    transactions: List[Dict[str, Any]]


class ForecastRequest(BaseModel):
    transactions: List[Dict[str, Any]]


class Scenario(BaseModel):
    monthly_delta: float
    description: Optional[str] = ""


class WhatIfRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    scenario: Scenario


@app.get("/health")
def health():
    return {"status": "ok", "service": "finsight-ai-ml-engine"}


@app.post("/anomaly")
def anomaly_endpoint(req: AnomalyRequest):
    try:
        result = detect_anomalies(req.transactions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast")
def forecast_endpoint(req: ForecastRequest):
    try:
        result = run_forecast(req.transactions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/whatif")
def whatif_endpoint(req: WhatIfRequest):
    try:
        result = run_whatif(req.transactions, req.scenario.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
