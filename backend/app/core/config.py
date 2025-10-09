import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # API Info
    api_name: str = "Invoice AI API"
    api_version: str = "3.0.0"
    api_url: str = "http://localhost:8000"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./invoices.db"
    
    # API Keys
    ainbox_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    api_key_header: str = "X-API-Key"
    
    # AI Configuration
    ai_api_url: str = "https://workspace.ainbox.ai/api/chat/completions"
    ai_model: str = "gpt-4"
    ai_timeout: int = 60
    
    # File Processing
    allowed_file_types: str = '["application/pdf","image/png","image/jpeg","image/jpg","image/tiff","image/gif"]'
    tesseract_cmd: str = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: List[str] = [".pdf", ".png", ".jpg", ".jpeg"]
    
    # WebSocket Configuration
    ws_heartbeat_interval: int = 30
    ws_reconnect_delay: int = 3
    
    # Processing Settings
    processing_timeout: int = 300
    max_concurrent_jobs: int = 5
    job_timeout: int = 300
    
    # Localization
    default_language: str = "en"
    default_date_format: str = "MM/DD/YYYY"
    
    # Validation Thresholds
    min_confidence_threshold: float = 0.5
    max_amount_threshold: float = 1000000.0
    tax_rate_warning_threshold: float = 25.0
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # Webhook URLs
    quickbooks_webhook_url: Optional[str] = None
    xero_webhook_url: Optional[str] = None
    default_webhook_url: Optional[str] = None
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        # Allow extra fields from .env file
        extra = "allow"

settings = Settings()