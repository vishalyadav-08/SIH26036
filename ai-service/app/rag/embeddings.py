from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings

class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass

class MockEmbeddingProvider(EmbeddingProvider):
    def embed_text(self, text: str) -> List[float]:
        val = float(len(text)) / 1000.0
        return [val] * 1536

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(text) for text in texts]

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        import openai
        self.client = openai.OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.AI_TIMEOUT_SECONDS
        )
        self.model = "text-embedding-3-small"

    def embed_text(self, text: str) -> List[float]:
        response = self.client.embeddings.create(input=[text], model=self.model)
        return response.data[0].embedding

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        response = self.client.embeddings.create(input=texts, model=self.model)
        return [data.embedding for data in response.data]

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        from google import genai
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={'timeout': settings.AI_TIMEOUT_SECONDS}
        )
        self.model = "text-embedding-004"

    def embed_text(self, text: str) -> List[float]:
        response = self.client.models.embed_content(model=self.model, contents=text)
        return response.embeddings[0].values

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        response = self.client.models.embed_content(model=self.model, contents=texts)
        return [emb.values for emb in response.embeddings]

def get_embedding_provider() -> EmbeddingProvider:
    provider_name = settings.AI_PROVIDER.lower().strip()
    if provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIEmbeddingProvider()
    elif provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider()
    
    return MockEmbeddingProvider()
