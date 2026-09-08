from fastapi.testclient import TestClient
from app.main import app
from app.models.chat import ChatResponse
import uuid
from unittest.mock import patch

client = TestClient(app)

@patch("app.api.chat.process_chat_message")
def test_chat_valid_request(mock_process):
    mock_process.return_value = ChatResponse(
        conversationId=uuid.uuid4(),
        answer="Mocked AI Answer",
        sources=[],
        suggestedActions=[]
    )
    
    response = client.post("/api/v1/chat", json={"message": "Hello AI"})
    assert response.status_code == 200
    data = response.json()
    assert "conversationId" in data
    assert data["answer"] == "Mocked AI Answer"
    assert data["sources"] == []
    assert data["suggestedActions"] == []

def test_chat_empty_message():
    response = client.post("/api/v1/chat", json={"message": ""})
    assert response.status_code == 422

def test_chat_no_secrets_in_response():
    response = client.post("/api/v1/chat", json={"message": "Hello"})
    data = response.text
    assert "OPENAI_API_KEY" not in data
    assert "GEMINI_API_KEY" not in data
