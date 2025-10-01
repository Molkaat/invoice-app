import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL

Base = declarative_base()

class DatabaseManager:
    def __init__(self, database_url: str = None):
        if database_url is None:
            database_url = DATABASE_URL
        
        self.engine = create_engine(
            database_url,
            echo=False,
            pool_pre_ping=True
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Import models to ensure they're registered
        from app.db.models import ProcessedInvoice, FieldCorrection, ProcessingSession, PerformanceMetrics
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get a database session"""
        return self.SessionLocal()

# Global database manager instance
db_manager = DatabaseManager()