from pydantic import BaseModel, Field, constr
from typing import List, Optional
import uuid

class ChatRequest(BaseModel):
    message: constr(min_length=1, max_length=2000, strip_whitespace=True) # type: ignore
    conversationId: Optional[uuid.UUID] = None

class Source(BaseModel):
    documentId: str
    title: str
    source: str
    authority: str
    category: Optional[str] = None
    jurisdiction: Optional[str] = None
    section: Optional[str] = None
    page: Optional[str] = None
    relevanceScore: Optional[float] = None
    sourceUrl: Optional[str] = None

class SuggestedAction(BaseModel):
    label: str
    route: str
    actionId: Optional[str] = None

class ChatResponse(BaseModel):
    conversationId: uuid.UUID
    answer: str
    sources: List[Source] = []
    suggestedActions: List[SuggestedAction] = []
