from fastapi import APIRouter, WebSocket, UploadFile, File, HTTPException, Query, Depends
from typing import Dict, Any
import logging
import time
from datetime import datetime

from app.dependencies import verify_api_key
from app.utils.file_handler import validate_file, get_file_hash
from app.utils.websocket_manager import manager
from app.core.processor import extractor, WebSocketProcessingStatus
from app.db.operations import db_ops

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time progress updates"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
    finally:
        manager.disconnect(client_id)

@router.post("/extract-invoice-websocket/")
async def extract_invoice_websocket(
    client_id: str,
    file: UploadFile = File(...),
    save_to_db: bool = Query(True, description="Save results to database"),
    verified: bool = Depends(verify_api_key)
):
    """WebSocket-enabled processing with real-time progress updates and database storage"""
    
    if not extractor:
        raise HTTPException(
            status_code=503, 
            detail="Invoice extractor service unavailable"
        )
    
    if client_id not in manager.active_connections:
        raise HTTPException(
            status_code=400,
            detail="WebSocket connection required. Connect to /ws/{client_id} first."
        )
    
    start_time = time.time()
    
    try:
        validate_file(file)
        logger.info(f"Starting WebSocket processing for: {file.filename}")
        
        # Read file and check for duplicates
        file_content = await file.read()
        file_hash = get_file_hash(file_content)
        
        if save_to_db:
            existing = db_ops.get_invoice_by_hash(file_hash)
            
            if existing:
                logger.info(f"File {file.filename} already processed (ID: {existing.id})")
                
                # Get the stored data (use corrected_data if available, otherwise original_data)
                stored_data = existing.corrected_data or existing.original_data
                
                # Send completion message with properly formatted data
                completion_data = {
                    "success": True,
                    "message": "File already processed",
                    "existing_invoice_id": existing.id,
                    "processing_info": {
                        "filename": existing.filename,
                        "file_type": existing.file_type,
                        "text_source": existing.text_source,
                        "ocr_confidence": existing.ocr_confidence or 1.0,
                        "text_length": existing.text_length or 0,
                        "detected_language": existing.detected_language,
                        "date_format": existing.date_format,
                        "processing_confidence": existing.processing_confidence or 0.5,
                        "status": {
                            "current_step": "completed",
                            "progress": 8,
                            "total_steps": 8,
                            "percentage": 100
                        }
                    },
                    "extracted_text": existing.extracted_text or "",
                    "analysis": stored_data.get("analysis", {}) if stored_data else {},
                    "warnings": stored_data.get("warnings", []) if stored_data else [],
                    "timestamp": existing.processing_timestamp.isoformat() if existing.processing_timestamp else datetime.now().isoformat()
                }
                
                await manager.send_completion(client_id, completion_data)
                return {"success": True, "message": "File already processed"}
        
        # Reset file position
        await file.seek(0)
        
        # Create WebSocket-enabled status tracker
        status = WebSocketProcessingStatus(client_id, manager)
        
        # Process with real-time updates
        result = await process_document_with_websocket(file, status, save_to_db, file_hash, start_time)
        
        # Send completion message
        await manager.send_completion(client_id, result)
        
        return {"success": True, "message": "Processing completed"}
        
    except HTTPException as e:
        await manager.send_error(client_id, str(e.detail))
        raise
    except Exception as e:
        logger.error(f"WebSocket processing error: {e}")
        await manager.send_error(client_id, str(e))
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

async def process_document_with_websocket(file: UploadFile, status: WebSocketProcessingStatus, save_to_db: bool, file_hash: str, start_time: float):
    """Process document with WebSocket status updates and database storage"""
    
    try:
        await status.update_async("file_validation", 1)
        
        # Read file content
        try:
            file_content = await file.read()
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to read uploaded file: {str(e)}"
            )
        
        logger.info(f"Processing file: {file.filename}, Size: {len(file_content)} bytes")
        
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
        await status.update_async("text_extraction", 2)
        
        # Determine file type and extract text
        extracted_text = ""
        text_source = ""
        ocr_confidence = 1.0
        warnings = []
        
        if file.content_type == "application/pdf":
            try:
                extracted_text = extractor.extract_text_from_pdf(file_content)
                text_source = "pdf_extraction"
                ocr_confidence = 1.0
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")
                
        elif file.content_type and file.content_type.startswith("image/"):
            try:
                # Create a temporary status for OCR
                from app.core.processor import ProcessingStatus
                temp_status = ProcessingStatus()
                ocr_result = extractor.extract_text_from_image(file_content, temp_status)
                extracted_text = ocr_result["text"]
                text_source = "ocr"
                ocr_confidence = ocr_result["ocr_confidence"]
                warnings.extend(ocr_result.get("warnings", []))
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
        await status.update_async("language_detection", 3)
        
        # Detect language and date format
        language, date_format = extractor.detect_language_and_locale(extracted_text)
        
        await status.update_async("ai_analysis", 4)
        
        # AI Analysis
        logger.info(f"Starting AI analysis with {language}/{date_format}...")
        analysis = extractor.analyze_with_ai(extracted_text, language, date_format, status)
        
        await status.update_async("validation", 6)
        await status.update_async("confidence_scoring", 7)
        
        # Calculate overall processing confidence
        processing_confidence = min(
            ocr_confidence,
            analysis.get('document_analysis', {}).get('overall_confidence', 0.5)
        )
        
        processing_time = time.time() - start_time
        
        await status.update_async("finalization", 8)
        
        # Combine results
        response = {
            "success": True,
            "processing_info": {
                "filename": file.filename,
                "file_type": file.content_type or "unknown",
                "text_source": text_source,
                "ocr_confidence": ocr_confidence,
                "text_length": len(extracted_text),
                "detected_language": language,
                "date_format": date_format,
                "processing_confidence": processing_confidence,
                "status": status.get_status(),
                "processing_time": processing_time
            },
            "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
            "analysis": analysis,
            "warnings": warnings + analysis.get('validation_warnings', []),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to database if requested
        if save_to_db:
            try:
                processing_info = response["processing_info"]
                processing_info["file_size"] = len(file_content)
                
                saved_invoice = db_ops.save_processed_invoice(
                    filename=file.filename,
                    file_hash=file_hash,
                    original_data=response,
                    processing_info=processing_info,
                    extracted_text=extracted_text,
                    warnings=warnings
                )
                
                response["invoice_id"] = saved_invoice.id
                logger.info(f"Saved invoice to database with ID: {saved_invoice.id}")
                
            except Exception as e:
                logger.error(f"Failed to save invoice to database: {e}")
                response["database_error"] = f"Failed to save: {str(e)}"
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket processing: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")