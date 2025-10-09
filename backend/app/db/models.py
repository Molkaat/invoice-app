from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any
from app.db.database import Base

class Company(Base):
    """Multi-tenant company/organization model"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email_domain = Column(String(255), unique=True, index=True)  # e.g., "company.com"
    subscription_plan = Column(String(50), default="starter")  # starter, pro, enterprise
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # SaaS-specific settings
    monthly_invoice_limit = Column(Integer, default=100)  # Based on subscription
    ai_credits_used = Column(Integer, default=0)
    ai_credits_limit = Column(Integer, default=1000)
    
    # Relationships
    users = relationship("User", back_populates="company")
    invoices = relationship("ProcessedInvoice", back_populates="company")

class User(Base):
    """User model with company association"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # ADD THIS LINE
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # admin, user, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    company = relationship("Company", back_populates="users")

class ProcessedInvoice(Base):
    """Store processed invoice data with original AI extraction and user corrections"""
    __tablename__ = "processed_invoices"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)  # Multi-tenant isolation
    
    filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), unique=True)
    file_size = Column(Integer)
    file_type = Column(String(50))
    
    # Processing metadata
    processing_timestamp = Column(DateTime, default=datetime.utcnow)
    processing_time_seconds = Column(Float)
    text_source = Column(String(20))
    detected_language = Column(String(10))
    date_format = Column(String(20))
    
    # Original AI extracted data
    original_data = Column(JSON, nullable=False)
    
    # User corrected data (starts as copy of original, gets updated)
    corrected_data = Column(JSON)
    
    # Processing quality metrics
    ocr_confidence = Column(Float)
    ai_confidence = Column(Float)
    processing_confidence = Column(Float)
    text_length = Column(Integer)
    
    # User interaction tracking
    user_corrections_count = Column(Integer, default=0)
    last_edited = Column(DateTime)
    is_validated = Column(Boolean, default=False)
    validation_timestamp = Column(DateTime)
    
    # Business insights (extracted by AI)
    spending_category = Column(String(50))
    payment_urgency = Column(String(20))
    data_completeness = Column(String(20))
    
    # Raw extracted text (for debugging and reprocessing)
    extracted_text = Column(Text)
    
    # Processing warnings and errors
    warnings = Column(JSON)
    errors = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="invoices")
    field_corrections = relationship("FieldCorrection", back_populates="invoice")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "company_id": self.company_id,  # Add this
            "filename": self.filename,
            "file_hash": self.file_hash,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "processing_timestamp": self.processing_timestamp.isoformat() if self.processing_timestamp else None,
            "processing_time_seconds": self.processing_time_seconds,
            "text_source": self.text_source,
            "detected_language": self.detected_language,
            "date_format": self.date_format,
            "original_data": self.original_data,
            "corrected_data": self.corrected_data,
            "ocr_confidence": self.ocr_confidence,
            "ai_confidence": self.ai_confidence,
            "processing_confidence": self.processing_confidence,
            "text_length": self.text_length,
            "user_corrections_count": self.user_corrections_count,
            "last_edited": self.last_edited.isoformat() if self.last_edited else None,
            "is_validated": self.is_validated,
            "validation_timestamp": self.validation_timestamp.isoformat() if self.validation_timestamp else None,
            "spending_category": self.spending_category,
            "payment_urgency": self.payment_urgency,
            "data_completeness": self.data_completeness,
            "extracted_text": self.extracted_text,
            "warnings": self.warnings,
            "errors": self.errors,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class FieldCorrection(Base):
    """Track individual field corrections to enable learning"""
    __tablename__ = "field_corrections"
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("processed_invoices.id"), nullable=False)  # Add ForeignKey
    
    # Field details
    field_path = Column(String(100), nullable=False)
    field_type = Column(String(20))
    
    # Values
    original_value = Column(Text)
    corrected_value = Column(Text)
    
    # Context for learning
    confidence_before = Column(Float)
    ocr_text_snippet = Column(Text)
    
    # Tracking
    correction_timestamp = Column(DateTime, default=datetime.utcnow)
    correction_type = Column(String(20))
    
    # Add relationship
    invoice = relationship("ProcessedInvoice", back_populates="field_corrections")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "field_path": self.field_path,
            "original_value": self.original_value,
            "corrected_value": self.corrected_value,
            "confidence_before": self.confidence_before,
            "correction_timestamp": self.correction_timestamp.isoformat() if self.correction_timestamp else None
        }

class ProcessingSession(Base):
    """Track batch processing sessions"""
    __tablename__ = "processing_sessions"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), unique=True)
    
    # Session metadata
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    total_files = Column(Integer)
    successful_files = Column(Integer, default=0)
    failed_files = Column(Integer, default=0)
    
    # Processing stats
    average_processing_time = Column(Float)
    total_corrections_made = Column(Integer, default=0)
    
    # User info (for multi-user support later)
    user_session = Column(String(100))
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_files": self.total_files,
            "successful_files": self.successful_files,
            "failed_files": self.failed_files,
            "success_rate": (self.successful_files / self.total_files * 100) if self.total_files else 0
        }

class PerformanceMetrics(Base):
    """Track system performance over time"""
    __tablename__ = "performance_metrics"
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    
    # Daily aggregates
    invoices_processed = Column(Integer, default=0)
    average_confidence = Column(Float)
    average_processing_time = Column(Float)
    total_corrections = Column(Integer, default=0)
    
    # Quality metrics
    accuracy_score = Column(Float)
    user_satisfaction = Column(Float)
    
    # System health
    error_rate = Column(Float)
    api_response_time = Column(Float)