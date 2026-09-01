from typing import Optional, Dict, Any, List
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.rag.normalization import normalize_text, calculate_content_hash
from app.rag.chunking import chunk_text
from app.rag.embeddings import get_embedding_provider
from app.rag.vector_store import get_vector_store
from app.core.config import settings
from app.core.logging import logger

class IngestionResult:
    def __init__(self, success: bool, message: str, document_id: Optional[str] = None):
        self.success = success
        self.message = message
        self.document_id = document_id

class IngestionPipeline:
    def __init__(self):
        self.embedding_provider = get_embedding_provider()
        self.vector_store = get_vector_store()
        
    def ingest_text(self, text: str, metadata: Dict[str, Any]) -> IngestionResult:
        if not text or not text.strip():
            return IngestionResult(False, "Input text is empty.")
            
        # Optional: large input handling
        if len(text) > 10_000_000:
            return IngestionResult(False, "Input text exceeds maximum allowed size.")
            
        normalized = normalize_text(text)
        content_hash = calculate_content_hash(normalized)
        
        # Duplicate detection by content hash (for testing/in-memory)
        # In a real DB this would be a query
        for existing_doc in getattr(self.vector_store, "documents", {}).values():
            if existing_doc.content_hash == content_hash:
                return IngestionResult(True, "Document already exists (duplicate hash).", existing_doc.id)
        
        doc = KnowledgeDocument(
            title=metadata.get("title", "Untitled"),
            source=metadata.get("source", "Unknown"),
            authority=metadata.get("authority", "None"),
            version=metadata.get("version", "1.0"),
            category=metadata.get("category", "General"),
            effective_date=metadata.get("effective_date"),
            review_status=metadata.get("review_status", "DRAFT"),
            content_hash=content_hash
        )
        
        try:
            raw_chunks = chunk_text(normalized, settings.AI_CHUNK_SIZE, settings.AI_CHUNK_OVERLAP)
        except ValueError as e:
            return IngestionResult(False, f"Chunking configuration error: {e}")
            
        if not raw_chunks:
            return IngestionResult(False, "No chunks generated from text.")
            
        try:
            # Generate embeddings in batch
            embeddings = self.embedding_provider.embed_documents(raw_chunks)
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            return IngestionResult(False, "Embedding generation failed.")
            
        knowledge_chunks = []
        for i, (chunk_text_str, embedding) in enumerate(zip(raw_chunks, embeddings)):
            knowledge_chunks.append(
                KnowledgeChunk(
                    document_id=doc.id,
                    chunk_index=i,
                    text=chunk_text_str,
                    section=metadata.get("section"),
                    page=metadata.get("page"),
                    embedding=embedding
                )
            )
            
        # Store in vector store
        self.vector_store.add_document(doc)
        self.vector_store.add_chunks(knowledge_chunks)
        
        return IngestionResult(True, f"Successfully ingested {len(knowledge_chunks)} chunks.", doc.id)
