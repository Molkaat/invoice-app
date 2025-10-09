import cv2
import numpy as np
import io
import PyPDF2
import pytesseract
from PIL import Image, ImageEnhance
from fastapi import HTTPException
from typing import Dict, Any, Tuple
import logging
import traceback

# Set Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

logger = logging.getLogger(__name__)

class OCRProcessor:
    def __init__(self):
        self.test_tesseract()
    
    def test_tesseract(self):
        """Test Tesseract installation"""
        try:
            pytesseract.get_tesseract_version()
            logger.info("Tesseract OCR is available")
        except Exception as e:
            logger.error(f"Tesseract not found: {e}")
            logger.error("Please install Tesseract: sudo apt install tesseract-ocr (Linux) or brew install tesseract (Mac)")

    def deskew_image(self, image: np.ndarray) -> np.ndarray:
        """Deskew image by detecting text lines with enhanced error handling"""
        try:
            if image is None or image.size == 0:
                raise ValueError("Empty image provided for deskewing")
                
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
                
            if gray.size == 0:
                raise ValueError("Grayscale conversion failed")
                
            # Find edges
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Find lines using Hough transform
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None and len(lines) > 0:
                angles = []
                for rho, theta in lines[:10]:  # Use first 10 lines
                    angle = theta * 180 / np.pi
                    if angle > 90:
                        angle = angle - 180
                    angles.append(angle)
                
                if angles:  # Check if we have angles
                    # Get median angle
                    median_angle = np.median(angles)
                    
                    # Rotate image if skew is significant
                    if abs(median_angle) > 0.5 and abs(median_angle) < 45:  # Reasonable angle range
                        logger.info(f"Deskewing image by {median_angle:.1f} degrees")
                        rows, cols = gray.shape
                        M = cv2.getRotationMatrix2D((cols/2, rows/2), median_angle, 1)
                        return cv2.warpAffine(image, M, (cols, rows), borderValue=(255,255,255))
            
            return image
            
        except Exception as e:
            logger.warning(f"Deskewing failed: {e}, returning original image")
            return image

    def enhance_image_quality(self, image: Image.Image) -> Image.Image:
        """Advanced image preprocessing for better OCR with comprehensive error handling"""
        try:
            if image is None:
                raise ValueError("None image provided for enhancement")
            
            # Validate image
            if image.size[0] == 0 or image.size[1] == 0:
                raise ValueError("Invalid image dimensions")
            
            # Convert PIL image to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            if cv_image is None or cv_image.size == 0:
                raise ValueError("OpenCV conversion failed")
            
            # Deskew the image
            cv_image = self.deskew_image(cv_image)
            
            # Upscale image for better OCR (2x resolution)
            height, width = cv_image.shape[:2]
            
            # Limit upscaling for very large images
            if width * height > 4000000:  # 4MP limit
                logger.warning("Large image detected, skipping upscaling")
            else:
                cv_image = cv2.resize(cv_image, (width * 2, height * 2), interpolation=cv2.INTER_CUBIC)
            
            # Convert to grayscale
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Advanced denoising
            denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
            
            # Adaptive thresholding for better text contrast
            binary = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Morphological operations to clean up text
            kernel = np.ones((1,1), np.uint8)
            cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            
            # Convert back to PIL Image
            result = Image.fromarray(cleaned)
            
            if result.size[0] == 0 or result.size[1] == 0:
                raise ValueError("Enhanced image has invalid dimensions")
            
            return result
            
        except Exception as e:
            logger.warning(f"Advanced image enhancement failed: {e}. Using basic enhancement.")
            return self.basic_enhance_image(image)

    def basic_enhance_image(self, image: Image.Image) -> Image.Image:
        """Basic image enhancement fallback with error handling"""
        try:
            if image is None:
                raise ValueError("None image provided for basic enhancement")
            
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(2.0)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.5)
            
            return image
            
        except Exception as e:
            logger.warning(f"Basic enhancement failed: {e}, returning original image")
            return image if image else Image.new('L', (100, 100), 255)

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using PyPDF2 with enhanced error handling"""
        try:
            if not file_content or len(file_content) == 0:
                raise ValueError("Empty PDF content")
            
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            
            if len(pdf_reader.pages) == 0:
                raise ValueError("PDF contains no pages")
            
            text = ""
            for i, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {i+1}: {e}")
                    continue
            
            text = text.strip()
            
            if len(text) > 50:
                return text
            
            logger.info("PDF text extraction yielded minimal content, may need OCR")
            return "OCR extraction needed for scanned PDF"
            
        except Exception as e:
            logger.error(f"PDF processing error: {e}")
            raise HTTPException(
                status_code=400, 
                detail=f"PDF processing failed: {str(e)}. File may be corrupted or password-protected."
            )

    def extract_text_with_multiple_configs(self, image: Image.Image) -> Tuple[str, float]:
        """Try multiple OCR configurations and return the best result with error handling"""
        
        if image is None:
            raise ValueError("None image provided for OCR")
        
        configs = [
            '--psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,/:- ',
            '--psm 4 -c preserve_interword_spaces=1',
            '--psm 3',
            '--psm 6',
            '--psm 1',
        ]
        
        best_result = ""
        best_confidence = 0
        errors = []
        
        for config in configs:
            try:
                text = pytesseract.image_to_string(image, config=config)
                
                if not text or len(text.strip()) == 0:
                    continue
                
                # Get confidence data
                try:
                    data = pytesseract.image_to_data(image, config=config, output_type=pytesseract.Output.DICT)
                    confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                except Exception as conf_e:
                    logger.warning(f"Confidence calculation failed: {conf_e}")
                    avg_confidence = 50  # Default confidence
                
                # Prefer results with more words and higher confidence
                word_count = len([w for w in text.split() if w.strip()])
                score = avg_confidence * 0.7 + word_count * 0.3
                
                if score > best_confidence and word_count > 5:
                    best_confidence = avg_confidence
                    best_result = text
                    logger.info(f"Config '{config[:15]}...': {avg_confidence:.1f}% confidence, {word_count} words")
                
            except Exception as e:
                error_msg = f"OCR config '{config[:15]}...' failed: {e}"
                errors.append(error_msg)
                logger.warning(error_msg)
                continue
        
        if not best_result:
            error_summary = "; ".join(errors[-3:])  # Show last 3 errors
            raise HTTPException(
                status_code=400,
                detail=f"All OCR configurations failed. Recent errors: {error_summary}"
            )
        
        return best_result, best_confidence / 100

    def extract_text_from_image(self, image_content: bytes, status) -> Dict[str, Any]:
        """Extract text from image using enhanced Tesseract OCR with comprehensive error handling"""
        try:
            if not image_content or len(image_content) == 0:
                raise HTTPException(status_code=400, detail="Empty image content")
                
            logger.info(f"Processing image of size: {len(image_content)} bytes")
            status.update("text_extraction", 2)
            
            # Convert bytes to PIL Image
            try:
                image = Image.open(io.BytesIO(image_content))
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid image format: {str(e)}"
                )
            
            if image.size[0] == 0 or image.size[1] == 0:
                raise HTTPException(status_code=400, detail="Invalid image dimensions")
            
            logger.info(f"Image opened successfully. Size: {image.size}, Mode: {image.mode}")
            
            # Convert to RGB if needed
            try:
                if image.mode not in ['RGB', 'L']:
                    image = image.convert('RGB')
                    logger.info(f"Converted image to RGB mode")
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Image conversion failed: {str(e)}"
                )
            
            # Enhance image quality with advanced preprocessing
            try:
                enhanced_image = self.enhance_image_quality(image)
            except Exception as e:
                logger.warning(f"Image enhancement failed: {e}, using original")
                enhanced_image = image
            
            # Extract text using multiple OCR configurations
            logger.info("Starting enhanced Tesseract OCR...")
            try:
                extracted_text, avg_confidence = self.extract_text_with_multiple_configs(enhanced_image)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"OCR processing failed: {str(e)}"
                )
            
            logger.info("Enhanced Tesseract OCR completed")
            
            word_count = len([word for word in extracted_text.split() if word.strip()])
            
            logger.info(f"Enhanced OCR extracted {word_count} words with confidence: {avg_confidence:.2f}")
            
            if word_count == 0:
                logger.warning("No text detected by enhanced OCR")
                return {
                    "text": "No text detected in image",
                    "ocr_confidence": 0.0,
                    "word_count": 0,
                    "warnings": ["No readable text found in image"]
                }
            
            return {
                "text": extracted_text.strip(),
                "ocr_confidence": avg_confidence,
                "word_count": word_count,
                "warnings": []
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected OCR error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500, 
                detail=f"Image processing failed: {str(e)}"
            )