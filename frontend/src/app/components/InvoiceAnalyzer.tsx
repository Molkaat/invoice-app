import React, { useState } from 'react'

// Add proper TypeScript interfaces
interface ConfidenceBarProps {
  confidence: number
  label: string
}

interface EditableFieldProps {
  label?: string
  value: string | number | undefined
  onSave: (value: string | number) => void
  type?: 'text' | 'number' | 'date'
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
  data_completeness: 'complete' | 'partial' | 'incomplete'
  spending_category: string
  payment_urgency: 'immediate' | 'standard' | 'low'
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

// Fix ConfidenceBar component with proper typing
const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, label }) => {
  const getColor = (conf: number): string => {
    if (conf >= 0.8) return 'bg-green-500'
    if (conf >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-black">{label}</span>
        <span className="text-black">{(confidence * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getColor(confidence)}`}
          style={{ width: `${confidence * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

// Fix EditableFieldComponent with proper typing
const EditableFieldComponent: React.FC<EditableFieldProps> = ({ 
  label, 
  value, 
  onSave, 
  type = 'text',
  prefix = ''
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editValue, setEditValue] = useState<string>(String(value || ''))
  const [error, setError] = useState<string>('')

  const handleSave = () => {
    setError('')
    
    try {
      let processedValue: string | number = editValue
      
      if (type === 'number') {
        processedValue = parseFloat(editValue)
        if (isNaN(processedValue)) {
          throw new Error('Invalid number')
        }
      } else if (type === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(editValue)) {
          throw new Error('Date must be in YYYY-MM-DD format')
        }
      }
      
      onSave(processedValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleCancel = () => {
    setEditValue(String(value || ''))
    setIsEditing(false)
    setError('')
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && <span className="text-sm text-gray-600">{label}:</span>}
        <div className="flex items-center space-x-2">
          {prefix && <span className="text-gray-500">{prefix}</span>}
          <input
            type={type === 'date' ? 'text' : type}
            value={editValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={type === 'date' ? 'YYYY-MM-DD' : ''}
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            type="button"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            type="button"
          >
            Cancel
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
    )
  }

  return (
    <div className="group">
      {label ? (
        <div className="flex items-start space-x-2">
          <span className="text-gray-600 text-sm min-w-0">{label}:</span>
          <div className="flex items-center space-x-2 flex-1">
            <span className="font-medium text-black break-words">
              {prefix}{value || 'N/A'}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:text-blue-700 transition-opacity flex-shrink-0"
              title="Edit field"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 group">
          <span className="font-medium text-black break-words flex-1">
            {prefix}{value || 'N/A'}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:text-blue-700 transition-opacity flex-shrink-0"
            title="Edit field"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// Fix WarningAlert component with proper typing
const WarningAlert: React.FC<WarningAlertProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Validation Warnings</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fix InvoiceCard component with proper typing
const InvoiceCard = ({ result, onFieldUpdate }: { result: any; onFieldUpdate?: (fieldPath: string, value: any) => void }) => {
  const { analysis } = result
  const { financial_data, vendor_info, document_details, line_items } = analysis

  // ...rest of InvoiceCard implementation stays the same...
  
  return (
    <div className="space-y-6">
      {/* Financial Data Section */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-3">💰 Financial Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${financial_data.total_amount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              ${financial_data.subtotal?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500">Subtotal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              ${financial_data.tax_amount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500">Tax</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {financial_data.currency || 'USD'}
            </div>
            <div className="text-sm text-gray-500">Currency</div>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-3">🏢 Vendor Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
            <div className="p-2 bg-white rounded border">
              {vendor_info.vendor_name || 'Not detected'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <div className="p-2 bg-white rounded border">
              {vendor_info.contact_info || 'Not available'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-3">📄 Document Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <div className="p-2 bg-white rounded border">
              {document_details.invoice_number || 'Not detected'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <div className="p-2 bg-white rounded border">
              {document_details.invoice_date || 'Not detected'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <div className="p-2 bg-white rounded border">
              {document_details.due_date || 'Not detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {line_items && line_items.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">📋 Line Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {line_items.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.description || 'No description'}</td>
                    <td className="py-2 text-right">{item.quantity || '-'}</td>
                    <td className="py-2 text-right">
                      ${typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Fix main component with proper typing
const InvoiceAnalyzer: React.FC<InvoiceAnalyzerProps> = ({ 
  result,
  onFieldUpdate,
  onDownloadResults,
  batchResults = []
}) => {
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())
  
  // Handle single invoice display
  if (result && result.analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Analysis Results</h3>
          <button
            onClick={onDownloadResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            type="button"
          >
            📊 Export Data
          </button>
        </div>
        
        {/* Display single result analysis */}
        <InvoiceCard result={result} onFieldUpdate={onFieldUpdate} />
      </div>
    )
  }

  // Handle batch results display
  if (batchResults.length > 0) {
    const successCount = batchResults.filter(r => r.success).length
    const errorCount = batchResults.length - successCount

    const toggleExpanded = (index: number) => {
      const newExpanded = new Set(expandedResults)
      if (newExpanded.has(index)) {
        newExpanded.delete(index)
      } else {
        newExpanded.add(index)
      }
      setExpandedResults(newExpanded)
    }

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Batch Processing Results</h3>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{batchResults.length}</div>
            <div className="text-sm text-blue-800">Total Files</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-800">Successful</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-800">Failed</div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {batchResults.map((result, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium">
                      {result.filename || `File ${index + 1}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.success ? 'Processing completed' : result.error}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {result.success && result.analysis?.financial_data?.total_amount && (
                    <span className="text-green-600 font-semibold">
                      ${result.analysis.financial_data.total_amount.toFixed(2)}
                    </span>
                  )}
                  {result.analysis?.document_details?.invoice_number && (
                    <span className="ml-3">
                      Invoice: {result.analysis.document_details.invoice_number}
                    </span>
                  )}
                  <span className="text-green-600 font-medium">
                    {result.analysis?.financial_data?.total_amount?.toFixed(2) || '0.00'}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${expandedResults.has(index) ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedResults.has(index) && result.success && result.analysis && (
                <div className="p-4 border-t">
                  <InvoiceCard result={result} onFieldUpdate={onFieldUpdate} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No results to display
  return null
}

export default InvoiceAnalyzer