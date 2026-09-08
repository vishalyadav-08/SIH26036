from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Tuple
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
import math

class VectorStore(ABC):
    @abstractmethod
    def add_document(self, document: KnowledgeDocument) -> None:
        pass
        
    @abstractmethod
    def add_chunks(self, chunks: List[KnowledgeChunk]) -> None:
        pass
        
    @abstractmethod
    def get_document(self, document_id: str) -> Optional[KnowledgeDocument]:
        pass
        
    @abstractmethod
    def search(self, query_embedding: List[float], top_k: int = 5, filters: Optional[Dict[str, Any]] = None, threshold: float = 0.0) -> List[Tuple[KnowledgeChunk, float]]:
        pass

class InMemoryVectorStore(VectorStore):
    """Deterministic in-memory vector store for testing and local development without pgvector."""
    
    def __init__(self):
        self.documents: Dict[str, KnowledgeDocument] = {}
        self.chunks: List[KnowledgeChunk] = []
        
    def add_document(self, document: KnowledgeDocument) -> None:
        self.documents[document.id] = document
        
    def add_chunks(self, chunks: List[KnowledgeChunk]) -> None:
        self.chunks.extend(chunks)
        
    def get_document(self, document_id: str) -> Optional[KnowledgeDocument]:
        return self.documents.get(document_id)
        
    def search(self, query_embedding: List[float], top_k: int = 5, filters: Optional[Dict[str, Any]] = None, threshold: float = 0.0) -> List[Tuple[KnowledgeChunk, float]]:
        def cosine_similarity(v1: List[float], v2: List[float]) -> float:
            if not v1 or not v2 or len(v1) != len(v2):
                return 0.0
            dot = sum(a * b for a, b in zip(v1, v2))
            mag1 = math.sqrt(sum(a * a for a in v1))
            mag2 = math.sqrt(sum(b * b for b in v2))
            if mag1 == 0 or mag2 == 0:
                return 0.0
            return dot / (mag1 * mag2)
            
        results = []
        for chunk in self.chunks:
            # Apply filters
            if filters:
                doc = self.get_document(chunk.document_id)
                if not doc:
                    continue
                
                # Check status filter
                if "review_status" in filters and doc.review_status != filters["review_status"]:
                    continue
                    
            if chunk.embedding:
                score = cosine_similarity(query_embedding, chunk.embedding)
                if score >= threshold:
                    results.append((chunk, score))
                
        # Sort by descending score
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

# Global singleton for in-memory use
_vector_store = InMemoryVectorStore()

def get_vector_store() -> VectorStore:
    return _vector_store
