import requests
import json
from fastapi import HTTPException
from typing import Dict, Any, Tuple
import logging
from app.config import AINBOX_API_KEY

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        if not AINBOX_API_KEY:
            raise RuntimeError("AINBOX_API_KEY not set in environment variables")

    def ask_ainbox_gpt(self, system_prompt: str, user_prompt: str) -> str:
        """Call AInbox GPT-4 API with enhanced error handling"""
        url = "https://workspace.ainbox.ai/api/chat/completions"
        headers = {
            "Authorization": f"Bearer {AINBOX_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 3000,
            "temperature": 0.05
        }
        
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=60)
            res.raise_for_status()
            
            response_data = res.json()
            
            if 'choices' not in response_data or not response_data['choices']:
                raise HTTPException(
                    status_code=500, 
                    detail="Invalid AI API response: missing choices"
                )
            
            return response_data["choices"][0]["message"]["content"]
            
        except requests.exceptions.Timeout:
            logger.error("AI API timeout")
            raise HTTPException(
                status_code=504, 
                detail="AI processing timeout. Please try again with a smaller file."
            )
        except requests.exceptions.ConnectionError:
            logger.error("AI API connection error")
            raise HTTPException(
                status_code=503, 
                detail="AI service unavailable. Please try again later."
            )
        except requests.exceptions.HTTPError as e:
            logger.error(f"AI API HTTP error: {e}")
            if e.response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="AI service rate limit exceeded. Please wait and try again."
                )
            elif e.response.status_code == 401:
                raise HTTPException(
                    status_code=500,
                    detail="AI service authentication failed. Please contact support."
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"AI service error: {e.response.status_code}"
                )
        except Exception as e:
            logger.error(f"Unexpected AI API error: {e}")
            raise HTTPException(
                status_code=500, 
                detail="AI processing failed. Please try again."
            )

    def detect_language_and_locale(self, text: str) -> Tuple[str, str]:
        """Detect document language and likely date format with error handling"""
        try:
            if len(text.strip()) < 10:
                logger.warning("Insufficient text for language detection")
                return 'en', 'MM/DD/YYYY'
            
            detection_prompt = """
            Analyze this invoice text and determine:
            1. Language (en/fr/de/es/it/nl/pt)
            2. Likely country/region based on address, currency, language
            3. Expected date format (MM/DD/YYYY for US, DD/MM/YYYY for most others)
            
            Return JSON: {"language": "en", "country": "US", "date_format": "MM/DD/YYYY"}
            """
            
            result = self.ask_ainbox_gpt(detection_prompt, text[:800])
            detection = json.loads(result)
            
            language = detection.get('language', 'en')
            country = detection.get('country', 'US')
            date_format = detection.get('date_format', 'MM/DD/YYYY')
            
            # Validate detected values
            valid_languages = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt']
            if language not in valid_languages:
                logger.warning(f"Invalid language detected: {language}, defaulting to English")
                language = 'en'
            
            logger.info(f"Detected: {language} language, {country} country, {date_format} format")
            return language, date_format
            
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Language detection parsing failed: {e}, defaulting to English/US")
            return 'en', 'MM/DD/YYYY'
        except Exception as e:
            logger.warning(f"Language detection failed: {e}, defaulting to English/US")
            return 'en', 'MM/DD/YYYY'

    def analyze_with_ai(self, extracted_text: str, language: str, date_format: str, status) -> Dict[str, Any]:
        """Enhanced AI analysis with locale-specific instructions"""
        
        status.update("ai_analysis", 4)
        
        # Create locale-aware system prompt
        date_format_example = {
            "MM/DD/YYYY": "11/02/2019 means November 2nd, 2019 -> 2019-11-02",
            "DD/MM/YYYY": "11/02/2019 means 11th February, 2019 -> 2019-02-11"
        }
        
        example = date_format_example.get(date_format, date_format_example["MM/DD/YYYY"])
        
        system_prompt = f"""
        You are extracting data from an invoice in {language} language with {date_format} date format.
        
        CRITICAL DATE PARSING RULES FOR {date_format}:
        - {example}
        - ALWAYS convert dates to YYYY-MM-DD format
        - For ambiguous dates like "1102/2019", interpret as {date_format}
        
        QUANTITY vs DESCRIPTION RULES:
        - "Labor 3hrs" = description: "Labor (3 hours)", quantity: 1 (NOT quantity: 3)
        - Time units (hours, days, minutes) are descriptions, not quantities
        - Quantity = number of items/services, not time duration
        
        LINE ITEMS ACCURACY:
        - Extract EXACT amounts from the text
        - Don't confuse unit prices with total amounts
        - Validate quantity × unit_price = amount when possible
        
        OCR ERROR CORRECTION:
        - Fix obvious character mistakes: "1l02" -> "1102", "0" vs "O"
        - Correct misread currency symbols and decimal points
        
        Return analysis as valid JSON:
        {{
            "document_analysis": {{
                "document_type": "invoice/receipt/bill/other",
                "detected_language": "{language}",
                "text_quality": "excellent/good/fair/poor", 
                "overall_confidence": 0.0-1.0
            }},
            "financial_data": {{
                "total_amount": number_or_null,
                "currency": "currency_code_or_null",
                "tax_amount": number_or_null,
                "subtotal": number_or_null
            }},
            "vendor_info": {{
                "vendor_name": "string_or_null",
                "contact_info": "string_or_null"
            }},
            "document_details": {{
                "invoice_number": "string_or_null",
                "invoice_date": "YYYY-MM-DD_or_null",
                "due_date": "YYYY-MM-DD_or_null"
            }},
            "line_items": [
                {{"description": "string", "amount": number_or_null, "quantity": number_or_null}}
            ],
            "business_insights": {{
                "spending_category": "software/services/supplies/utilities/other",
                "payment_urgency": "immediate/standard/flexible",
                "data_completeness": "complete/partial/minimal"
            }}
        }}
        
        Return only valid JSON, no explanation.
        """
        
        user_prompt = f"Extract and analyze data from this document text:\n\n{extracted_text}"
        
        try:
            ai_result = self.ask_ainbox_gpt(system_prompt, user_prompt)
            status.update("field_parsing", 5)
            
            # Parse AI response
            analysis = json.loads(ai_result)
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"AI raw response: {ai_result[:200]}...")
            return {
                "error": "AI response parsing failed",
                "raw_response": ai_result[:500],
                "document_analysis": {
                    "document_type": "unknown",
                    "detected_language": language,
                    "text_quality": "poor",
                    "overall_confidence": 0.0
                },
                "validation_warnings": [f"Failed to parse AI response: {str(e)}"]
            }