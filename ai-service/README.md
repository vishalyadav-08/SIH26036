# MapanSetu AI Assistant Service

### Purpose
Standalone MapanSetu AI Assistant backend.

### Current status
AI-002 Bootstrap

## Responsibilities
- Retrieve knowledge and summarize approved information using RAG.
- Explain MapanSetu workflows, FAQs, application states, and certificate verification.
- Provide informational Legal Metrology guidance and website navigation suggestions.
- State uncertainty when verified information is unavailable.

## Non-Responsibilities
- Does NOT act as an authority for authentication, authorization, application state, or assignment.
- Does NOT approve/reject instruments, issue/revoke certificates, or determine statutory tolerances.
- Does NOT communicate directly with the LLM provider via the browser.

### Explicit limitations
- no LLM provider yet
- no OpenAI/Gemini integration yet
- no RAG yet
- no vector database yet
- no MapanSetu database access
- no authenticated user context yet

### Running locally
```bash
cd ai-service
python -m venv .venv
# Activate environment (e.g. `source .venv/bin/activate` or `.venv\Scripts\activate`)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8100
```
Test:
```bash
pytest
```

### Endpoints
```text
GET  /health
POST /api/v1/chat
```

## Service Setup
See `.env.example` for required configuration.

## Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System context, RAG approach, and architectural decisions.
- [API_CONTRACT.md](API_CONTRACT.md) - API endpoints exposed by this service.
