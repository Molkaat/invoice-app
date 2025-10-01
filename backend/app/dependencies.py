from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.db.database import db_manager

security = HTTPBearer(auto_error=False)

async def verify_api_key(credentials = Depends(security)):
    """Optional API key verification"""
    return True

def get_db():
    """FastAPI dependency to get database session"""
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()