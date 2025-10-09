from fastapi import HTTPException, UploadFile
from typing import Dict, Any, Optional, List, Tuple, Union
import logging
import os
import asyncio
from datetime import datetime
import traceback

from app.core.ocr import OCRProcessor
from app.core.ai_analyzer import AIAnalyzer
from app.core.validator import BusinessValidator
from app.utils.websocket_manager import ConnectionManager

logger = logging.getLogger(__name__)

class ProcessingStatus:
    """Track processing status for progress indicators"""
    def __init__(self):
        self.current_step = "initializing"
        self.progress = 0
        self.total_steps = 8
        self.steps = [
            "file_validation",
            "text_extraction", 
            "language_detection",
            "ai_analysis",
            "field_parsing",
            "validation",
            "confidence_scoring",
            "finalization"
        ]
    
    def update(self, step: str, progress: int = None):
        if step in self.steps:
            self.current_step = step
            self.progress = self.steps.index(step) + 1
            if progress:
                self.progress = progress
        logger.info(f"Processing step: {step} ({self.progress}/{self.total_steps})")
    
    def get_status(self) -> Dict:
        return {
            "current_step": self.current_step,
            "progress": self.progress,
            "total_steps": self.total_steps,
            "percentage": round((self.progress / self.total_steps) * 100, 1)
        }

class WebSocketProcessingStatus(ProcessingStatus):
    def __init__(self, client_id: str, connection_manager: ConnectionManager):
        super().__init__()
        self.client_id = client_id
        self.connection_manager = connection_manager
    
    async def update_async(self, step: str, progress: int = None):
        """Async version of update that sends WebSocket updates"""
        self.update(step, progress)  # Call parent update
        
        # Send update via WebSocket
        await self.connection_manager.send_progress_update(
            self.client_id, 
            self.get_status()
        )
        
        # Small delay to make progress visible
        await asyncio.sleep(0.1)

class InvoiceExtractor:
    def __init__(self):
        """Initialize the invoice extraction service"""
        logger.info("Initializing InvoiceExtractor with enhanced error handling and validation")
        
        self.ocr_processor = OCRProcessor()
        self.ai_analyzer = AIAnalyzer()
        self.validator = BusinessValidator()
        
        # Test components
        self.ocr_processor.test_tesseract()

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using PyPDF2 with enhanced error handling"""
        return self.ocr_processor.extract_text_from_pdf(file_content)

    def extract_text_from_image(self, image_content: bytes, status: ProcessingStatus) -> Dict[str, Any]:
        """Extract text from image using enhanced Tesseract OCR with comprehensive error handling"""
        return self.ocr_processor.extract_text_from_image(image_content, status)

    def detect_language_and_locale(self, text: str) -> Tuple[str, str]:
        """Detect document language and likely date format with error handling"""
        return self.ai_analyzer.detect_language_and_locale(text)

    def analyze_with_ai(self, extracted_text: str, language: str, date_format: str, status: ProcessingStatus) -> Dict[str, Any]:
        """Enhanced AI analysis with locale-specific instructions"""
        return self.ai_analyzer.analyze_with_ai(extracted_text, language, date_format, status)

    def validate_extracted_data(self, analysis: Dict, extracted_text: str, language: str, date_format: str) -> Dict:
        """Enhanced validation with locale awareness and business rules"""
        return self.validator.validate_extracted_data(analysis, extracted_text, language, date_format)

    async def process_document(self, file: UploadFile) -> Dict[str, Any]:
        """Main processing pipeline with enhanced locale-aware accuracy and comprehensive error handling"""
        status = ProcessingStatus()
        
        try:
            status.update("file_validation", 1)
            
            # Read file content
            try:
                file_content = await file.read()
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Failed to read uploaded file: {str(e)}"
                )
            
            logger.info(f"Processing file: {file.filename}, Type: {file.content_type}, Size: {len(file_content)} bytes")
            
            # Validate file size (max 10MB)
            if len(file_content) > 10 * 1024 * 1024:
                raise HTTPException(
                    status_code=413, 
                    detail="File too large. Maximum size is 10MB."
                )
            
            # Validate file content is not empty
            if len(file_content) == 0:
                raise HTTPException(status_code=400, detail="Empty file uploaded.")
            
            # Determine file type and extract text
            extracted_text = ""
            text_source = ""
            ocr_confidence = 1.0
            warnings = []
            
            if file.content_type == "application/pdf":
                try:
                    extracted_text = self.extract_text_from_pdf(file_content)
                    text_source = "pdf_extraction"
                    ocr_confidence = 1.0
                except HTTPException:
                    raise
                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"PDF processing failed: {str(e)}"
                    )
                    
            elif file.content_type and file.content_type.startswith("image/"):
                try:
                    ocr_result = self.extract_text_from_image(file_content, status)
                    extracted_text = ocr_result["text"]
                    text_source = "ocr"
                    ocr_confidence = ocr_result["ocr_confidence"]
                    warnings.extend(ocr_result.get("warnings", []))
                except HTTPException:
                    raise
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Image processing failed: {str(e)}"
                    )
                    
            elif not file.content_type:
                # Try to determine from filename
                filename_lower = file.filename.lower() if file.filename else ""
                if filename_lower.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif')):
                    try:
                        ocr_result = self.extract_text_from_image(file_content, status)
                        extracted_text = ocr_result["text"]
                        text_source = "ocr"
                        ocr_confidence = ocr_result["ocr_confidence"]
                        warnings.extend(ocr_result.get("warnings", []))
                    except HTTPException:
                        raise
                elif filename_lower.endswith('.pdf'):
                    try:
                        extracted_text = self.extract_text_from_pdf(file_content)
                        text_source = "pdf_extraction"
                        ocr_confidence = 1.0
                    except HTTPException:
                        raise
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail="Unknown file type. Please upload PDF or image files."
                    )
            else:
                logger.error(f"Unsupported file type: {file.content_type}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file.content_type}. Please upload PDF, JPG, PNG, or other image files."
                )
            
            # Check if we got meaningful text
            if not extracted_text or len(extracted_text.strip()) < 10:
                logger.warning(f"Insufficient text extracted: '{extracted_text[:50] if extracted_text else 'None'}...'")
                raise HTTPException(
                    status_code=400, 
                    detail="No readable text found in document. Please ensure the image is clear and contains text, or try a different file."
                )
            
            # Detect language and date format
            status.update("language_detection", 3)
            language, date_format = self.detect_language_and_locale(extracted_text)
            
            # AI Analysis with locale-specific instructions
            logger.info(f"Starting AI analysis with {language}/{date_format}...")
            analysis = self.analyze_with_ai(extracted_text, language, date_format, status)
            logger.info("Locale-aware AI analysis completed")
            
            status.update("confidence_scoring", 7)
            
            # Calculate overall processing confidence
            processing_confidence = min(
                ocr_confidence,
                analysis.get('document_analysis', {}).get('overall_confidence', 0.5)
            )
            
            status.update("finalization", 8)
            
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
                    "status": status.get_status()
                },
                "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
                "analysis": analysis,
                "warnings": warnings + analysis.get('validation_warnings', []),
                "timestamp": datetime.now().isoformat()
            }
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in process_document: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500, 
                detail=f"Processing failed: {str(e)}"
            )

# Initialize the extraction service
try:
    extractor = InvoiceExtractor()
    logger.info("Invoice extractor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize invoice extractor: {e}")
    extractor = None