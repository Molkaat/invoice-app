'use client'

import React, { useState, useEffect, useRef } from 'react'
import InvoiceUploader from './components/InvoiceUploader'
import InvoiceAnalyzer from './components/InvoiceAnalyzer'
import InvoiceDashboard from './components/InvoiceDashboard'

// Updated interfaces to match component expectations
interface ProcessingResult {
  success: boolean
  processing_info: {
    filename: string
    file_type?: string
    text_source: string
    ocr_confidence: number
    text_length: number
    detected_language: string
    date_format: string
    processing_confidence?: number
    status?: {
      current_step: string
      progress: number
      total_steps: number
      percentage: number
    }
  }
  extracted_text: string
  analysis: {
    document_analysis: {
      document_type?: string
      detected_language?: string
      text_quality: string
      overall_confidence: number
    }
    financial_data: {
      total_amount: number
      currency: string
      tax_amount: number
      subtotal: number
    }
    vendor_info: {
      vendor_name: string
      contact_info?: string
    }
    document_details: {
      invoice_number: string
      invoice_date: string
      due_date: string
    }
    line_items: Array<{
      description: string
      amount: number
      quantity: number | string
    }>
    business_insights: {
      spending_category: string
      payment_urgency: 'immediate' | 'standard' | 'low'
      data_completeness: 'complete' | 'partial' | 'incomplete'
    }
    field_confidence?: {
      [key: string]: number
    }
    validation_warnings?: string[]
  }
  warnings?: string[]
  timestamp?: string
  filename?: string
  error?: string
}

interface ProgressStatus {
  current_step: string
  progress: number
  total_steps: number
  percentage: number
}

interface BatchResult {
  success: boolean
  error?: string
  filename: string
  data?: any
  analysis?: ProcessingResult['analysis']
  processing_info?: ProcessingResult['processing_info']
  extracted_text?: string
  warnings?: string[]
}

export default function InvoiceDemo() {
  // ===== STATE MANAGEMENT =====
  
  // Single file processing state
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<ProgressStatus | null>(null)
  
  // Batch processing state
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; file: string } | null>(null)
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState<boolean>(false)
  const [wsConnecting, setWsConnecting] = useState<boolean>(false)
  const [clientId] = useState<string>(() => Math.random().toString(36).substring(2, 15))
  const wsRef = useRef<WebSocket | null>(null)
  const [useWebSocket, setUseWebSocket] = useState<boolean>(true)

  // ===== WEBSOCKET MANAGEMENT =====
  
  useEffect(() => {
    if (useWebSocket) {
      connectWebSocket()
    }
    return () => {
      disconnectWebSocket()
    }
  }, [useWebSocket])

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    setWsConnecting(true)
    console.log(`Attempting to connect to WebSocket: ws://localhost:8000/ws/${clientId}`)
    
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully')
        setWsConnected(true)
        setWsConnecting(false)
        wsRef.current = ws
      }
      
      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data)
          console.log('WebSocket message received:', message)
          
          switch (message.type) {
            case 'progress_update':
              setProcessingStatus(message.data as ProgressStatus)
              break
            case 'processing_complete':
              setResult(message.data as ProcessingResult)
              setLoading(false)
              setProcessingStatus(null)
              break
            case 'processing_error':
              setError(message.data.error)
              setLoading(false)
              setProcessingStatus(null)
              break
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = (event: CloseEvent) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setWsConnected(false)
        setWsConnecting(false)
        wsRef.current = null
        
        if (event.code !== 1000 && useWebSocket) {
          setTimeout(() => {
            console.log('Attempting to reconnect...')
            connectWebSocket()
          }, 3000)
        }
      }
      
      ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error)
        setWsConnected(false)
        setWsConnecting(false)
      }
      
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout')
          ws.close()
          setWsConnecting(false)
        }
      }, 5000)
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setWsConnecting(false)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setWsConnected(false)
    setWsConnecting(false)
  }

  // ===== UPLOAD HANDLERS =====
  
  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setProcessingStatus(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      if (useWebSocket && wsConnected) {
        // Use WebSocket endpoint for real-time progress
        const response = await fetch(`http://localhost:8000/extract-invoice-websocket/?client_id=${clientId}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
          throw new Error(errorData.detail || 'Upload failed')
        }
        
      } else {
        // Fall back to synchronous processing
        const response = await fetch('http://localhost:8000/extract-invoice/', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
          throw new Error(errorData.detail || 'Upload failed')
        }

        const data = await response.json()
        setResult(data as ProcessingResult)
        setLoading(false)
      }
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setLoading(false)
    }
  }

  // ===== BATCH PROCESSING HANDLERS =====
  
  const handleBatchStart = () => {
    setBatchResults([])
    setBatchProgress(null)
    setError(null)
  }

  const handleBatchProgress = (current: number, total: number, currentFile: string) => {
    setBatchProgress({ current, total, file: currentFile })
  }

  const handleBatchComplete = (results: any[]) => {
    console.log('Raw batch results received:', results) // Debug log
    
    // Convert the results to match BatchResult interface
    const convertedResults: BatchResult[] = results.map((result, index) => {
      console.log(`Processing result ${index}:`, result) // Debug log
      
      if (result.success && result.data) {
        // If it's a successful result with data, extract the analysis
        return {
          success: true,
          filename: result.filename || result.data.processing_info?.filename || `file_${index}`,
          analysis: result.data.analysis || result.analysis,
          processing_info: result.data.processing_info || result.processing_info,
          extracted_text: result.data.extracted_text || result.extracted_text,
          warnings: result.data.warnings || result.warnings
        }
      } else {
        // If it's a failed result
        return {
          success: false,
          filename: result.filename || `file_${index}`,
          error: result.error || 'Processing failed'
        }
      }
    })
    
    console.log('Converted batch results:', convertedResults) // Debug log
    setBatchResults(convertedResults)
    setBatchProgress(null)
  }

  // ===== FIELD UPDATE HANDLERS =====
  
  const handleFieldUpdate = (fieldPath: string, value: any) => {
    if (!result) return

    const updatedResult: ProcessingResult = JSON.parse(JSON.stringify(result))
    
    const pathParts = fieldPath.split('.')
    let current: any = updatedResult.analysis
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {}
      }
      current = current[pathParts[i]]
    }
    
    current[pathParts[pathParts.length - 1]] = value
    
    if (!updatedResult.warnings) {
      updatedResult.warnings = []
    }
    
    const editWarning = `Field '${fieldPath}' was manually edited`
    if (!updatedResult.warnings.includes(editWarning)) {
      updatedResult.warnings.push(editWarning)
    }
    
    setResult(updatedResult)
  }

  // ===== DOWNLOAD HANDLERS =====
  
  const downloadResults = () => {
    if (!result) return
    
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `invoice_data_${result.processing_info.filename}.json`
    link.click()
    
    // Clean up the URL object
    URL.revokeObjectURL(link.href)
  }

  // ===== RENDER =====
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      
      {/* === UPLOAD SECTION === */}
      <InvoiceUploader
        wsConnected={wsConnected}
        wsConnecting={wsConnecting}
        useWebSocket={useWebSocket}
        setUseWebSocket={setUseWebSocket}
        batchProgress={batchProgress}
        onBatchStart={handleBatchStart}
        onBatchProgress={handleBatchProgress}
        onBatchComplete={handleBatchComplete}
        error={error}
      />

      {/* === DASHBOARD SECTION === */}
      <div className="max-w-6xl mx-auto px-4">
        <InvoiceDashboard 
          batchResults={batchResults}
        />
      </div>

      {/* === RESULTS SECTION === */}
      <div className="max-w-6xl mx-auto px-4">
        <InvoiceAnalyzer
          // Single invoice result
          result={result}
          onFieldUpdate={handleFieldUpdate}
          onDownloadResults={downloadResults}
          
          // Batch results
          batchResults={batchResults}
        />
      </div>
    </div>
  )
}