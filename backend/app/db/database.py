import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class DatabaseManager:
    def __init__(self, database_url: str = None):
        if database_url is None:
            # Fallback to direct environment variable if settings doesn't work
            database_url = os.getenv("DATABASE_URL", "sqlite:///./invoices.db")
        
        # Configure engine based on database type
        if database_url.startswith("sqlite"):
            self.engine = create_engine(
                database_url,
                echo=False,
                pool_pre_ping=True,
                connect_args={"check_same_thread": False}
            )
        else:
            self.engine = create_engine(
                database_url,
                echo=False,
                pool_pre_ping=True
            )
        
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create tables
        self._create_tables()
    
    def _create_tables(self):
        """Create database tables"""
        try:
            # Import models to ensure they're registered
            from app.db.models import ProcessedInvoice, FieldCorrection, ProcessingSession, PerformanceMetrics
            Base.metadata.create_all(bind=self.engine)
        except Exception as e:
            print(f"Warning: Could not create tables: {e}")
    
    def get_session(self):
        """Get a database session"""
        return self.SessionLocal()

# Global database manager instance
db_manager = DatabaseManager()