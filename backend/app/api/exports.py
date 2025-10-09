from fastapi import APIRouter, HTTPException, Query, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
import logging
from datetime import datetime
import requests
from fastapi import BackgroundTasks
from typing import List, Optional
from app.dependencies import get_db
from app.db.operations import db_ops
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/export/invoices")
async def export_invoices(
    format: str = Query("json", description="Export format: json, csv"),
    limit: int = Query(100, description="Number of invoices to export"),
    db: Session = Depends(get_db)
):
    """Export processed invoices in various formats"""
    
    try:
        invoices = db_ops.get_processed_invoices(limit=limit)
        
        if format.lower() == "csv":
            # Create CSV export
            output = io.StringIO()
            writer = csv.writer(output)
            
            # CSV Headers
            writer.writerow([
                'ID', 'Filename', 'Processing Date', 'Vendor', 'Invoice Number', 
                'Total Amount', 'Currency', 'Invoice Date', 'Due Date',
                'OCR Confidence', 'AI Confidence', 'User Corrections',
                'Spending Category', 'Payment Urgency', 'Validated'
            ])
            
            # CSV Data
            for invoice in invoices:
                analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
                vendor_info = analysis.get('vendor_info', {})
                financial_data = analysis.get('financial_data', {})
                document_details = analysis.get('document_details', {})
                
                writer.writerow([
                    invoice.id,
                    invoice.filename,
                    invoice.processing_timestamp.isoformat() if invoice.processing_timestamp else '',
                    vendor_info.get('vendor_name', ''),
                    document_details.get('invoice_number', ''),
                    financial_data.get('total_amount', ''),
                    financial_data.get('currency', ''),
                    document_details.get('invoice_date', ''),
                    document_details.get('due_date', ''),
                    invoice.ocr_confidence or '',
                    invoice.ai_confidence or '',
                    invoice.user_corrections_count,
                    invoice.spending_category or '',
                    invoice.payment_urgency or '',
                    invoice.is_validated
                ])
            
            output.seek(0)
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=invoices.csv"}
            )
        
        else:
            # JSON export (default)
            return {
                "success": True,
                "format": "json",
                "count": len(invoices),
                "invoices": [invoice.to_dict() for invoice in invoices],
                "exported_at": datetime.now().isoformat()
            }
        
    except Exception as e:
        logger.error(f"Error exporting invoices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export invoices: {str(e)}")

@router.post("/export/quickbooks")
async def export_to_quickbooks(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Export invoices to QuickBooks via direct webhook"""
    
    try:
        # Get the request body with invoice data from frontend
        request_body = await request.json()
        webhook_url = request_body.get('webhook_url')
        
        # Fallback to environment variable if no webhook provided
        if not webhook_url:
            webhook_url = settings.quickbooks_webhook_url or settings.default_webhook_url
            
        if not webhook_url:
            raise HTTPException(status_code=400, detail="No webhook URL configured")
        
        logger.info(f"🔍 Using webhook URL: {webhook_url}")
        
        invoices_data = request_body.get('invoices', [])
        summary_data = request_body.get('summary', {})
        
        logger.info(f"Received QuickBooks export request with {len(invoices_data)} invoices")
        
        if not invoices_data:
            # Fallback to database invoices if no frontend data
            invoices = db_ops.get_processed_invoices(limit=1000)
            
            if not invoices:
                raise HTTPException(status_code=400, detail="No invoices found to export")
            
            quickbooks_data = []
            for invoice in invoices:
                analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
                
                quickbooks_data.append({
                    "vendor_name": analysis.get('vendor_info', {}).get('vendor_name', ''),
                    "invoice_number": analysis.get('document_details', {}).get('invoice_number', ''),
                    "invoice_date": analysis.get('document_details', {}).get('invoice_date', ''),
                    "due_date": analysis.get('document_details', {}).get('due_date', ''),
                    "total_amount": analysis.get('financial_data', {}).get('total_amount', 0),
                    "subtotal": analysis.get('financial_data', {}).get('subtotal', 0),
                    "tax_amount": analysis.get('financial_data', {}).get('tax_amount', 0),
                    "currency": analysis.get('financial_data', {}).get('currency', 'USD'),
                    "category": analysis.get('business_insights', {}).get('spending_category', 'other'),
                    "line_items": analysis.get('line_items', []),
                    "original_filename": invoice.filename,
                    "processing_timestamp": invoice.processing_timestamp.isoformat() if invoice.processing_timestamp else None
                })
        else:
            # Use invoices from frontend
            quickbooks_data = []
            for invoice in invoices_data:
                quickbooks_data.append({
                    "vendor_name": invoice.get('vendor_name', ''),
                    "invoice_number": invoice.get('invoice_number', ''),
                    "invoice_date": invoice.get('invoice_date', ''),
                    "due_date": invoice.get('due_date', ''),
                    "total_amount": invoice.get('total_amount', 0),
                    "subtotal": invoice.get('subtotal', 0),
                    "tax_amount": invoice.get('tax_amount', 0),
                    "currency": invoice.get('currency', 'USD'),
                    "category": invoice.get('spending_category', 'other'),
                    "line_items": invoice.get('line_items', []),
                    "original_filename": invoice.get('filename', ''),
                    "processing_timestamp": datetime.now().isoformat()
                })

        if not quickbooks_data:
            raise HTTPException(status_code=400, detail="No invoice data to export")
        
        webhook_payload = {
            "action": "quickbooks_import",
            "source": "invoice_ai_system",
            "timestamp": datetime.now().isoformat(),
            "invoice_count": len(quickbooks_data),
            "total_amount": summary_data.get('total_amount', 0),
            "invoices": quickbooks_data
        }
        
        logger.info(f"🚀 Sending to webhook: {webhook_url}")
        background_tasks.add_task(send_to_webhook, webhook_url, webhook_payload, "QuickBooks")
        
        return {
            "success": True,
            "message": f"Sending {len(quickbooks_data)} invoices to QuickBooks",
            "invoice_count": len(quickbooks_data),
            "webhook_url": webhook_url  # Return the actual webhook URL used
        }
        
    except Exception as e:
        logger.error(f"QuickBooks export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/export/xero")
async def export_to_xero(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Export invoices to Xero via direct webhook"""
    
    try:
        # Get the request body with invoice data from frontend
        request_body = await request.json()
        invoices_data = request_body.get('invoices', [])
        summary_data = request_body.get('summary', {})
        webhook_url = request_body.get('webhook_url')
        
        logger.info(f"Received Xero export request with {len(invoices_data)} invoices")
        
        if not webhook_url:
            raise HTTPException(status_code=400, detail="Webhook URL is required")
        
        if not invoices_data:
            # Fallback to database invoices if no frontend data
            invoices = db_ops.get_processed_invoices(limit=1000)
            
            if not invoices:
                raise HTTPException(status_code=400, detail="No invoices found to export")
            
            xero_data = []
            for invoice in invoices:
                analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
                
                xero_data.append({
                    "Contact": {
                        "Name": analysis.get('vendor_info', {}).get('vendor_name', 'Unknown Vendor')
                    },
                    "Type": "ACCPAY",  # Accounts Payable (bill)
                    "InvoiceNumber": analysis.get('document_details', {}).get('invoice_number', ''),
                    "Date": analysis.get('document_details', {}).get('invoice_date', ''),
                    "DueDate": analysis.get('document_details', {}).get('due_date', ''),
                    "Status": "AUTHORISED",
                    "LineAmountTypes": "Inclusive",
                    "SubTotal": analysis.get('financial_data', {}).get('subtotal', 0),
                    "TotalTax": analysis.get('financial_data', {}).get('tax_amount', 0),
                    "Total": analysis.get('financial_data', {}).get('total_amount', 0),
                    "CurrencyCode": analysis.get('financial_data', {}).get('currency', 'USD'),
                    "Reference": f"AI-{invoice.id}",
                    "Metadata": {
                        "original_filename": invoice.filename,
                        "ai_confidence": invoice.ai_confidence,
                        "processing_timestamp": invoice.processing_timestamp.isoformat() if invoice.processing_timestamp else None
                    }
                })
        else:
            # Use invoices from frontend
            xero_data = []
            for invoice in invoices_data:
                xero_data.append({
                    "Contact": {
                        "Name": invoice.get('vendor_name', 'Unknown Vendor')
                    },
                    "Type": "ACCPAY",  # Accounts Payable (bill)
                    "InvoiceNumber": invoice.get('invoice_number', ''),
                    "Date": invoice.get('invoice_date', ''),
                    "DueDate": invoice.get('due_date', ''),
                    "Status": "AUTHORISED",
                    "LineAmountTypes": "Inclusive",
                    "SubTotal": invoice.get('subtotal', 0),
                    "TotalTax": invoice.get('tax_amount', 0),
                    "Total": invoice.get('total_amount', 0),
                    "CurrencyCode": invoice.get('currency', 'USD'),
                    "Reference": f"AI-Frontend",
                    "Metadata": {
                        "original_filename": invoice.get('filename', ''),
                        "processing_timestamp": datetime.now().isoformat()
                    }
                })
        
        webhook_payload = {
            "action": "xero_import",
            "source": "invoice_ai_system", 
            "timestamp": datetime.now().isoformat(),
            "invoice_count": len(xero_data),
            "total_amount": summary_data.get('total_amount', 0),
            "invoices": xero_data
        }
        
        background_tasks.add_task(send_to_webhook, webhook_url, webhook_payload, "Xero")
        
        return {
            "success": True,
            "message": f"Sending {len(xero_data)} invoices to Xero",
            "invoice_count": len(xero_data),
            "webhook_url": webhook_url
        }
        
    except Exception as e:
        logger.error(f"Xero export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/reports/session-summary")
async def generate_session_report(
    request: Request,
    format: str = Query("json", description="Report format: json, csv")
):
    """Generate report from session data (frontend invoices)"""
    
    try:
        # Get the request body
        request_body = await request.json()
        invoices = request_body.get('invoices', [])
        summary = request_body.get('summary', {})
        
        if not invoices:
            raise HTTPException(status_code=400, detail="No invoice data provided")
        
        logger.info(f"Generating session report for {len(invoices)} invoices")
        
        # Calculate statistics from provided data
        total_amount = sum(float(invoice.get('total_amount', 0)) for invoice in invoices)
        vendor_totals = {}
        category_totals = {}
        
        for invoice in invoices:
            vendor = invoice.get('vendor_name', 'Unknown')
            category = invoice.get('spending_category', 'other')
            amount = float(invoice.get('total_amount', 0))
            
            vendor_totals[vendor] = vendor_totals.get(vendor, 0) + amount
            category_totals[category] = category_totals.get(category, 0) + 1
        
        # Sort by amount
        top_vendors = sorted(vendor_totals.items(), key=lambda x: x[1], reverse=True)[:10]
        category_breakdown = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        
        current_date = datetime.now()
        
        report_data_result = {
            "report_info": {
                "generated_at": current_date.isoformat(),
                "invoice_count": len(invoices),
                "type": "session_report"
            },
            "summary": {
                "total_amount": total_amount,
                "average_invoice": total_amount / len(invoices) if invoices else 0,
                "invoice_count": len(invoices)
            },
            "top_vendors": [
                {"vendor": vendor, "amount": amount}
                for vendor, amount in top_vendors
            ],
            "category_breakdown": [
                {"category": category, "count": count}
                for category, count in category_breakdown
            ]
        }
        
        logger.info(f"Report generated: {len(invoices)} invoices, ${total_amount:.2f} total")
        
        if format.lower() == "csv":
            # Return CSV format
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary
            writer.writerow(["Session Report Summary"])
            writer.writerow(["Generated At", current_date.strftime("%Y-%m-%d %H:%M:%S")])
            writer.writerow(["Total Amount", f"${total_amount:.2f}"])
            writer.writerow(["Invoice Count", len(invoices)])
            writer.writerow(["Average Invoice", f"${total_amount / len(invoices) if invoices else 0:.2f}"])
            writer.writerow([])
            
            # Write top vendors
            writer.writerow(["Top Vendors"])
            writer.writerow(["Vendor", "Amount"])
            for vendor_data in report_data_result["top_vendors"]:
                writer.writerow([vendor_data["vendor"], f"${vendor_data['amount']:.2f}"])
            writer.writerow([])
            
            # Write categories
            writer.writerow(["Categories"])
            writer.writerow(["Category", "Count"])
            for category_data in report_data_result["category_breakdown"]:
                writer.writerow([category_data["category"], category_data["count"]])
            writer.writerow([])
            
            # Write detailed invoice list
            writer.writerow(["Invoice Details"])
            writer.writerow(["Filename", "Vendor", "Amount", "Date", "Category", "Invoice Number"])
            for invoice in invoices:
                writer.writerow([
                    invoice.get('filename', ''),
                    invoice.get('vendor_name', ''),
                    f"${float(invoice.get('total_amount', 0)):.2f}",
                    invoice.get('invoice_date', ''),
                    invoice.get('spending_category', ''),
                    invoice.get('invoice_number', '')
                ])
            
            output.seek(0)
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=session_report_{current_date.strftime('%Y%m%d_%H%M%S')}.csv"}
            )
        
        return report_data_result
        
    except Exception as e:
        logger.error(f"Session report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Session report generation failed: {str(e)}")

@router.post("/export/custom-webhook")
async def export_to_custom_webhook(
    background_tasks: BackgroundTasks,
    webhook_url: str = Query(..., description="Custom webhook URL"),
    format: str = Query("standard", description="Data format: standard, quickbooks, xero"),
    db: Session = Depends(get_db)
):
    """Export invoices to any custom webhook endpoint"""
    
    try:
        invoices = db_ops.get_processed_invoices(limit=1000)
        
        if not invoices:
            raise HTTPException(status_code=400, detail="No invoices found to export")
        
        # Format data based on requested format
        if format == "quickbooks":
            # Use QuickBooks format
            formatted_data = []
            for invoice in invoices:
                analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
                formatted_data.append({
                    "vendor_name": analysis.get('vendor_info', {}).get('vendor_name', ''),
                    "invoice_number": analysis.get('document_details', {}).get('invoice_number', ''),
                    "total_amount": analysis.get('financial_data', {}).get('total_amount', 0),
                    "invoice_date": analysis.get('document_details', {}).get('invoice_date', ''),
                    "category": analysis.get('business_insights', {}).get('spending_category', 'other')
                })
        elif format == "xero":
            # Use Xero format
            formatted_data = []
            for invoice in invoices:
                analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
                formatted_data.append({
                    "Contact": {"Name": analysis.get('vendor_info', {}).get('vendor_name', 'Unknown')},
                    "Type": "ACCPAY",
                    "Total": analysis.get('financial_data', {}).get('total_amount', 0),
                    "InvoiceNumber": analysis.get('document_details', {}).get('invoice_number', '')
                })
        else:
            # Standard format
            formatted_data = [invoice.to_dict() for invoice in invoices]
        
        webhook_payload = {
            "action": "invoice_export",
            "format": format,
            "source": "invoice_ai_system",
            "timestamp": datetime.now().isoformat(),
            "invoice_count": len(formatted_data),
            "invoices": formatted_data
        }
        
        background_tasks.add_task(send_to_webhook, webhook_url, webhook_payload, "Custom Webhook")
        
        return {
            "success": True,
            "message": f"Sending {len(formatted_data)} invoices to custom webhook",
            "invoice_count": len(formatted_data),
            "webhook_url": webhook_url,
            "format": format
        }
        
    except Exception as e:
        logger.error(f"Custom webhook export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/reports/monthly-summary")
async def generate_monthly_report(
    year: int = Query(datetime.now().year),
    month: int = Query(datetime.now().month),
    format: str = Query("json", description="Report format: json, csv"),
    db: Session = Depends(get_db)
):
    """Generate monthly spending summary report"""
    
    try:
        # Get all invoices and filter by month
        invoices = db_ops.get_processed_invoices(limit=10000)
        
        # Filter invoices by the specified month/year
        monthly_invoices = []
        for invoice in invoices:
            analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
            invoice_date_str = analysis.get('document_details', {}).get('invoice_date')
            
            if invoice_date_str:
                try:
                    invoice_date = datetime.fromisoformat(invoice_date_str)
                    if invoice_date.year == year and invoice_date.month == month:
                        monthly_invoices.append(invoice)
                except:
                    continue
        
        # Calculate summary statistics
        total_amount = 0
        vendor_totals = {}
        category_totals = {}
        
        for invoice in monthly_invoices:
            analysis = invoice.corrected_data.get('analysis', {}) if invoice.corrected_data else {}
            
            amount = analysis.get('financial_data', {}).get('total_amount', 0)
            vendor = analysis.get('vendor_info', {}).get('vendor_name', 'Unknown')
            category = analysis.get('business_insights', {}).get('spending_category', 'other')
            
            total_amount += amount
            vendor_totals[vendor] = vendor_totals.get(vendor, 0) + amount
            category_totals[category] = category_totals.get(category, 0) + amount
        
        # Sort by amount
        top_vendors = sorted(vendor_totals.items(), key=lambda x: x[1], reverse=True)[:10]
        category_breakdown = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        
        report_data = {
            "report_info": {
                "month": f"{year}-{month:02d}",
                "generated_at": datetime.now().isoformat(),
                "invoice_count": len(monthly_invoices)
            },
            "summary": {
                "total_amount": total_amount,
                "average_invoice": total_amount / len(monthly_invoices) if monthly_invoices else 0,
                "invoice_count": len(monthly_invoices)
            },
            "top_vendors": [
                {"vendor": vendor, "amount": amount}
                for vendor, amount in top_vendors
            ],
            "category_breakdown": [
                {"category": category, "amount": amount}
                for category, amount in category_breakdown
            ]
        }
        
        if format.lower() == "csv":
            # Return CSV format
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary
            writer.writerow(["Monthly Report Summary"])
            writer.writerow(["Month", f"{year}-{month:02d}"])
            writer.writerow(["Total Amount", f"${total_amount:.2f}"])
            writer.writerow(["Invoice Count", len(monthly_invoices)])
            writer.writerow([])
            
            # Write top vendors
            writer.writerow(["Top Vendors"])
            writer.writerow(["Vendor", "Amount"])
            for vendor_data in report_data["top_vendors"]:
                writer.writerow([vendor_data["vendor"], f"${vendor_data['amount']:.2f}"])
            
            output.seek(0)
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=monthly_report_{year}_{month:02d}.csv"}
            )
        
        return report_data
        
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# Updated webhook function for direct integration
async def send_to_webhook(webhook_url: str, payload: dict, service_name: str = "Unknown"):
    """Send data to any webhook endpoint"""
    try:
        # 🔥 Make sure we're using the webhook_url parameter, not a hardcoded one!
        logger.info(f"🔍 Webhook URL received: {webhook_url}")
        logger.info(f"🔍 Service name: {service_name}")
        logger.info(f"Sending {payload.get('invoice_count', 0)} invoices to {service_name}")
        
        # 🔥 CRITICAL: Use the webhook_url parameter here, not any hardcoded URL!
        response = requests.post(
            webhook_url,  # This should be the parameter, not hardcoded!
            json=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "InvoiceAI/1.0",
                "X-Source": "invoice-ai-system"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"Successfully sent data to {service_name} webhook: {webhook_url}")
        else:
            logger.error(f"Webhook failed for {service_name}: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Failed to send data to {service_name} webhook: {e}")
