import re
from datetime import datetime, timedelta
from typing import Union, Tuple, List, Dict, Any, Optional
from decimal import Decimal, InvalidOperation
import logging
from app.utils.exceptions import ValidationError

logger = logging.getLogger(__name__)

class BusinessValidator:
    """Business logic validation rules"""
    
    @staticmethod
    def validate_amount(amount: Union[float, int, str], field_name: str) -> Tuple[float, List[str]]:
        """Validate monetary amounts with business rules"""
        warnings = []
        
        try:
            if isinstance(amount, str):
                # Clean string input
                cleaned = re.sub(r'[^\d.,\-]', '', str(amount))
                if not cleaned:
                    raise ValidationError(field_name, "Empty amount after cleaning", amount)
                amount = float(cleaned.replace(',', ''))
            
            amount = float(amount)
            
            # Business validation rules
            if amount < 0:
                warnings.append(f"Negative {field_name} detected: {amount}")
            if amount == 0:
                warnings.append(f"Zero {field_name} detected")
            if amount > 1000000:  # $1M threshold
                warnings.append(f"Unusually large {field_name}: ${amount:,.2f}")
            
            return amount, warnings
            
        except (ValueError, TypeError, InvalidOperation) as e:
            raise ValidationError(field_name, f"Invalid amount format: {amount}", amount)
    
    @staticmethod
    def validate_date(date_str: str, field_name: str) -> Tuple[str, List[str]]:
        """Validate dates with business logic"""
        warnings = []
        
        if not date_str:
            raise ValidationError(field_name, "Empty date", date_str)
        
        try:
            # Parse the date
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            
            # Business validation rules
            current_date = datetime.now()
            
            if parsed_date > current_date + timedelta(days=365):
                warnings.append(f"{field_name} is more than 1 year in the future")
            
            if parsed_date < current_date - timedelta(days=365*5):
                warnings.append(f"{field_name} is more than 5 years old")
            
            if field_name == "due_date" and parsed_date < current_date - timedelta(days=90):
                warnings.append("Invoice is significantly overdue")
            
            return date_str, warnings
            
        except ValueError as e:
            raise ValidationError(field_name, f"Invalid date format: {date_str}", date_str)
    
    @staticmethod
    def validate_financial_totals(subtotal: float, tax: float, total: float) -> List[str]:
        """Validate financial calculations"""
        warnings = []
        
        try:
            calculated_total = subtotal + tax
            difference = abs(calculated_total - total)
            
            if difference > 0.02:  # Allow 2 cent rounding difference
                warnings.append(
                    f"Total mismatch: Subtotal ({subtotal}) + Tax ({tax}) = {calculated_total}, "
                    f"but Total shows {total} (difference: ${difference:.2f})"
                )
            
            # Tax rate validation
            if subtotal > 0:
                tax_rate = (tax / subtotal) * 100
                if tax_rate > 25:
                    warnings.append(f"Unusually high tax rate: {tax_rate:.1f}%")
                elif tax_rate < 0:
                    warnings.append("Negative tax amount")
            
        except (TypeError, ZeroDivisionError):
            warnings.append("Could not validate financial totals due to missing data")
        
        return warnings

    def parse_date_intelligently(self, date_str: str, date_format: str = "MM/DD/YYYY", language: str = "en") -> Optional[str]:
        """Parse dates with locale awareness and OCR error handling"""
        if not date_str:
            return None
        
        logger.info(f"Parsing date '{date_str}' with format {date_format}")
        
        try:
            # Extract all numbers from the date string
            numbers = re.findall(r'\d+', str(date_str))
            if len(numbers) < 2:
                logger.warning(f"Insufficient date components in: {date_str}")
                return None
            
            # Handle different number of components
            if len(numbers) == 2:
                # Assume month/day with current year
                numbers.append(str(datetime.now().year))
            
            nums = [int(x) for x in numbers[:3]]
            
            # Identify year (4 digits, >31, or assume last/first position)
            year = None
            remaining = []
            
            for i, num in enumerate(nums):
                if len(str(num)) == 4 and 1900 <= num <= 2100:
                    year = num
                    remaining = [n for j, n in enumerate(nums) if j != i]
                    break
                elif num > 31:
                    year = 2000 + num if num < 100 else num
                    remaining = [n for j, n in enumerate(nums) if j != i]
                    break
            
            if year is None:
                # Assume last number is year if format suggests it, otherwise first
                if date_format.endswith("YYYY") or date_format.endswith("YY"):
                    year = nums[-1]
                    remaining = nums[:-1]
                else:
                    year = nums[0]
                    remaining = nums[1:]
                
                # Convert 2-digit years
                if year < 50:
                    year += 2000
                elif year < 100:
                    year += 1900
            
            if len(remaining) != 2:
                logger.warning(f"Invalid remaining date components: {remaining}")
                return None
                
            first, second = remaining
            day, month = None, None
            
            # Apply format-specific logic
            if date_format.startswith("DD/MM") or (language in ["fr", "de", "es", "it", "nl", "pt"]):
                # European format: DD/MM/YYYY
                if 1 <= first <= 31 and 1 <= second <= 12:
                    day, month = first, second
                elif 1 <= second <= 31 and 1 <= first <= 12:
                    # Ambiguous case - could be either format
                    if first > 12:  # First must be day
                        day, month = first, second
                    else:
                        # Default to specified format
                        day, month = first, second
            else:
                # US format: MM/DD/YYYY
                if 1 <= first <= 12 and 1 <= second <= 31:
                    month, day = first, second
                elif 1 <= second <= 12 and 1 <= first <= 31:
                    # Ambiguous case
                    if second > 12:  # Second must be day
                        month, day = first, second
                    else:
                        # Default to specified format
                        month, day = first, second
            
            # Final validation and disambiguation
            if day is None or month is None:
                # Use range-based disambiguation
                if first > 12 and second <= 12:
                    day, month = first, second
                elif second > 12 and first <= 12:
                    month, day = first, second
                else:
                    # Both could be either - use format preference
                    if date_format.startswith("DD/MM"):
                        day, month = first, second
                    else:
                        month, day = first, second
            
            # Validate final result
            if not (1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100):
                logger.warning(f"Invalid date components: day={day}, month={month}, year={year}")
                return None
            
            # Additional validation using datetime
            result = f"{year:04d}-{month:02d}-{day:02d}"
            datetime.strptime(result, "%Y-%m-%d")
            logger.info(f"Successfully parsed '{date_str}' as {result}")
            return result
            
        except ValueError as e:
            logger.warning(f"Date validation failed for {date_str}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error parsing date {date_str}: {e}")
            return None

    def validate_extracted_data(self, analysis: Dict, extracted_text: str, language: str, date_format: str) -> Dict:
        """Enhanced validation with locale awareness and business rules"""
        try:
            logger.info(f"Validating data with language={language}, format={date_format}")
            validation_warnings = []
            
            # Re-parse dates with proper locale context
            date_patterns = re.findall(r'\d{1,4}[/\-\.]\d{1,2}[/\-\.]\d{2,4}', extracted_text)
            
            if date_patterns:
                logger.info(f"Found date patterns: {date_patterns}")
                
                # Re-parse invoice date
                if analysis.get('document_details', {}).get('invoice_date'):
                    for pattern in date_patterns:
                        corrected_date = self.parse_date_intelligently(pattern, date_format, language)
                        if corrected_date:
                            original = analysis['document_details']['invoice_date']
                            analysis['document_details']['invoice_date'] = corrected_date
                            logger.info(f"Corrected invoice date: {original} -> {corrected_date}")
                            break
                
                # Re-parse due date  
                if len(date_patterns) > 1 and analysis.get('document_details', {}).get('due_date'):
                    corrected_date = self.parse_date_intelligently(date_patterns[1], date_format, language)
                    if corrected_date:
                        original = analysis['document_details']['due_date']
                        analysis['document_details']['due_date'] = corrected_date
                        logger.info(f"Corrected due date: {original} -> {corrected_date}")
            
            # Business validation using validator
            financial_data = analysis.get('financial_data', {})
            
            # Validate amounts
            for field in ['total_amount', 'subtotal', 'tax_amount']:
                if field in financial_data and financial_data[field] is not None:
                    try:
                        validated_amount, warnings = self.validate_amount(
                            financial_data[field], field
                        )
                        financial_data[field] = validated_amount
                        validation_warnings.extend(warnings)
                    except ValidationError as e:
                        validation_warnings.append(str(e))
                        financial_data[field] = None
            
            # Validate dates
            document_details = analysis.get('document_details', {})
            for field in ['invoice_date', 'due_date']:
                if field in document_details and document_details[field]:
                    try:
                        validated_date, warnings = self.validate_date(
                            document_details[field], field
                        )
                        validation_warnings.extend(warnings)
                    except ValidationError as e:
                        validation_warnings.append(str(e))
                        document_details[field] = None
            
            # Validate financial totals
            if all(financial_data.get(field) is not None for field in ['subtotal', 'tax_amount', 'total_amount']):
                financial_warnings = self.validate_financial_totals(
                    financial_data['subtotal'],
                    financial_data['tax_amount'],
                    financial_data['total_amount']
                )
                validation_warnings.extend(financial_warnings)
            
            # Validate line items
            line_items = analysis.get('line_items', [])
            if line_items:
                calculated_subtotal = 0
                for i, item in enumerate(line_items):
                    if item.get('amount'):
                        try:
                            validated_amount, warnings = self.validate_amount(
                                item['amount'], f"line_item_{i+1}_amount"
                            )
                            item['amount'] = validated_amount
                            calculated_subtotal += validated_amount
                            validation_warnings.extend(warnings)
                        except ValidationError as e:
                            validation_warnings.append(f"Line item {i+1}: {str(e)}")
                            item['amount'] = None
                
                # Check if line items add up to subtotal
                reported_subtotal = financial_data.get('subtotal')
                if reported_subtotal and abs(calculated_subtotal - reported_subtotal) > 0.02:
                    validation_warnings.append(
                        f"Line items total (${calculated_subtotal:.2f}) doesn't match "
                        f"reported subtotal (${reported_subtotal:.2f})"
                    )
            
            # Add all validation warnings to analysis
            if validation_warnings:
                analysis.setdefault('validation_warnings', []).extend(validation_warnings)
            
            # Add confidence scoring for each field
            analysis['field_confidence'] = {
                'vendor_name': 0.9 if analysis.get('vendor_info', {}).get('vendor_name') else 0.0,
                'total_amount': 0.9 if analysis.get('financial_data', {}).get('total_amount') else 0.0,
                'invoice_date': 0.8 if analysis.get('document_details', {}).get('invoice_date') else 0.0,
                'due_date': 0.7 if analysis.get('document_details', {}).get('due_date') else 0.0,
                'line_items': 0.8 if analysis.get('line_items') else 0.0,
                'tax_amount': 0.7 if analysis.get('financial_data', {}).get('tax_amount') else 0.0,
            }
            
        except Exception as e:
            logger.warning(f"Validation error: {e}")
            analysis.setdefault('validation_warnings', []).append(f"Validation failed: {str(e)}")
        
        return analysis