from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class KnowledgeDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    source: str
    authority: str
    version: str
    category: str
    effective_date: Optional[str] = None
    review_status: str = "DRAFT" # e.g., "ACTIVE", "SUPERSEDED", "DRAFT"
    content_hash: str
    
    # AI-006 additions
    source_url: Optional[str] = None
    publication_date: Optional[str] = None
    retrieval_date: Optional[str] = None
    jurisdiction: Optional[str] = None
    jurisdiction_type: Optional[str] = None # e.g. "INDIA", "STATE"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeChunk(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    chunk_index: int
    text: str
    section: Optional[str] = None
    page: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SourceCitation(BaseModel):
    document_id: str
    title: str
    source: str
    authority: str
    section: Optional[str] = None
    page: Optional[str] = None
    relevance_score: Optional[float] = None
    
    # AI-006 additions
    source_url: Optional[str] = None
    version: Optional[str] = None
    jurisdiction: Optional[str] = None
    category: Optional[str] = None
