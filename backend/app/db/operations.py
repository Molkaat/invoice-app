from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.models import ProcessedInvoice, FieldCorrection, ProcessingSession, PerformanceMetrics
from app.db.database import db_manager

class DatabaseOperations:
    def __init__(self):
        self.db_manager = db_manager
    
    def get_invoice_by_hash(self, file_hash: str) -> Optional[ProcessedInvoice]:
        """Get invoice by file hash to check for duplicates"""
        db = self.db_manager.get_session()
        try:
            return db.query(ProcessedInvoice).filter(
                ProcessedInvoice.file_hash == file_hash
            ).first()
        finally:
            db.close()
    
    def save_processed_invoice(
        self, 
        filename: str, 
        file_hash: str, 
        original_data: Dict[str, Any], 
        processing_info: Dict[str, Any],
        extracted_text: str = "",
        warnings: List[str] = None
    ) -> ProcessedInvoice:
        """Save a processed invoice to the database"""
        db = self.db_manager.get_session()
        try:
            # Extract relevant fields from the data
            analysis = original_data.get('analysis', {})
            business_insights = analysis.get('business_insights', {})
            
            invoice = ProcessedInvoice(
                filename=filename,
                file_hash=file_hash,
                file_size=processing_info.get('file_size'),
                file_type=processing_info.get('file_type'),
                text_source=processing_info.get('text_source'),
                detected_language=processing_info.get('detected_language'),
                date_format=processing_info.get('date_format'),
                original_data=original_data,
                corrected_data=original_data,
                ocr_confidence=processing_info.get('ocr_confidence'),
                ai_confidence=analysis.get('document_analysis', {}).get('overall_confidence'),
                processing_confidence=processing_info.get('processing_confidence'),
                text_length=processing_info.get('text_length'),
                spending_category=business_insights.get('spending_category'),
                payment_urgency=business_insights.get('payment_urgency'),
                data_completeness=business_insights.get('data_completeness'),
                extracted_text=extracted_text,
                warnings=warnings or []
            )
            
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
            return invoice
        finally:
            db.close()
    
    def save_field_correction(
        self, 
        invoice_id: int, 
        field_path: str, 
        original_value: str, 
        corrected_value: str,
        confidence_before: float = None,
        ocr_context: str = None
    ) -> FieldCorrection:
        """Save a field correction"""
        db = self.db_manager.get_session()
        try:
            correction = FieldCorrection(
                invoice_id=invoice_id,
                field_path=field_path,
                original_value=str(original_value) if original_value is not None else None,
                corrected_value=str(corrected_value) if corrected_value is not None else None,
                confidence_before=confidence_before,
                ocr_text_snippet=ocr_context
            )
            
            db.add(correction)
            
            # Update the invoice's correction count
            invoice = db.query(ProcessedInvoice).filter(ProcessedInvoice.id == invoice_id).first()
            if invoice:
                invoice.user_corrections_count += 1
                invoice.last_edited = datetime.utcnow()
            
            db.commit()
            db.refresh(correction)
            return correction
        finally:
            db.close()
    
    def get_processed_invoices(self, limit: int = 50, offset: int = 0) -> List[ProcessedInvoice]:
        """Get processed invoices with pagination"""
        db = self.db_manager.get_session()
        try:
            return db.query(ProcessedInvoice).order_by(
                ProcessedInvoice.processing_timestamp.desc()
            ).offset(offset).limit(limit).all()
        finally:
            db.close()
    
    def get_invoice_by_id(self, invoice_id: int) -> Optional[ProcessedInvoice]:
        """Get a specific invoice by ID"""
        db = self.db_manager.get_session()
        try:
            return db.query(ProcessedInvoice).filter(ProcessedInvoice.id == invoice_id).first()
        finally:
            db.close()
    
    def update_invoice_data(self, invoice_id: int, corrected_data: Dict[str, Any]) -> bool:
        """Update invoice with corrected data"""
        db = self.db_manager.get_session()
        try:
            invoice = db.query(ProcessedInvoice).filter(ProcessedInvoice.id == invoice_id).first()
            if invoice:
                invoice.corrected_data = corrected_data
                invoice.last_edited = datetime.utcnow()
                db.commit()
                return True
            return False
        finally:
            db.close()
    
    def get_field_corrections_stats(self) -> Dict[str, Any]:
        """Get statistics about field corrections for learning insights"""
        db = self.db_manager.get_session()
        try:
            total_corrections = db.query(FieldCorrection).count()
            
            # Most corrected fields
            field_correction_counts = db.query(
                FieldCorrection.field_path,
                db.func.count(FieldCorrection.id)
            ).group_by(FieldCorrection.field_path).all()
            
            return {
                "total_corrections": total_corrections,
                "most_corrected_fields": [
                    {"field": field, "corrections": count} 
                    for field, count in field_correction_counts
                ],
                "correction_patterns": self._analyze_correction_patterns(db)
            }
        finally:
            db.close()
    
    def _analyze_correction_patterns(self, db: Session) -> Dict[str, Any]:
        """Analyze patterns in corrections to improve future processing"""
        recent_corrections = db.query(FieldCorrection).filter(
            FieldCorrection.correction_timestamp > datetime.utcnow().replace(day=1)
        ).all()
        
        return {
            "recent_corrections": len(recent_corrections),
            "common_error_types": ["OCR misread", "Format parsing", "Business logic"]
        }

# Global instance
db_ops = DatabaseOperations()