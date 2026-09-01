from typing import List, Optional, Tuple, Dict, Any
from app.rag.vector_store import get_vector_store
from app.rag.embeddings import get_embedding_provider
from app.models.knowledge import SourceCitation, KnowledgeChunk
from app.core.config import settings
from app.core.logging import logger

class Retriever:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.embedding_provider = get_embedding_provider()
        
    def retrieve(self, query: str, top_k: Optional[int] = None, categories: Optional[List[str]] = None) -> Tuple[List[KnowledgeChunk], List[SourceCitation]]:
        if not query.strip():
            return [], []
            
        k = top_k or settings.AI_RETRIEVAL_TOP_K
        threshold = settings.AI_RETRIEVAL_THRESHOLD
        
        try:
            query_embedding = self.embedding_provider.embed_text(query)
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [], []
        
        # Filter strictly for active/approved knowledge
        filters: Dict[str, Any] = {"review_status": "ACTIVE"}
        
        scored_chunks = self.vector_store.search(query_embedding, top_k=k*2, filters=filters, threshold=threshold)
        
        sources = []
        result_chunks = []
        
        for chunk, score in scored_chunks:
            doc = self.vector_store.get_document(chunk.document_id)
            if doc:
                # Apply optional category filtering post-search for simplicity
                if categories and doc.category not in categories:
                    continue
                    
                result_chunks.append(chunk)
                sources.append(
                    SourceCitation(
                        document_id=doc.id,
                        title=doc.title,
                        source=doc.source,
                        authority=doc.authority,
                        section=chunk.section,
                        page=chunk.page,
                        relevance_score=round(score, 4),
                        # AI-006 fields
                        source_url=doc.source_url,
                        version=doc.version,
                        jurisdiction=doc.jurisdiction,
                        category=doc.category
                    )
                )
            if len(result_chunks) >= k:
                break
                
        return result_chunks, sources
