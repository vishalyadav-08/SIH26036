import uuid
import re
from typing import Optional, List, Dict
from app.models.chat import ChatResponse, Source, SuggestedAction
from app.providers.factory import get_provider
from app.prompts.system import get_system_prompt
from app.core.logging import logger
from app.rag.retrieval import Retriever
from app.rag.context import build_rag_context

def classify_query(query: str) -> List[str]:
    """
    Lightweight deterministic classification of query intent.
    Returns a list of categories to retrieve.
    """
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
    else:
        # Unknown/Uncertain: fallback to retrieving both safely
        return ["legal", "product"]

def process_chat_message(message: str, conversation_id: Optional[uuid.UUID] = None) -> ChatResponse:
    conv_id = conversation_id or uuid.uuid4()
    
    # 1. Query Classification
    categories = classify_query(message)
    logger.info(f"Query classified as categories: {categories}")
    
    # 2. Retrieval
    retriever = Retriever()
    chunks, citations = retriever.retrieve(message, categories=categories)
    
    # 3. No-result / Low-confidence handling
    if not chunks:
        logger.info("No sufficiently relevant chunks found.")
        return ChatResponse(
            conversationId=conv_id,
            answer="I couldn't find sufficiently relevant approved information in my knowledge base to answer that reliably.",
            sources=[],
            suggestedActions=[]
        )
        
    # 4. Deduplicate sources for response
    unique_sources_map: Dict[str, Source] = {}
    for citation in citations:
        # Create a unique key based on document and section to deduplicate
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
    
    # 5. Build RAG Context
    system_prompt = get_system_prompt()
    rag_context = build_rag_context(chunks, message, system_prompt)
    
    # 6. LLM Generation
    try:
        provider = get_provider()
    except Exception as e:
        logger.error(f"Provider configuration error: {e}")
        raise
        
    try:
        logger.info(f"Generating response for conversation {conv_id} with {len(chunks)} chunks")
        result = provider.generate_response(rag_context, message)
        
        if result.usage and result.usage.total_tokens:
            logger.info(f"Tokens: {result.usage.total_tokens}")
            
        return ChatResponse(
            conversationId=conv_id,
            answer=result.text,
            sources=response_sources,
            suggestedActions=[]
        )
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise
