from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import db_manager
from app.config import API_KEY_HEADER

def get_db():
    """FastAPI dependency to get database session"""
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()

def verify_api_key(api_key: Optional[str] = Header(None, alias=API_KEY_HEADER)):
    """Verify API key for general API access"""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    # You can add API key validation logic here
    # For now, just check if it exists
    return api_key

# JWT authentication temporarily removed - will add back later
# async def get_current_user(...):
#     pass

# async def get_current_active_user(...):
#     pass