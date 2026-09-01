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

class OpenAIProvider(LLMProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ProviderConfigurationError("OPENAI_API_KEY is missing or empty.")
        if not settings.AI_MODEL:
            raise ProviderConfigurationError("AI_MODEL is missing for OpenAI provider.")
            
        try:
            import openai
            from openai import APITimeoutError, APIConnectionError, OpenAIError
            self.openai = openai
            self.APITimeoutError = APITimeoutError
            self.APIConnectionError = APIConnectionError
            self.OpenAIError = OpenAIError
        except ImportError:
            raise ProviderConfigurationError("openai package is not installed.")
            
        self.client = self.openai.OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.AI_TIMEOUT_SECONDS,
        )
        self.model = settings.AI_MODEL
        
    def generate_response(self, system_prompt: str, user_message: str) -> LLMResult:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.0
            )
            
            usage = LLMUsage()
            if hasattr(response, "usage") and response.usage:
                usage.input_tokens = getattr(response.usage, "prompt_tokens", None)
                usage.output_tokens = getattr(response.usage, "completion_tokens", None)
                usage.total_tokens = getattr(response.usage, "total_tokens", None)
                
            return LLMResult(
                text=response.choices[0].message.content or "",
                provider="openai",
                model=self.model,
                usage=usage
            )
            
        except self.APITimeoutError:
            raise ProviderTimeoutError("OpenAI API request timed out.")
        except self.APIConnectionError:
            raise ProviderUnavailableError("OpenAI API is currently unavailable.")
        except self.OpenAIError as e:
            raise ProviderResponseError("An error occurred with the OpenAI API.") from e
        except Exception as e:
            raise ProviderResponseError("An unexpected error occurred during OpenAI generation.") from e
