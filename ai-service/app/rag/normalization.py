import re
import hashlib

def normalize_text(text: str) -> str:
    """Normalizes text by removing excessive whitespace and fixing basic issues."""
    # Replace carriage returns with standard newlines
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Replace multiple spaces with a single space (while keeping newlines)
    lines = text.split('\n')
    normalized_lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in lines]
    
    # Replace 3+ consecutive newlines with exactly 2 newlines (to preserve paragraphs/sections)
    text = '\n'.join(normalized_lines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def calculate_content_hash(text: str) -> str:
    """Calculates a deterministic hash for the given text."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()
