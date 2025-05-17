import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from server.api.ind.region_rules import router


def create_app():
    app = FastAPI()
    app.include_router(router)
    return app


@pytest.mark.parametrize("region", ["FDA", "EMA", "PMDA"])
def test_region_rules_valid(monkeypatch, region):
    recorded = {}

    def fake_missing_modules(region_arg, modules_set):
        recorded['args'] = (region_arg, modules_set)
        return [f"{region_arg}_missing"]

    monkeypatch.setattr("server.api.ind.region_rules.missing_modules", fake_missing_modules)

    app = create_app()
    client = TestClient(app)
    response = client.get("/api/ind/region-rules", params={"region": region, "modules": "m1,m2"})
    assert response.status_code == 200
    assert response.json() == {"missing": [f"{region}_missing"]}
    assert recorded['args'] == (region, {"m1", "m2"})


def test_region_rules_invalid_region():
    app = create_app()
    client = TestClient(app)
    response = client.get("/api/ind/region-rules", params={"region": "XYZ"})
    assert response.status_code == 422


def test_region_rules_exception(monkeypatch):
    def raise_error(region_arg, modules_set):
        raise ValueError("fail")

    monkeypatch.setattr("server.api.ind.region_rules.missing_modules", raise_error)
    app = create_app()
    client = TestClient(app)
    response = client.get("/api/ind/region-rules", params={"region": "FDA"})
    assert response.status_code == 500
    assert "Error processing region rules" in response.json()["detail"]
