# MapanSetu AI Assistant Service

The AI Assistant service is a standalone component of MapanSetu that provides source-grounded, advisory assistance. It is completely decoupled from the core Django backend and the MapanSetu Postgres database, ensuring that it remains strictly advisory without any ability to modify domain entities.

## Responsibilities
- Retrieve knowledge and summarize approved information using RAG.
- Explain MapanSetu workflows, FAQs, application states, and certificate verification.
- Provide informational Legal Metrology guidance and website navigation suggestions.
- State uncertainty when verified information is unavailable.

## Non-Responsibilities
- Does NOT act as an authority for authentication, authorization, application state, or assignment.
- Does NOT approve/reject instruments, issue/revoke certificates, or determine statutory tolerances.
- Does NOT communicate directly with the LLM provider via the browser.

## Service Setup
See `.env.example` for required configuration.

## Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System context, RAG approach, and architectural decisions.
- [API_CONTRACT.md](API_CONTRACT.md) - API endpoints exposed by this service.
