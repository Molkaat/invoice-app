from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import asyncio
import uuid
import logging
import time
import hashlib
from datetime import datetime
from pydantic import BaseModel

from app.dependencies import verify_api_key, get_db
from app.utils.file_handler import validate_file, get_file_hash
from app.core.processor import extractor
from app.db.models import ProcessedInvoice, FieldCorrection
from app.db.operations import db_ops

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for processing tasks
processing_tasks: Dict[str, Dict[str, Any]] = {}

# Pydantic models for API requests
class FieldCorrectionRequest(BaseModel):
    invoice_id: int
    field_path: str
    new_value: Any
    original_value: Any = None
    confidence_before: Optional[float] = None

class InvoiceValidationRequest(BaseModel):
    invoice_id: int
    validated_data: Dict[str, Any]
    is_correct: bool = True

@router.post("/extract-invoice/")
async def extract_invoice(
    file: UploadFile = File(...),
    save_to_db: bool = Query(True, description="Save results to database"),
    verified: bool = Depends(verify_api_key)
):
    """Main endpoint for synchronous invoice processing with database storage"""
    
    if not extractor:
        raise HTTPException(
            status_code=503, 
            detail="Invoice extractor service unavailable. Please try again later."
        )
    
    start_time = time.time()
    
    try:
        validate_file(file)
        
        # Read file content and generate hash
        file_content = await file.read()
        file_hash = get_file_hash(file_content)
        
        # Check if file was already processed
        if save_to_db:
            existing_invoice = db_ops.get_invoice_by_hash(file_hash)
            
            if existing_invoice:
                logger.info(f"File {file.filename} already processed (ID: {existing_invoice.id})")
                
                # Get the stored data (use corrected_data if available, otherwise original_data)
                stored_data = existing_invoice.corrected_data or existing_invoice.original_data
                
                # Reconstruct the response in the expected format
                return {
                    "success": True,
                    "message": "File already processed",
                    "existing_invoice_id": existing_invoice.id,
                    "processing_info": {
                        "filename": existing_invoice.filename,
                        "file_type": existing_invoice.file_type,
                        "text_source": existing_invoice.text_source,
                        "ocr_confidence": existing_invoice.ocr_confidence or 1.0,
                        "text_length": existing_invoice.text_length or 0,
                        "detected_language": existing_invoice.detected_language,
                        "date_format": existing_invoice.date_format,
                        "processing_confidence": existing_invoice.processing_confidence or 0.5,
                        "status": {
                            "current_step": "completed",
                            "progress": 8,
                            "total_steps": 8,
                            "percentage": 100
                        }
                    },
                    "extracted_text": existing_invoice.extracted_text or "",
                    "analysis": stored_data.get("analysis", {}) if stored_data else {},
                    "warnings": stored_data.get("warnings", []) if stored_data else [],
                    "timestamp": existing_invoice.processing_timestamp.isoformat() if existing_invoice.processing_timestamp else datetime.now().isoformat()
                }
        
        # Reset file position for processing
        await file.seek(0)
        
        logger.info(f"Processing invoice: {file.filename}")
        
        # Process the file using the extraction service
        result = await extractor.process_document(file)
        
        processing_time = time.time() - start_time
        
        # Save to database if requested
        saved_invoice = None
        if save_to_db:
            try:
                processing_info = result.get("processing_info", {})
                processing_info["file_size"] = len(file_content)
                processing_info["processing_time"] = processing_time
                
                saved_invoice = db_ops.save_processed_invoice(
                    filename=file.filename,
                    file_hash=file_hash,
                    original_data=result,
                    processing_info=processing_info,
                    extracted_text=result.get("extracted_text", ""),
                    warnings=result.get("warnings", [])
                )
                
                result["invoice_id"] = saved_invoice.id
                logger.info(f"Saved invoice to database with ID: {saved_invoice.id}")
                
            except Exception as e:
                logger.error(f"Failed to save invoice to database: {e}")
                result["database_error"] = f"Failed to save: {str(e)}"
        
        # Log success
        processing_info = result.get("processing_info", {})
        logger.info(
            f"Successfully processed {file.filename}: "
            f"confidence={processing_info.get('processing_confidence', 'unknown'):.2f}, "
            f"warnings={len(result.get('warnings', []))}, "
            f"time={processing_time:.2f}s"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing {file.filename}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Processing failed: {str(e)}"
        )

@router.post("/extract-invoice-async/")
async def extract_invoice_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    verified: bool = Depends(verify_api_key)
):
    """Asynchronous invoice processing for large files"""
    
    if not extractor:
        raise HTTPException(
            status_code=503, 
            detail="Invoice extractor service unavailable"
        )
    
    try:
        validate_file(file)
        
        task_id = str(uuid.uuid4())
        
        processing_tasks[task_id] = {
            "status": "queued",
            "filename": file.filename,
            "created_at": datetime.now().isoformat(),
            "result": None,
            "error": None
        }
        
        background_tasks.add_task(process_document_async, task_id, file)
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "message": "Processing started. Use /status/{task_id} to check progress."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to queue processing for {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to queue processing: {str(e)}")

async def process_document_async(task_id: str, file: UploadFile):
    """Background task for processing documents"""
    try:
        processing_tasks[task_id]["status"] = "processing"
        processing_tasks[task_id]["updated_at"] = datetime.now().isoformat()
        
        logger.info(f"Background processing started for task {task_id}")
        
        result = await extractor.process_document(file)
        
        processing_tasks[task_id].update({
            "status": "completed",
            "result": result,
            "completed_at": datetime.now().isoformat()
        })
        
        logger.info(f"Background processing completed for task {task_id}")
        
    except Exception as e:
        processing_tasks[task_id].update({
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.now().isoformat()
        })
        
        logger.error(f"Background processing failed for task {task_id}: {e}")

@router.get("/status/{task_id}")
async def get_processing_status(task_id: str):
    """Get processing status for async tasks"""
    
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = processing_tasks[task_id]
    
    try:
        if task["status"] in ["completed", "failed"]:
            created_time = datetime.fromisoformat(task["created_at"])
            if (datetime.now() - created_time).total_seconds() > 3600:
                del processing_tasks[task_id]
                raise HTTPException(status_code=410, detail="Task results expired")
    except:
        pass
    
    return {
        "task_id": task_id,
        "status": task["status"],
        "filename": task.get("filename"),
        "created_at": task.get("created_at"),
        "result": task.get("result"),
        "error": task.get("error")
    }

@router.post("/save-field-correction/")
async def save_field_correction(
    correction: FieldCorrectionRequest,
    db: Session = Depends(get_db)
):
    """Save a field correction to improve future extractions"""
    
    try:
        # Verify invoice exists
        invoice = db.query(ProcessedInvoice).filter(ProcessedInvoice.id == correction.invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Save the correction
        field_correction = db_ops.save_field_correction(
            invoice_id=correction.invoice_id,
            field_path=correction.field_path,
            original_value=correction.original_value,
            corrected_value=correction.new_value,
            confidence_before=correction.confidence_before
        )
        
        # Update the invoice's corrected data
        corrected_data = invoice.corrected_data or invoice.original_data
        
        # Navigate to the field and update it
        path_parts = correction.field_path.split('.')
        current = corrected_data.get('analysis', {})
        
        for i, part in enumerate(path_parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
        
        current[path_parts[-1]] = correction.new_value
        
        # Save updated invoice data
        db_ops.update_invoice_data(correction.invoice_id, corrected_data)
        
        return {
            "success": True,
            "correction_id": field_correction.id,
            "message": "Field correction saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving field correction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save correction: {str(e)}")

@router.post("/validate-invoice/")
async def validate_invoice(
    validation: InvoiceValidationRequest,
    db: Session = Depends(get_db)
):
    """Mark an invoice as validated by user"""
    
    try:
        invoice = db.query(ProcessedInvoice).filter(ProcessedInvoice.id == validation.invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Update validation status
        invoice.is_validated = validation.is_correct
        invoice.corrected_data = validation.validated_data
        invoice.last_edited = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Invoice validation saved"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating invoice: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate invoice: {str(e)}")

@router.get("/invoices/")
async def get_processed_invoices(
    limit: int = Query(50, description="Number of invoices to return"),
    offset: int = Query(0, description="Number of invoices to skip"),
    db: Session = Depends(get_db)
):
    """Get list of processed invoices with pagination"""
    
    try:
        invoices = db_ops.get_processed_invoices(limit=limit, offset=offset)
        total_count = db.query(ProcessedInvoice).count()
        
        return {
            "success": True,
            "invoices": [invoice.to_dict() for invoice in invoices],
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_count
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving invoices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve invoices: {str(e)}")

@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific invoice by ID"""
    
    try:
        invoice = db_ops.get_invoice_by_id(invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get field corrections for this invoice
        corrections = db.query(FieldCorrection).filter(
            FieldCorrection.invoice_id == invoice_id
        ).order_by(FieldCorrection.correction_timestamp.desc()).all()
        
        return {
            "success": True,
            "invoice": invoice.to_dict(),
            "original_data": invoice.original_data,
            "corrected_data": invoice.corrected_data,
            "corrections": [correction.to_dict() for correction in corrections],
            "processing_info": {
                "filename": invoice.filename,
                "processing_timestamp": invoice.processing_timestamp.isoformat() if invoice.processing_timestamp else None,
                "ocr_confidence": invoice.ocr_confidence,
                "ai_confidence": invoice.ai_confidence,
                "text_length": invoice.text_length
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving invoice: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve invoice: {str(e)}")

@router.delete("/invoices/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """Delete an invoice and its corrections"""
    
    try:
        # Delete field corrections first
        db.query(FieldCorrection).filter(FieldCorrection.invoice_id == invoice_id).delete()
        
        # Delete the invoice
        deleted_count = db.query(ProcessedInvoice).filter(ProcessedInvoice.id == invoice_id).delete()
        
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        db.commit()
        
        return {
            "success": True,
            "message": "Invoice deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting invoice: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete invoice: {str(e)}")

@router.get("/analytics/corrections")
async def get_correction_analytics():
    """Get analytics about field corrections for learning insights"""
    
    try:
        stats = db_ops.get_field_corrections_stats()
        
        return {
            "success": True,
            "analytics": stats,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating correction analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")