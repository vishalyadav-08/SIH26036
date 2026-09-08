import os
import glob
from app.rag.ingestion import IngestionPipeline

def run_ingestion():
    pipeline = IngestionPipeline()
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../knowledge"))
    
    # Ingest MapanSetu Knowledge
    mapansetu_files = glob.glob(os.path.join(base_dir, "mapansetu/**/*.md"), recursive=True)
    for filepath in mapansetu_files:
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
            
        metadata = {
            "title": os.path.basename(filepath),
            "source": filepath,
            "authority": "MapanSetu Project Specification",
            "category": "product",
            "review_status": "ACTIVE",
            "version": "1.0"
        }
        res = pipeline.ingest_text(text, metadata)
        print(f"MapanSetu: {filepath} -> Success: {res.success}, Msg: {res.message}")

    # Ingest Legal Knowledge
    legal_files = glob.glob(os.path.join(base_dir, "legal/**/*.md"), recursive=True)
    for filepath in legal_files:
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
            
        metadata = {
            "title": os.path.basename(filepath),
            "source": filepath,
            "authority": "Government of India",
            "category": "legal",
            "review_status": "ACTIVE",
            "version": "Current",
            "jurisdiction": "INDIA",
            "jurisdiction_type": "NATIONAL",
            "source_url": "https://consumeraffairs.nic.in/"
        }
        res = pipeline.ingest_text(text, metadata)
        print(f"Legal: {filepath} -> Success: {res.success}, Msg: {res.message}")

if __name__ == "__main__":
    run_ingestion()
