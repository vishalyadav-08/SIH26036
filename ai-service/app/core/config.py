import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    AI_PROVIDER: str = ""
    AI_MODEL: str = ""
    
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    AI_SERVICE_PORT: int = 8100
    AI_TIMEOUT_SECONDS: int = 30
    
    AI_CHUNK_SIZE: int = 1000
    AI_CHUNK_OVERLAP: int = 200
    AI_RETRIEVAL_TOP_K: int = 5
    AI_RETRIEVAL_THRESHOLD: float = 0.7
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
