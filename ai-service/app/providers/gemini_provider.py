from app.providers.base import (
    LLMProvider, 
    LLMResult, 
    LLMUsage,
    ProviderConfigurationError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    ProviderResponseError
)
from app.core.config import settings

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ProviderConfigurationError("GEMINI_API_KEY is missing or empty.")
        if not settings.AI_MODEL:
            raise ProviderConfigurationError("AI_MODEL is missing for Gemini provider.")
            
        try:
            from google import genai
            from google.genai import types
            from google.genai.errors import APIError
            self.genai = genai
            self.types = types
            self.APIError = APIError
        except ImportError:
            raise ProviderConfigurationError("google-genai package is not installed.")
        
        self.client = self.genai.Client(
            api_key=settings.GEMINI_API_KEY, 
            http_options={'timeout': settings.AI_TIMEOUT_SECONDS}
        )
        self.model = settings.AI_MODEL
        
    def generate_response(self, system_prompt: str, user_message: str) -> LLMResult:
        try:
            config = self.types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.0
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_message,
                config=config,
            )
            
            usage = LLMUsage()
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                usage.input_tokens = getattr(response.usage_metadata, "prompt_token_count", None)
                usage.output_tokens = getattr(response.usage_metadata, "candidates_token_count", None)
                usage.total_tokens = getattr(response.usage_metadata, "total_token_count", None)
                
            return LLMResult(
                text=response.text or "",
                provider="gemini",
                model=self.model,
                usage=usage
            )
            
        except TimeoutError:
            raise ProviderTimeoutError("Gemini API request timed out.")
        except self.APIError as e:
            # Wrap API error in a generic response error
            raise ProviderUnavailableError(f"Gemini API is unavailable or failed.") from e
        except Exception as e:
            raise ProviderResponseError(f"An unexpected error occurred during Gemini generation.") from e
