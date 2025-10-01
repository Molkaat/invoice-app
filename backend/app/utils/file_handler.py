import hashlib
from fastapi import HTTPException, UploadFile
from app.config import MAX_FILE_SIZE, ALLOWED_CONTENT_TYPES, ALLOWED_EXTENSIONS

def get_file_hash(file_content: bytes) -> str:
    """Generate hash for file deduplication"""
    return hashlib.sha256(file_content).hexdigest()

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file before processing"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    filename_lower = file.filename.lower()
    
    if file.content_type not in ALLOWED_CONTENT_TYPES and not any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: PDF, JPG, PNG, BMP, TIFF, GIF"
        )
    
    if len(file.filename) > 255:
        raise HTTPException(status_code=400, detail="Filename too long (max 255 characters)")
    
    dangerous_chars = ['..', '/', '\\', '<', '>', ':', '"', '|', '?', '*']
    if any(char in file.filename for char in dangerous_chars):
        raise HTTPException(status_code=400, detail="Invalid characters in filename")