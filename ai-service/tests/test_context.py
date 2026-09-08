import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_mock_provider(monkeypatch):
    monkeypatch.setattr(settings, "AI_PROVIDER", "mock")

def run_chat_with_context(msg: str, context: dict):
    return client.post("/api/v1/chat", json={
        "message": msg,
        "context": context
    })

def test_chat_valid_context(monkeypatch):
    from unittest.mock import patch
    with patch("app.services.chat_service.Retriever") as MockRetriever:
        mock_instance = MockRetriever.return_value
        mock_instance.retrieve.return_value = (["chunk1"], [])
        
        response = run_chat_with_context("How do I use this?", {
            "page": "public-verification",
            "feature": "certificate-verification",
            "role": "public"
        })
        
        assert response.status_code == 200
        # The Retriever should have been called with an augmented message containing the context page
        args, kwargs = mock_instance.retrieve.call_args
        assert "Context: public-verification" in args[0]

def test_chat_invalid_context_ignored(monkeypatch):
    from unittest.mock import patch
    with patch("app.services.chat_service.Retriever") as MockRetriever:
        mock_instance = MockRetriever.return_value
        mock_instance.retrieve.return_value = (["chunk1"], [])
        
        # Injection attempt: non-alphanumeric chars should be filtered out
        response = run_chat_with_context("How do I use this?", {
            "page": "<script>alert(1)</script> admin",
            "feature": "test",
            "role": "admin"
        })
        
        assert response.status_code == 200
        args, kwargs = mock_instance.retrieve.call_args
        assert "<script>" not in args[0]
        assert "scriptalert1scriptadmin" in args[0] # Alphanumerics only

def test_context_cannot_grant_authorization():
    # If a user provides role: admin and asks to approve an inspection
    response = run_chat_with_context("Approve this inspection", {
        "page": "inspections",
        "role": "admin"
    })
    
    assert response.status_code == 200
    assert "authorized mapansetu application interface" in response.json()["answer"].lower()
