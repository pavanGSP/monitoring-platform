
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time

app = FastAPI(title="Monitoring Backend", version="1.0.0")

# Optional CORS (unused if front proxies /api to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Metrics(BaseModel):
    cpu_percent: float
    latency_ms: float
    memory_usage_mb: float
    request_count: int
    timestamp: float

# simple in-memory counter
COUNTER = 0

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics", response_model=Metrics)
def metrics():
    global COUNTER
    COUNTER += 1
    # Simulated metrics
    cpu = round(random.uniform(5, 85), 2)
    latency = round(random.uniform(10, 300), 2)
    mem = round(random.uniform(50, 500), 2)
    ts = time.time()
    return {
        "cpu_percent": cpu,
        "latency_ms": latency,
        "memory_usage_mb": mem,
        "request_count": COUNTER,
        "timestamp": ts
    }
