from pydantic import BaseModel, Field, constr
from typing import List, Optional
import uuid

class ChatRequest(BaseModel):
    message: constr(min_length=1, max_length=2000, strip_whitespace=True) # type: ignore
    conversationId: Optional[uuid.UUID] = None

class Source(BaseModel):
    documentId: str
    title: str
    section: str

class SuggestedAction(BaseModel):
    label: str
    route: str

class ChatResponse(BaseModel):
    conversationId: uuid.UUID
    answer: str
    sources: List[Source] = []
    suggestedActions: List[SuggestedAction] = []
