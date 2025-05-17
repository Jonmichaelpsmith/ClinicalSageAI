import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set in-memory database before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from server.db import Base, engine, SessionLocal
from server.api.agent.suggestions import router, get_db
from server.models import suggestion_record  # ensure model loaded

from fastapi import FastAPI

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(router)

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    Base.metadata.drop_all(bind=engine)


async def mock_generate(_project_id):
    return [
        {
            "project_id": 1,
            "text": "First suggestion",
            "action": {"name": "do", "arguments": {"a": 1}},
            "status": "pending",
        },
        {
            "project_id": 1,
            "text": "Second suggestion",
            "status": "pending",
        },
    ]


def test_generate_and_retrieve_suggestions(client, monkeypatch):
    monkeypatch.setattr(
        "server.api.agent.suggestions.generate_suggestions", mock_generate
    )
    resp = client.post("/api/agent/suggestions/generate", params={"project_id": 1})
    assert resp.status_code == 200
    assert resp.json()["count"] == 2

    resp = client.get("/api/agent/suggestions", params={"project_id": 1})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["text"] == "First suggestion"


def test_update_status(client, monkeypatch):
    monkeypatch.setattr(
        "server.api.agent.suggestions.generate_suggestions", mock_generate
    )
    client.post("/api/agent/suggestions/generate", params={"project_id": 1})
    resp = client.get("/api/agent/suggestions", params={"project_id": 1})
    suggestion_id = resp.json()[0]["id"]

    resp = client.post(
        f"/api/agent/suggestions/{suggestion_id}/status",
        params={"project_id": 1},
        json={"status": "accepted"},
    )
    assert resp.status_code == 200

    resp = client.get(
        "/api/agent/suggestions", params={"project_id": 1, "status": "accepted"}
    )
    data = resp.json()
    assert len(data) == 1
    assert data[0]["status"] == "accepted"


