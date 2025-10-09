"use client"
import type React from "react"
import { useState } from "react"
import { Edit2, Save, X, AlertTriangle, FileText, Building2, Calendar, DollarSign, Package } from "lucide-react"

interface ConfidenceBarProps {
  confidence: number
  label: string
}

interface EditableFieldProps {
  label?: string
  value: string | number | undefined
  onSave: (value: string | number) => void
  type?: "text" | "number" | "date"
  prefix?: string
}

interface WarningAlertProps {
  warnings: string[]
}

interface LineItem {
  description: string
  quantity: number | string
  amount: number
}

interface VendorInfo {
  vendor_name: string
  contact_info?: string
}

interface DocumentDetails {
  invoice_number: string
  invoice_date: string
  due_date: string
}

interface FinancialData {
  total_amount: number
  subtotal: number
  tax_amount: number
  currency: string
}

interface FieldConfidence {
  total_amount?: number
}

interface BusinessInsights {
  data_completeness: "complete" | "partial" | "incomplete"
  spending_category: string
  payment_urgency: "immediate" | "standard" | "low"
}

interface DocumentAnalysis {
  overall_confidence: number
  text_quality: string
}

interface Analysis {
  financial_data: FinancialData
  vendor_info: VendorInfo
  document_details: DocumentDetails
  line_items: LineItem[]
  field_confidence?: FieldConfidence
  business_insights: BusinessInsights
  document_analysis: DocumentAnalysis
}

interface ProcessingInfo {
  filename: string
  text_source: string
  detected_language: string
  date_format: string
  text_length: number
  ocr_confidence: number
  processing_confidence?: number
}

interface InvoiceResult {
  analysis: Analysis
  processing_info: ProcessingInfo
  extracted_text: string
  warnings?: string[]
  success: boolean
  error?: string
  filename?: string
}

interface BatchResult {
  success: boolean
  error?: string
  filename: string
  data?: any
  analysis?: Analysis
  processing_info?: ProcessingInfo
  extracted_text?: string
  warnings?: string[]
}

interface InvoiceCardProps {
  result: InvoiceResult
  onFieldUpdate: (field: string, value: any) => void
}

interface InvoiceAnalyzerProps {
  result?: any
  onFieldUpdate?: (fieldPath: string, value: any) => void
  onDownloadResults?: () => void
  batchResults?: any[]
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, label }) => {
  const getColor = (conf: number): string => {
    if (conf >= 0.8) return "bg-green-500"
    if (conf >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{(confidence * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(confidence)} transition-all duration-300`}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
    </div>
  )
}

const EditableFieldComponent: React.FC<EditableFieldProps> = ({ label, value, onSave, type = "text", prefix = "" }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ""))
  const [error, setError] = useState("")

  const handleSave = () => {
    setError("")
    try {
      let processedValue: string | number = editValue

      if (type === "number") {
        processedValue = Number.parseFloat(editValue)
        if (isNaN(processedValue)) {
          throw new Error("Invalid number")
        }
      } else if (type === "date") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(editValue)) {
          throw new Error("Date must be in YYYY-MM-DD format")
        }
      }

      onSave(processedValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleCancel = () => {
    setEditValue(String(value || ""))
    setIsEditing(false)
    setError("")
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
        <div className="flex items-center gap-2">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <input
            type={type === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 bg-secondary border border-primary rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={type === "date" ? "YYYY-MM-DD" : ""}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            title="Save"
            type="button"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors"
            title="Cancel"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="group">
      {label ? (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{label}</label>
          <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
            <span className="text-sm text-foreground">
              {prefix}
              {value || "N/A"}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-primary hover:text-primary/80 transition-all"
              title="Edit field"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
          <span className="text-sm text-foreground">
            {prefix}
            {value || "N/A"}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-primary hover:text-primary/80 transition-all"
            title="Edit field"
            type="button"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

const WarningAlert: React.FC<WarningAlertProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-500 mb-2">Validation Warnings</h4>
          <ul className="space-y-1">
            {warnings.map((warning: string, index: number) => (
              <li key={index} className="text-sm text-yellow-500/80">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const InvoiceCard = ({
  result,
  onFieldUpdate,
}: { result: any; onFieldUpdate?: (fieldPath: string, value: any) => void }) => {
  const { analysis } = result
  const { financial_data, vendor_info, document_details, line_items, business_insights, document_analysis } = analysis

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      {/* Header with confidence */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{result.processing_info?.filename || "Invoice"}</h3>
          <p className="text-sm text-muted-foreground">{document_details?.invoice_number || "No invoice number"}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {(document_analysis?.overall_confidence * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">Confidence</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-4 border border-primary/30">
          <DollarSign className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground mb-1">
            ${financial_data?.total_amount?.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">Total Amount</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-lg font-semibold text-foreground mb-1">
            ${financial_data?.subtotal?.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">Subtotal</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-lg font-semibold text-foreground mb-1">
            ${financial_data?.tax_amount?.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">Tax</p>
        </div>
      </div>

      {/* Vendor & Document Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Vendor Information</h4>
          </div>
          <EditableFieldComponent
            label="Vendor Name"
            value={vendor_info?.vendor_name}
            onSave={(value) => onFieldUpdate?.("analysis.vendor_info.vendor_name", value)}
          />
          {vendor_info?.contact_info && (
            <EditableFieldComponent
              label="Contact"
              value={vendor_info.contact_info}
              onSave={(value) => onFieldUpdate?.("analysis.vendor_info.contact_info", value)}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Document Details</h4>
          </div>
          <EditableFieldComponent
            label="Invoice Date"
            value={document_details?.invoice_date}
            onSave={(value) => onFieldUpdate?.("analysis.document_details.invoice_date", value)}
            type="date"
          />
          <EditableFieldComponent
            label="Due Date"
            value={document_details?.due_date}
            onSave={(value) => onFieldUpdate?.("analysis.document_details.due_date", value)}
            type="date"
          />
        </div>
      </div>

      {/* Line Items */}
      {line_items && line_items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Line Items</h4>
          </div>
          <div className="bg-secondary rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Qty</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {line_items.map((item: LineItem, idx: number) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">
                      ${typeof item.amount === "number" ? item.amount.toFixed(2) : item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Insights */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Category</p>
          <p className="text-sm font-medium text-foreground">{business_insights?.spending_category || "N/A"}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Urgency</p>
          <p className="text-sm font-medium text-foreground capitalize">
            {business_insights?.payment_urgency || "N/A"}
          </p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Completeness</p>
          <p className="text-sm font-medium text-foreground capitalize">
            {business_insights?.data_completeness || "N/A"}
          </p>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings && <WarningAlert warnings={result.warnings} />}

      {/* Processing Info */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Source: </span>
            <span className="text-foreground">{result.processing_info?.text_source}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Language: </span>
            <span className="text-foreground">{result.processing_info?.detected_language}</span>
          </div>
          <div>
            <span className="text-muted-foreground">OCR Confidence: </span>
            <span className="text-foreground">{(result.processing_info?.ocr_confidence * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Text Length: </span>
            <span className="text-foreground">{result.processing_info?.text_length} chars</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceAnalyzer({
  result,
  onFieldUpdate,
  onDownloadResults,
  batchResults,
}: InvoiceAnalyzerProps) {
  if (!result && (!batchResults || batchResults.length === 0)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
          <p className="text-sm text-muted-foreground">Upload and process an invoice to see the analysis</p>
        </div>
      </div>
    )
  }

  const results =
    batchResults && batchResults.length > 0
      ? batchResults.filter((r) => r.success).map((r) => r.data || r)
      : result
        ? [result]
        : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Analysis Results</h2>
          <p className="text-muted-foreground">
            {results.length} invoice{results.length !== 1 ? "s" : ""} processed
          </p>
        </div>
        {onDownloadResults && results.length > 0 && (
          <button
            onClick={onDownloadResults}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Download Results
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {results.map((res: any, idx: number) => (
          <InvoiceCard key={idx} result={res} onFieldUpdate={onFieldUpdate} />
        ))}
      </div>
    </div>
  )
}
