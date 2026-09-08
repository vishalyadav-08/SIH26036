from app.core.config import settings
from app.providers.base import LLMProvider, UnsupportedProviderError

def get_provider() -> LLMProvider:
    provider_name = settings.AI_PROVIDER.lower().strip()
    
    if not provider_name:
        raise UnsupportedProviderError("AI_PROVIDER is not configured.")
        
    if provider_name == "gemini":
        from app.providers.gemini_provider import GeminiProvider
        return GeminiProvider()
        
    elif provider_name == "openai":
        from app.providers.openai_provider import OpenAIProvider
        return OpenAIProvider()
        
    else:
        raise UnsupportedProviderError(f"Unsupported AI_PROVIDER: {provider_name}")
