from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel

class ProviderConfigurationError(Exception):
    pass

class ProviderTimeoutError(Exception):
    pass

class ProviderUnavailableError(Exception):
    pass

class ProviderResponseError(Exception):
    pass

class UnsupportedProviderError(Exception):
    pass

class LLMUsage(BaseModel):
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None

class LLMResult(BaseModel):
    text: str
    provider: str
    model: str
    usage: LLMUsage

class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, system_prompt: str, user_message: str) -> LLMResult:
        """Generates a response from the LLM provider."""
        pass
