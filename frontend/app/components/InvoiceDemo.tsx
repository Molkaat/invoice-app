"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import InvoiceUploader from "./InvoiceUploader"
import InvoiceAnalyzer from "./InvoiceAnalyzer"
import InvoiceDashboard from "./InvoiceDashboard"
import Integrations from "./Integrations"
import DownloadModal from "./DownloadModal"
import { useAuth } from "@/lib/auth-context"
import * as XLSX from 'xlsx'

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
      payment_urgency: "immediate" | "standard" | "low"
      data_completeness: "complete" | "partial" | "incomplete"
    }
  }
  warnings?: string[]
  timestamp?: string
  filename?: string
  error?: string
}

interface BatchResult {
  success: boolean
  error?: string
  filename: string
  data?: any
  analysis?: ProcessingResult["analysis"]
  processing_info?: ProcessingResult["processing_info"]
  extracted_text?: string
  warnings?: string[]
}

export default function InvoiceDemo() {
  const { useCredit, user } = useAuth()
  const [activeView, setActiveView] = useState<"upload" | "analyze" | "dashboard" | "integrations">("upload")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; file: string } | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const creditStatus = useCredit()

  const handleUpload = async () => {
    if (files.length === 0) return

    // Debug: Check if user and token exist
    console.log("User:", user)
    console.log("Token:", user?.token)
    console.log("Token exists:", !!user?.token)

    if (!user?.token) {
      setError("No authentication token found. Please sign in again.")
      return
    }

    setLoading(true)
    setError(null)
    setBatchResults([])
    setBatchProgress(null)

    const results: BatchResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setBatchProgress({ current: i + 1, total: files.length, file: file.name })

      try {
        const formData = new FormData()
        formData.append("file", file)

        console.log("Making request with token:", user.token.substring(0, 10) + "...")

        const response = await fetch("http://localhost:8000/extract-invoice/", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'X-API-Key': user.token, // Add this line as backup
          },
          body: formData,
        })

        console.log("Response status:", response.status)
        console.log("Response ok:", response.ok)

        if (response.ok) {
          const result = await response.json()
          if (!result.success) {
            results.push({
              success: false,
              error: result.error || "Processing marked as unsuccessful",
              filename: file.name,
            })
          } else {
            results.push({
              success: true,
              filename: file.name,
              data: result,
            })
          }
        } else {
          const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
          console.log("Error response:", errorData)
          results.push({
            success: false,
            error: errorData.detail || `HTTP ${response.status}`,
            filename: file.name,
          })
        }
      } catch (error) {
        console.log("Fetch error:", error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          filename: file.name,
        })
      }

      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    setLoading(false)
    setBatchProgress(null)
    setBatchResults(results)

    if (results.length === 1 && results[0].success) {
      setResult(results[0].data)
    }

    setTimeout(() => {
      if (results.length === 1) {
        setActiveView("analyze")
      } else {
        setActiveView("dashboard")
      }
    }, 500)
  }

  const handleFieldUpdate = (fieldPath: string, value: any) => {
    console.log("[v0] Field update:", fieldPath, value)
  }

  const calculateAnalytics = () => {
    const successfulResults = batchResults.filter((r) => r.success && (r.analysis || (r.data && r.data.analysis)))

    const totalAmount = successfulResults.reduce((sum, result) => {
      const analysis = result.analysis || (result.data && result.data.analysis)
      return sum + (analysis?.financial_data?.total_amount || 0)
    }, 0)

    return {
      totalInvoices: successfulResults.length,
      totalAmount,
      averageAmount: successfulResults.length > 0 ? totalAmount / successfulResults.length : 0,
    }
  }

  const analytics = calculateAnalytics()

  const handleExport = () => {
    const dataToExport = batchResults.length > 0 ? batchResults : result ? [result] : []

    if (dataToExport.length === 0) {
      alert("No data to export")
      return
    }

    setShowDownloadModal(true)
  }

  const handleDownload = async (format: "json" | "csv" | "excel") => {
    const dataToExport = batchResults.length > 0 ? batchResults : result ? [result] : []

    if (dataToExport.length === 0) {
      alert("No data to export")
      return
    }

    if (format === "json") {
      // Original JSON download
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-results-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === "excel") {
      // Generate true Excel file on frontend
      try {
        const successfulResults = batchResults.filter(
          (result) => result.success && (result.analysis || (result.data && result.data.analysis)),
        )

        // Prepare data for Excel
        const excelData = successfulResults.map((result) => {
          const analysis = result.analysis || (result.data && result.data.analysis)
          const processingInfo = result.processing_info || (result.data && result.data.processing_info)

          return {
            "File Name": result.filename || processingInfo?.filename || "Unknown",
            "Vendor Name": analysis?.vendor_info?.vendor_name || "Unknown Vendor",
            "Invoice Number": analysis?.document_details?.invoice_number || "N/A",
            "Invoice Date": analysis?.document_details?.invoice_date || "",
            "Due Date": analysis?.document_details?.due_date || "",
            "Total Amount": analysis?.financial_data?.total_amount || 0,
            "Subtotal": analysis?.financial_data?.subtotal || 0,
            "Tax Amount": analysis?.financial_data?.tax_amount || 0,
            "Currency": analysis?.financial_data?.currency || "USD",
            "Spending Category": analysis?.business_insights?.spending_category || "Other",
            "Payment Urgency": analysis?.business_insights?.payment_urgency || "standard",
            "Data Completeness": analysis?.business_insights?.data_completeness || "partial",
            "Processing Confidence": processingInfo?.processing_confidence || 0,
            "OCR Confidence": processingInfo?.ocr_confidence || 0,
          }
        })

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(excelData)

        // Add some styling and column widths
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        worksheet['!cols'] = [
          { width: 20 }, // File Name
          { width: 25 }, // Vendor Name
          { width: 15 }, // Invoice Number
          { width: 12 }, // Invoice Date
          { width: 12 }, // Due Date
          { width: 12 }, // Total Amount
          { width: 12 }, // Subtotal
          { width: 12 }, // Tax Amount
          { width: 8 },  // Currency
          { width: 15 }, // Spending Category
          { width: 12 }, // Payment Urgency
          { width: 15 }, // Data Completeness
          { width: 15 }, // Processing Confidence
          { width: 15 }, // OCR Confidence
        ]

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Data")

        // Add summary sheet
        const summaryData = [
          { "Metric": "Total Invoices", "Value": successfulResults.length },
          { "Metric": "Total Amount", "Value": analytics.totalAmount },
          { "Metric": "Average Amount", "Value": analytics.averageAmount },
          { "Metric": "Report Generated", "Value": new Date().toLocaleString() },
        ]
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
        summaryWorksheet['!cols'] = [{ width: 20 }, { width: 20 }]
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary")

        // Generate Excel file and download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-results-${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        alert(`✅ Excel file downloaded successfully! Contains ${successfulResults.length} invoices.`)

      } catch (error) {
        console.error("Excel generation error:", error)
        alert(`❌ Excel generation failed: ${error instanceof Error ? error.message : "Please try again."}`)
      }
    } else if (format === "csv") {
      // Use your existing CSV endpoint
      try {
        const successfulResults = batchResults.filter(
          (result) => result.success && (result.analysis || (result.data && result.data.analysis)),
        )

        const invoiceData = successfulResults.map((result) => {
          const analysis = result.analysis || (result.data && result.data.analysis)
          const processingInfo = result.processing_info || (result.data && result.data.processing_info)

          return {
            filename: result.filename || processingInfo?.filename || "Unknown",
            vendor_name: analysis?.vendor_info?.vendor_name || "Unknown Vendor",
            invoice_number: analysis?.document_details?.invoice_number || "N/A",
            invoice_date: analysis?.document_details?.invoice_date || new Date().toISOString().split("T")[0],
            due_date: analysis?.document_details?.due_date || "",
            total_amount: analysis?.financial_data?.total_amount || 0,
            subtotal: analysis?.financial_data?.subtotal || 0,
            tax_amount: analysis?.financial_data?.tax_amount || 0,
            currency: analysis?.financial_data?.currency || "USD",
            spending_category: analysis?.business_insights?.spending_category || "Other",
            payment_urgency: analysis?.business_insights?.payment_urgency || "standard",
            data_completeness: analysis?.business_insights?.data_completeness || "partial",
          }
        })

        const requestPayload = {
          invoices: invoiceData,
          summary: analytics,
        }

        const response = await fetch(`http://localhost:8000/reports/session-summary?format=csv`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        })

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`)
        }

        const blob = await response.blob()
        const csvBlob = new Blob([blob], { type: "text/csv" })
        
        const url = window.URL.createObjectURL(csvBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-results-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        alert(`✅ CSV file downloaded successfully!`)

      } catch (error) {
        console.error("CSV download error:", error)
        alert(`❌ CSV download failed: ${error instanceof Error ? error.message : "Please try again."}`)
      }
    }
  }

  const hasResults = result !== null || batchResults.length > 0

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} hasResults={hasResults} onExport={handleExport} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeView === "upload" && (
            <InvoiceUploader
              files={files}
              setFiles={setFiles}
              loading={loading}
              error={error}
              batchProgress={batchProgress}
              onUpload={handleUpload}
            />
          )}

          {activeView === "analyze" && (
            <InvoiceAnalyzer
              result={result}
              batchResults={batchResults}
              onFieldUpdate={handleFieldUpdate}
              onDownloadResults={handleExport}
            />
          )}

          {activeView === "dashboard" && <InvoiceDashboard batchResults={batchResults} />}
          
          {activeView === "integrations" && (
            <Integrations batchResults={batchResults} analytics={analytics} />
          )}
        </div>
      </main>

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
        dataCount={batchResults.length || (result ? 1 : 0)}
      />
    </div>
  )
}
