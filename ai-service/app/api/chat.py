from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import process_chat_message
from app.core.logging import logger
from app.providers.base import (
    ProviderConfigurationError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    ProviderResponseError,
    UnsupportedProviderError
)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    logger.info(f"Received chat request for conversation: {request.conversationId}")
    
    try:
        response = process_chat_message(request.message, request.conversationId)
        return response
    except (ProviderConfigurationError, UnsupportedProviderError) as e:
        logger.error(f"Configuration error: {e}")
        return JSONResponse(
            status_code=503, 
            content={"code": "CONFIG_ERROR", "message": "AI Assistant provider is not configured properly."}
        )
    except ProviderTimeoutError as e:
        logger.error(f"Timeout error: {e}")
        return JSONResponse(
            status_code=504, 
            content={"code": "TIMEOUT_ERROR", "message": "The AI provider took too long to respond."}
        )
    except ProviderUnavailableError as e:
        logger.error(f"Unavailable error: {e}")
        return JSONResponse(
            status_code=503, 
            content={"code": "UNAVAILABLE_ERROR", "message": "The AI provider is currently unavailable."}
        )
    except ProviderResponseError as e:
        logger.error(f"Response error: {e}")
        return JSONResponse(
            status_code=502, 
            content={"code": "PROVIDER_ERROR", "message": "The AI provider returned an error."}
        )
    except Exception as e:
        logger.error(f"Unexpected chat error: {e}")
        return JSONResponse(
            status_code=500, 
            content={"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}
        )
