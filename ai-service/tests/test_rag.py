import os
import pytest
from app.rag.normalization import normalize_text, calculate_content_hash
from app.rag.chunking import chunk_text
from app.rag.ingestion import IngestionPipeline
from app.rag.retrieval import Retriever
from app.rag.context import build_rag_context
from app.rag.vector_store import get_vector_store
from app.core.config import settings

def test_normalization():
    raw_text = "This   is \r\n some   text.\n\n\n\nIt has spacing."
    normalized = normalize_text(raw_text)
    assert normalized == "This is \n some text.\n\nIt has spacing."
    
def test_content_hash():
    h1 = calculate_content_hash("hello")
    h2 = calculate_content_hash("hello")
    h3 = calculate_content_hash("world")
    assert h1 == h2
    assert h1 != h3

def test_chunking():
    text = "A" * 1000 + " " + "B" * 500
    chunks = chunk_text(text, chunk_size=800, chunk_overlap=100)
    assert len(chunks) > 1
    # Check deterministic
    chunks2 = chunk_text(text, chunk_size=800, chunk_overlap=100)
    assert chunks == chunks2

def test_chunking_small_text():
    text = "Short text"
    chunks = chunk_text(text, chunk_size=100, chunk_overlap=10)
    assert len(chunks) == 1
    assert chunks[0] == "Short text"

def test_ingestion_and_retrieval(monkeypatch):
    monkeypatch.setattr(settings, "AI_PROVIDER", "mock")
    
    vector_store = get_vector_store()
    vector_store.documents = {}
    vector_store.chunks = []
    
    pipeline = IngestionPipeline()
    
    # Read fixtures
    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
    with open(os.path.join(fixtures_dir, "user_guide.md"), "r") as f:
        guide_text = f.read()
    
    with open(os.path.join(fixtures_dir, "faq.md"), "r") as f:
        faq_text = f.read()

    # Ingest Draft
    res1 = pipeline.ingest_text(guide_text, {"title": "User Guide", "review_status": "DRAFT"})
    assert res1.success
    
    # Ingest Active
    res2 = pipeline.ingest_text(faq_text, {"title": "FAQ", "review_status": "ACTIVE"})
    assert res2.success
    
    # Test duplicate ingestion
    res3 = pipeline.ingest_text(faq_text, {"title": "FAQ Duplicate", "review_status": "ACTIVE"})
    assert res3.success
    assert "duplicate" in res3.message
    
    # Test large input
    large_text = "A" * 10_000_001
    res_large = pipeline.ingest_text(large_text, {})
    assert not res_large.success
    assert "exceeds maximum allowed size" in res_large.message

    # Test retrieval
    retriever = Retriever()
    # "verify" should match the FAQ doc
    chunks, citations = retriever.retrieve("verify")
    
    # Should only return the ACTIVE one (FAQ), not the DRAFT (User Guide)
    assert len(citations) > 0
    assert all(c.document_id == res2.document_id for c in citations)
    
    # Ensure no-result handling works (with score threshold)
    # The mock embedding creates vectors based on length.
    # To simulate a mismatch with low threshold, we can test retrieving something 
    # totally unrelated, or we can just mock vector_store.search temporarily.
    # We will test empty DB first:
    vector_store.documents = {}
    vector_store.chunks = []
    chunks_empty, citations_empty = retriever.retrieve("missing")
    assert len(chunks_empty) == 0
    assert len(citations_empty) == 0
    
    # Context builder
    context = build_rag_context(chunks_empty, "missing", "System Instruction")
    assert "No sufficiently relevant approved knowledge was retrieved" in context

def test_provider_failure_handling(monkeypatch):
    monkeypatch.setattr(settings, "AI_PROVIDER", "mock")
    retriever = Retriever()
    
    def mock_embed(*args, **kwargs):
        raise Exception("Provider failed")
        
    monkeypatch.setattr(retriever.embedding_provider, "embed_text", mock_embed)
    
    chunks, citations = retriever.retrieve("test")
    assert len(chunks) == 0
    assert len(citations) == 0
