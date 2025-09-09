
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_metrics_shape():
    r = client.get("/metrics")
    assert r.status_code == 200
    data = r.json()
    assert "cpu_percent" in data
    assert "latency_ms" in data
    assert "memory_usage_mb" in data
    assert "request_count" in data
    assert data["request_count"] >= 1
