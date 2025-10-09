from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from datetime import datetime
import logging
import time
import json
from app.core.config import settings  # Fixed import path
from app.api import invoices, websocket, exports
from app.api import auth  # ADD THIS IMPORT

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Invoice AI Demo",
    description="Enhanced invoice processing with database persistence and learning",
    version="2.2.0"
)

# CORS middleware - parse the JSON string from settings
try:
    CORS_ORIGINS = json.loads(settings.CORS_ORIGINS) if isinstance(settings.CORS_ORIGINS, str) else settings.CORS_ORIGINS
except (json.JSONDecodeError, AttributeError):
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]  # fallback

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(invoices.router)
app.include_router(websocket.router)
app.include_router(exports.router)
app.include_router(auth.router)  # ADD THIS LINE

@app.middleware("http")
async def log_requests(request, call_next):
    """Log all requests for debugging"""
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} in {process_time:.2f}s")
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request failed after {process_time:.2f}s: {e}")
        raise HTTPException(status_code=500, detail=f"Request processing failed: {str(e)}")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "timestamp": datetime.now().isoformat()
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": 500,
                "message": "Internal server error",
                "timestamp": datetime.now().isoformat()
            }
        }
    )

@app.get("/")
async def root():
    """API root endpoint with basic info"""
    return {
        "message": "Invoice AI Demo API v2.2 with Database & Learning",
        "status": "running",
        "endpoints": {
            "extract": "/extract-invoice/",
            "extract_websocket": "/extract-invoice-websocket/",
            "websocket": "/ws/{client_id}",
            "extract_async": "/extract-invoice-async/",
            "status": "/status/{task_id}",
            "invoices": "/invoices/",
            "corrections": "/save-field-correction/",
            "analytics": "/analytics/corrections",
            "export": "/export/invoices",
            "health": "/health",
            "docs": "/docs"
        },
        "features": [
            "Real-time processing with WebSocket",
            "Database persistence",
            "Field-level corrections",
            "Learning from user feedback",
            "Export capabilities",
            "Processing analytics",
            "Duplicate detection"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Enhanced health check with system status"""
    try:
        from app.core.processor import extractor
        from app.db.database import db_manager
        from app.db.models import ProcessedInvoice
        from app.utils.websocket_manager import manager
        import os
        
        if not extractor:
            raise HTTPException(status_code=503, detail="Invoice extractor not initialized")
        
        # Test database connection
        try:
            db = db_manager.get_session()
            invoice_count = db.query(ProcessedInvoice).count()
            db.close()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")
        
        missing_env = []
        if not os.getenv("AINBOX_API_KEY"):
            missing_env.append("AINBOX_API_KEY")
        
        status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "2.2.0",
            "services": {
                "extractor": "available",
                "database": "connected",
                "websocket": "available",
                "tesseract": "available",
                "ai_api": "available"
            },
            "stats": {
                "processed_invoices": invoice_count,
                "active_connections": len(manager.active_connections)
            }
        }
        
        if missing_env:
            status["warnings"] = f"Missing environment variables: {', '.join(missing_env)}"
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )