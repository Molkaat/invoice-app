import os
from dotenv import load_dotenv

load_dotenv()

# Environment variables
AINBOX_API_KEY = os.getenv("AINBOX_API_KEY")
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///invoices.db')
SECRET_KEY = os.getenv("SECRET_KEY")  # Add this
API_KEY_HEADER = os.getenv("API_KEY_HEADER", "X-API-Key")  # Add this

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"
]

# File validation
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/gif"
]
ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']

if not AINBOX_API_KEY:
    raise RuntimeError("AINBOX_API_KEY not set in environment variables")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set in environment variables")