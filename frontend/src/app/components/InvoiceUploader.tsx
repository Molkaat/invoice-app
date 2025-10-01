import React, { useState } from 'react'

// Add proper TypeScript interfaces
interface ProcessingStatus {
  percentage: number
  progress: number
  total_steps: number
  current_step: string
}

interface BatchProgress {
  current: number
  total: number
  file: string
}

interface BatchResult {
  success: boolean
  error?: string
  filename: string
  data?: any
}

// Fix ProgressBar component with proper typing
const ProgressBar: React.FC<{ status: ProcessingStatus }> = ({ status }) => {
  if (!status) return null

  const getStepLabel = (step: string): string => {
    const labels: Record<string, string> = {
      file_validation: 'Validating File',
      text_extraction: 'Extracting Text',
      language_detection: 'Detecting Language',
      ai_analysis: 'AI Analysis',
      field_parsing: 'Parsing Fields',
      validation: 'Validating Data',
      confidence_scoring: 'Scoring Confidence',
      finalization: 'Finalizing'
    }
    return labels[step] || step
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-blue-800 font-medium">Processing Progress</span>
        <span className="text-blue-600">{status.percentage}%</span>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${status.percentage}%` }}
        ></div>
      </div>
      
      <div className="text-sm text-blue-700">
        Step {status.progress}/{status.total_steps}: {getStepLabel(status.current_step)}
      </div>
    </div>
  )
}

// Fix ConnectionStatus component with proper typing
const ConnectionStatus: React.FC<{ 
  connected: boolean
  connecting: boolean 
}> = ({ connected, connecting }) => {
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
      connected ? 'bg-green-100 text-green-800' : 
      connecting ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full mr-1 ${
        connected ? 'bg-green-500' : 
        connecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      {connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}
    </div>
  )
}

// Fix BulkUploadComponent with proper typing
const BulkUploadComponent: React.FC<{ 
  onBatchStart: () => void
  onBatchProgress: (current: number, total: number, filename: string) => void
  onBatchComplete: (results: BatchResult[]) => void
}> = ({ 
  onBatchStart,
  onBatchProgress, 
  onBatchComplete 
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number; file: string }>({ 
    current: 0, 
    total: 0, 
    file: '' 
  })

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate each file
    const validFiles: File[] = []
    const errors: string[] = []
    
    selectedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`)
        return
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/gif']
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']
      
      if (!allowedTypes.includes(file.type) && 
          !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'))
    }
    
    setFiles(validFiles)
  }

  const processBatch = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    onBatchStart()
    
    const results: BatchResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentProgress({ current: i + 1, total: files.length, file: file.name })
      onBatchProgress(i + 1, files.length, file.name)
      
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`)
        
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('http://localhost:8000/extract-invoice/', {
          method: 'POST',
          body: formData,
        })
        
        console.log(`Response status for ${file.name}:`, response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log(`Success result for ${file.name}:`, result)
          
          if (!result.success) {
            console.warn(`Result marked as unsuccessful for ${file.name}:`, result)
            results.push({
              success: false,
              error: result.error || 'Processing marked as unsuccessful',
              filename: file.name
            })
          } else {
            results.push({
              success: true,
              filename: file.name,
              data: result
            })
          }
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          console.error(`Error response for ${file.name}:`, errorData)
          
          results.push({
            success: false,
            error: errorData.detail || `HTTP ${response.status}`,
            filename: file.name
          })
        }
      } catch (error) {
        console.error(`Exception processing ${file.name}:`, error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          filename: file.name
        })
      }
      
      // Add small delay between requests to avoid overwhelming the server
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('Final batch results:', results)
    setIsProcessing(false)
    onBatchComplete(results)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Batch Processing</h3>
      
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.gif"
          onChange={handleFilesSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-500 mt-1">
          Select multiple invoice files for batch processing
        </p>
      </div>

      {files.length > 0 && (
        <>
          <div className="mb-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove file"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Processing: {currentProgress.file}</span>
                <span>{currentProgress.current}/{currentProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={processBatch}
              disabled={isProcessing || files.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {isProcessing ? 'Processing...' : `Process ${files.length} Files`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Fix main component with proper typing
interface InvoiceUploaderProps {
  wsConnected: boolean
  wsConnecting: boolean
  useWebSocket: boolean
  setUseWebSocket: (value: boolean) => void
  batchProgress: BatchProgress | null
  onBatchStart: () => void
  onBatchProgress: (current: number, total: number, filename: string) => void
  onBatchComplete: (results: BatchResult[]) => void
  error: string | null
}

const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({
  wsConnected,
  wsConnecting,
  useWebSocket,
  setUseWebSocket,
  batchProgress,
  onBatchStart,
  onBatchProgress,
  onBatchComplete,
  error
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate each file
    const validFiles: File[] = []
    const errors: string[] = []
    
    selectedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`)
        return
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/gif']
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']
      
      if (!allowedTypes.includes(file.type) && 
          !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'))
    }
    
    setFiles(validFiles)
  }

  const processBatch = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    onBatchStart()
    
    const results: any[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      onBatchProgress(i + 1, files.length, file.name)
      
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`)
        
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('http://localhost:8000/extract-invoice/', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log(`Response for ${file.name}:`, result) // Debug log
          
          if (!result.success) {
            results.push({
              success: false,
              error: result.error || 'Processing marked as unsuccessful',
              filename: file.name
            })
          } else {
            results.push({
              success: true,
              filename: file.name,
              data: result,
              analysis: result.analysis,
              processing_info: result.processing_info,
              extracted_text: result.extracted_text,
              warnings: result.warnings
            })
          }
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          results.push({
            success: false,
            error: errorData.detail || `HTTP ${response.status}`,
            filename: file.name
          })
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
          filename: file.name
        })
      }
    }
    
    console.log('Final batch results:', results) // Debug log
    setIsProcessing(false)
    onBatchComplete(results)
    setFiles([]) // Clear files after processing
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Invoice AI Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Upload one or multiple invoices for AI extraction and analysis
          </p>
          
          {/* WebSocket Connection Status and Controls */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : wsConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                WebSocket: {wsConnected ? 'Connected' : wsConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useWebSocket}
                onChange={(e) => setUseWebSocket(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Real-time progress</span>
            </label>
          </div>
        </div>

        {/* Progress Display */}
        {batchProgress && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-800 font-medium">Processing: {batchProgress.file}</span>
              <span className="text-green-600">{batchProgress.current}/{batchProgress.total}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* File Upload Interface */}
        <div className="mb-4">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.gif"
            onChange={handleFilesSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Select one or multiple invoice files (PDF, JPG, PNG, BMP, TIFF, GIF • Max 10MB each)
          </p>
        </div>

        {/* Selected Files Display */}
        {files.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove file"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={processBatch}
            disabled={isProcessing || files.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            type="button"
          >
            {isProcessing ? 'Processing...' : `Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
          
          {files.length > 0 && !isProcessing && (
            <button
              onClick={() => setFiles([])}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              type="button"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceUploader