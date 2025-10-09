import hashlib
import json
from typing import List, Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings  # Fixed import path

def validate_file(file: UploadFile) -> Tuple[bool, str]:
    """Validate uploaded file"""
    try:
        # Get settings values
        max_file_size = settings.MAX_FILE_SIZE
        allowed_file_types = json.loads(settings.ALLOWED_FILE_TYPES) if isinstance(settings.ALLOWED_FILE_TYPES, str) else settings.ALLOWED_FILE_TYPES
        
        # Check file size
        if file.size and file.size > max_file_size:
            return False, f"File size exceeds maximum allowed size of {max_file_size} bytes"
        
        # Check file type
        if file.content_type not in allowed_file_types:
            return False, f"File type {file.content_type} not allowed. Allowed types: {allowed_file_types}"
        
        return True, "File validation passed"
        
    except Exception as e:
        return False, f"File validation error: {str(e)}"

def get_file_hash(file_content: bytes) -> str:
    """Generate SHA-256 hash of file content"""
    return hashlib.sha256(file_content).hexdigest()