import uuid
from typing import Optional
from app.models.chat import ChatResponse
from app.providers.factory import get_provider
from app.prompts.system import get_system_prompt
from app.core.logging import logger

def process_chat_message(message: str, conversation_id: Optional[uuid.UUID] = None) -> ChatResponse:
    conv_id = conversation_id or uuid.uuid4()
    
    try:
        provider = get_provider()
    except Exception as e:
        logger.error(f"Provider configuration error: {e}")
        raise
        
    system_prompt = get_system_prompt()
    
    try:
        logger.info(f"Generating response for conversation {conv_id}")
        result = provider.generate_response(system_prompt, message)
        
        # Log basic usage if available, but do not leak secrets or full messages
        if result.usage and result.usage.total_tokens:
            logger.info(f"Provider: {result.provider}, Model: {result.model}, Total tokens: {result.usage.total_tokens}")
            
        return ChatResponse(
            conversationId=conv_id,
            answer=result.text,
            sources=[],
            suggestedActions=[]
        )
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise
