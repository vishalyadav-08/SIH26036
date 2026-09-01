from typing import List

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    if not text:
        return []
    if chunk_size <= chunk_overlap:
        raise ValueError("chunk_size must be greater than chunk_overlap")
        
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        
        if end >= text_length:
            chunk_str = text[start:].strip()
            if chunk_str:
                chunks.append(chunk_str)
            break
            
        break_point = end
        for i in range(end, max(start + chunk_overlap, end - (chunk_size // 2)), -1):
            if text[i - 1] in ['\n', ' ', '.', '!', '?']:
                break_point = i
                break
                
        chunk_str = text[start:break_point].strip()
        if chunk_str:
            chunks.append(chunk_str)
        
        previous_start = start
        start = break_point - chunk_overlap
        
        if start <= previous_start:
            start = previous_start + 1 # force forward progress
            
    return chunks
