# AI Assistant Service Architecture

## System Context

The AI service operates as a standalone application distinct from the core MapanSetu Django backend.

```text
MapanSetu
│
├── frontend/
│   └── Next.js / React
│
├── backend/
│   └── Django + DRF
│
├── flutter_field_app/
│   └── Flutter official field application
│
└── ai-service/
    └── Standalone AI Assistant service
```

## Target AI Service Structure

The target architecture structure for the AI service is defined as follows:

```text
ai-service/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── chat.py
│   │   ├── health.py
│   │   └── admin.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── providers/
│   │   ├── base.py
│   │   ├── openai_provider.py
│   │   └── gemini_provider.py
│   ├── rag/
│   │   ├── ingestion.py
│   │   ├── chunking.py
│   │   ├── embeddings.py
│   │   ├── retrieval.py
│   │   └── citations.py
│   ├── prompts/
│   │   ├── system.py
│   │   ├── legal.py
│   │   └── mapansetu.py
│   ├── guardrails/
│   │   ├── policy.py
│   │   ├── hallucination.py
│   │   └── legal_boundary.py
│   ├── models/
│   │   ├── chat.py
│   │   └── knowledge.py
│   └── services/
│       ├── chat_service.py
│       └── knowledge_service.py
├── knowledge/
├── scripts/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## LLM Provider Architecture

Application code depends on a common provider abstraction, allowing configuration-driven selection of models (e.g., Gemini or OpenAI) without modifying source code.

```text
AI Assistant
      │
      ▼
LLM Provider Interface
      │
      ├── OpenAI Provider
      │
      └── Gemini Provider
```

Provider selection is configuration-driven.
Example:
```text
AI_PROVIDER=gemini
AI_MODEL=<configured-model>
```
API credentials are held securely within the AI service environment/secrets and are never exposed to the frontend, browser, mobile app, public API responses, Git, or logs.

## Retrieval-Augmented Generation (RAG) Architecture

The assistant uses RAG to ground its answers rather than relying on model fine-tuning.

```text
Approved Documents
       │
       ▼
Document Ingestion
       │
       ▼
Text Extraction
       │
       ▼
Chunking + Metadata
       │
       ▼
Embeddings
       │
       ▼
Vector Store
       │
       ▼
User Question
       │
       ▼
Retriever
       │
       ▼
Relevant Knowledge
       │
       ▼
LLM Provider
       │
       ▼
Answer + Sources
```

Vector Storage: PostgreSQL + pgvector is evaluated as the preferred initial approach for storing embeddings. No alternative vector databases (Qdrant, Pinecone, Weaviate) are to be introduced without a separate ADR.

The architecture preserves source metadata for retrieved knowledge. Minimum source metadata includes:
- document ID
- title
- source
- authority
- version
- section
- page where available
- effective date where applicable
- document category
- review status

## Knowledge Categories

1. **MapanSetu**: Product workflows, application states, user roles, certificate verification, inspection workflow, offline workflow, website help, FAQs.
2. **Legal Metrology**: Authoritative, curated legal/government material. (The AI must not treat arbitrary internet content as automatically authoritative).
3. **Website**: Public content and navigation.
4. **Glossary / FAQ**: Controlled explanatory content.

### Knowledge Authority Priority

```text
Approved authoritative legal/government material
                ↓
Approved departmental material
                ↓
Approved MapanSetu documentation
                ↓
Approved explanatory material
```

The retrieval system prefers approved/current material and will not silently invent regulatory information when no verified source exists.

## Security and Trust Boundaries

The browser never communicates directly with the LLM provider using the provider API key. The AI service must not expose API keys, JWTs, password hashes, private signing keys, internal credentials, or unnecessary personal/domain data.

```text
Browser
  ↓
Next.js
  ↓
AI Service
  ↓
LLM Provider
```

For future phase features requesting user-specific data, Django will act as the gatekeeper for authentication and authorization. The AI service will consume the existing Django API and will not determine whether a user is allowed to see the application.

```text
User
 │
 ▼
Next.js
 │
 ▼
AI Service
 │
 ▼
Django API
 │
 ▼
Authentication + Authorization
 │
 ▼
Permitted MapanSetu Data
 │
 ▼
AI Service
 │
 ▼
Response
```

## Prompt Architecture

Prompts are constructed in a layered approach to safeguard against hallucination and prompt injection from retrieved documents. Retrieved documents are treated as data, not executable instructions.

```text
System Instructions
        +
AI Safety / Legal Boundary
        +
Retrieved Knowledge
        +
Allowed Conversation Context
        +
User Question
```

## Legal / Regulatory Guardrail

The assistant must distinguish:
```text
Informational guidance
        ≠
Legal authority
        ≠
Officer decision
```

If verified information is unavailable, the assistant must not fabricate a regulation, tolerance, validity period, or legal requirement. For questions requiring an authorized decision, the assistant directs the user to the appropriate official process rather than making the decision itself.

## Source Requirement

For knowledge-grounded factual answers, the response conceptually is:
```text
Answer
  +
Sources
  +
Optional suggested action
```
The source corresponds to retrieved knowledge actually used for the response.

## Error and Fallback Behavior

The architecture defines safe behavior for:
- AI provider unavailable
- invalid provider configuration
- retrieval unavailable
- knowledge unavailable
- timeout
- rate limiting
- malformed request
- empty question
- unsupported question
- no relevant knowledge found

The AI Assistant falls back gracefully rather than inventing an answer.

## Database Boundary

The AI service maintains its own persistence for AI-specific data (conversations, knowledge documents, chunks, embeddings, ingestion status). It must NOT duplicate canonical MapanSetu entities (User, Business, Instrument, Application, Inspection, Certificate), which remain governed by the Django system.

## Frontend Boundary

The frontend communicates with the AI service through the approved AI API boundary. The frontend must not contain LLM API keys, provider SDK credentials, RAG logic, vector database credentials, or private AI service secrets.
