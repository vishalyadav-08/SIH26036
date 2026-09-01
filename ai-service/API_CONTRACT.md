# AI Service API Contract

This document defines the initial AI service API boundary for the MapanSetu AI Assistant.

The AI service has its own API boundary and is separate from the MapanSetu `/api/v1/` core backend contract.

## 1. Health Check

**Endpoint:** `GET /health`

**Purpose:** AI service health check.

## 2. Chat Endpoint

**Endpoint:** `POST /api/v1/chat`

**Purpose:** Submit a query to the AI Assistant and receive a source-grounded response.

**Initial Request:**
```json
{
  "message": "How do I verify my certificate?",
  "conversationId": "uuid"
}
```

**Initial Response:**
```json
{
  "conversationId": "uuid",
  "answer": "....",
  "sources": [
    {
      "documentId": "uuid",
      "title": "....",
      "section": "...."
    }
  ],
  "suggestedActions": [
    {
      "label": "Verify Certificate",
      "route": "/verify"
    }
  ]
}
```

*Note: The exact implementation schema may be refined in the implementation phase, but it must preserve:*
- conversation identity
- answer
- source references
- optional navigation actions

## Boundary and Integration
The AI service has its own independent API contract. Future authenticated MapanSetu data access must use the existing Django API rather than direct database access. Do not modify the existing core MapanSetu API contract for AI advisory features.
