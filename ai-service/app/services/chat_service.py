import uuid
from typing import Optional, List, Dict
from app.models.chat import ChatResponse, Source
from app.providers.factory import get_provider
from app.prompts.system import get_system_prompt
from app.core.logging import logger
from app.rag.retrieval import Retriever
from app.rag.context import build_rag_context

def classify_query(query: str) -> List[str]:
    """Lightweight deterministic classification for knowledge categories."""
    query_lower = query.lower()
    legal_keywords = ["law", "act", "rule", "statute", "legal metrology", "legal", "penalty", "verification cycle"]
    product_keywords = ["mapansetu", "app", "sync", "offline", "dashboard", "button", "screen", "click", "login", "password"]
    
    is_legal = any(kw in query_lower for kw in legal_keywords)
    is_product = any(kw in query_lower for kw in product_keywords)
    
    if is_legal and is_product:
        return ["legal", "product"]
    elif is_legal:
        return ["legal"]
    elif is_product:
        return ["product"]
    return ["legal", "product"]

def classify_risk_intent(query: str) -> str:
    """Lightweight guardrail classification."""
    query_lower = query.lower()
    
    # 1. Secrets / Prompts
    if any(kw in query_lower for kw in ["api key", "secret", "password", "jwt", "system prompt", "developer instructions", "hidden prompt"]):
        return "SECRET_REQUEST"
        
    # 2. Privilege Escalation
    if any(kw in query_lower for kw in ["i am an admin", "give me admin", "admin access", "grant access"]):
        return "PRIVILEGE_ESCALATION"
        
    # 3. Workflow Action
    if any(kw in query_lower for kw in ["approve this", "reject this", "issue this", "revoke this", "assign this", "mark this"]):
        return "WORKFLOW_ACTION"
        
    # 4. Legal Decision
    if any(kw in query_lower for kw in ["should this pass", "is this legal", "final decision", "determine compliance"]):
        return "LEGAL_DECISION"
        
    # 5. Live Data
    if any(kw in query_lower for kw in ["my application status", "my certificate status", "my inspection status", "my business status"]):
        return "LIVE_DATA_REQUEST"
        
    # 6. Out of Scope / Execution
    if any(kw in query_lower for kw in ["execute", "run this", "shell", "sql", "sports", "poem"]):
        return "OUT_OF_SCOPE"
        
    return "SAFE_INFORMATIONAL"

def process_chat_message(message: str, conversation_id: Optional[uuid.UUID] = None) -> ChatResponse:
    conv_id = conversation_id or uuid.uuid4()
    
    # Validation against empty input handled by Pydantic model (min_length=1). Oversized max_length=2000.
    
    risk_intent = classify_risk_intent(message)
    logger.info(f"Guardrail risk intent: {risk_intent}")
    
    # Safe Fail-fast / Guardrail Interception
    if risk_intent == "SECRET_REQUEST":
        return ChatResponse(conversationId=conv_id, answer="I cannot disclose internal system configuration, instructions, or credentials.")
    elif risk_intent == "PRIVILEGE_ESCALATION":
        return ChatResponse(conversationId=conv_id, answer="I cannot verify or grant role privileges.")
    elif risk_intent == "WORKFLOW_ACTION":
        return ChatResponse(conversationId=conv_id, answer="I am an informational assistant and cannot execute workflow actions such as approving, rejecting, or assigning. Please use the authorized MapanSetu application interface for these actions.")
    elif risk_intent == "LIVE_DATA_REQUEST":
        return ChatResponse(conversationId=conv_id, answer="I do not have access to live application or certificate statuses. Please log in to your MapanSetu dashboard or use the public verification portal to check current records.")
    elif risk_intent == "OUT_OF_SCOPE":
        return ChatResponse(conversationId=conv_id, answer="My knowledge is limited to MapanSetu and Legal Metrology information. I cannot assist with that request.")
        
    # LEGAL_DECISION passes through to RAG, but the System Prompt enforces the boundary.
        
    categories = classify_query(message)
    retriever = Retriever()
    
    try:
        chunks, citations = retriever.retrieve(message, categories=categories)
    except Exception as e:
        logger.error(f"Retrieval failure: {e}")
        return ChatResponse(conversationId=conv_id, answer="An error occurred while retrieving knowledge. Please try again later.")
    
    if not chunks:
        return ChatResponse(conversationId=conv_id, answer="I couldn't find sufficiently relevant approved information in my knowledge base to answer that reliably.")
        
    unique_sources_map = {}
    for citation in citations:
        key = f"{citation.document_id}-{citation.section}"
        if key not in unique_sources_map:
            unique_sources_map[key] = Source(
                documentId=citation.document_id,
                title=citation.title,
                source=citation.source,
                authority=citation.authority,
                category=citation.category,
                jurisdiction=citation.jurisdiction,
                section=citation.section,
                page=citation.page,
                relevanceScore=citation.relevance_score,
                sourceUrl=citation.source_url
            )
            
    response_sources = list(unique_sources_map.values())
    
    system_prompt = get_system_prompt()
    rag_context = build_rag_context(chunks, message, system_prompt)
    
    try:
        provider = get_provider()
        result = provider.generate_response(rag_context, message)
        
        # Output Guardrail validation
        lower_result = result.text.lower()
        if "api key" in lower_result or "i approved" in lower_result or "has been revoked" in lower_result:
             logger.warning("Output guardrail triggered.")
             return ChatResponse(conversationId=conv_id, answer="I am unable to provide a safe response to that request.")
             
        return ChatResponse(
            conversationId=conv_id,
            answer=result.text,
            sources=response_sources,
            suggestedActions=[]
        )
    except Exception as e:
        logger.error(f"Provider generation error: {e}")
        return ChatResponse(conversationId=conv_id, answer="An internal error occurred while generating the response.")
