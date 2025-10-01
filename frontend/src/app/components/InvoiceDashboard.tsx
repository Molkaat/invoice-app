import React, { useState, useEffect } from 'react'

// Add proper TypeScript interfaces
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

interface BusinessInsights {
  data_completeness: 'complete' | 'partial' | 'incomplete'
  spending_category: string
  payment_urgency: 'immediate' | 'standard' | 'low'
}

interface Analysis {
  financial_data: FinancialData
  vendor_info: VendorInfo
  document_details: DocumentDetails
  business_insights: BusinessInsights
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

interface FilterOptions {
  search: string
  dateFrom: string
  dateTo: string
  amountMin: number | null
  amountMax: number | null
  category: string
  vendor: string
}

interface TopVendor {
  vendor: string
  amount: number
}

interface Analytics {
  totalInvoices: number
  totalAmount: number
  averageAmount: number
  topVendors: TopVendor[]
  monthlyTrends: any[]
  dueInvoices: any[]
  categories: Record<string, number>
}

interface DateFilter {
  from: string
  to: string
}

interface AmountFilter {
  min: string
  max: string
}

interface InvoiceDashboardProps {
  batchResults?: BatchResult[]
  allInvoices?: any[]
  onSearch?: (filters: FilterOptions) => void
  onFilter?: (filters: FilterOptions) => void
}

// Update the generateRealAlerts function to better handle the data structure
const generateRealAlerts = (batchResults: BatchResult[], analytics: Analytics) => {
  const alerts: Array<{
    type: 'warning' | 'info' | 'success' | 'error'
    title: string
    message: string
    icon: string
  }> = []

  console.log('Generating alerts for batch results:', batchResults) // Debug log

  // Only generate alerts if we have actual data
  if (!batchResults || batchResults.length === 0) {
    console.log('No batch results found') // Debug log
    return alerts
  }

  // Fix the filtering to handle both data structures
  const successfulResults = batchResults.filter(r => {
    const hasAnalysis = r.success && (r.analysis || (r.data && r.data.analysis))
    console.log(`Result ${r.filename}: success=${r.success}, hasAnalysis=${hasAnalysis}`) // Debug log
    return hasAnalysis
  })

  console.log(`Found ${successfulResults.length} successful results out of ${batchResults.length}`) // Debug log

  // 1. Processing Quality Alert - Always show if we have results
  if (successfulResults.length > 0) {
    alerts.push({
      type: 'success',
      title: 'Processing Complete',
      message: `Successfully processed ${successfulResults.length} out of ${batchResults.length} invoice${batchResults.length > 1 ? 's' : ''}`,
      icon: 'check-circle'
    })
  }

  // 2. Processing Errors Alert
  const failedResults = batchResults.filter(r => !r.success)
  if (failedResults.length > 0) {
    alerts.push({
      type: 'error',
      title: 'Processing Failures',
      message: `${failedResults.length} file${failedResults.length > 1 ? 's' : ''} failed to process. Check file quality and format.`,
      icon: 'x-circle'
    })
  }

  // 3. High Value Invoice Alert
  const highValueThreshold = 100 // Lower threshold for testing
  const highValueInvoices = successfulResults.filter(result => {
    const analysis = result.analysis || (result.data && result.data.analysis)
    const amount = analysis?.financial_data?.total_amount || 0
    console.log(`Invoice ${result.filename}: amount=${amount}`) // Debug log
    return amount >= highValueThreshold
  })

  if (highValueInvoices.length > 0) {
    const totalHighValue = highValueInvoices.reduce((sum, invoice) => {
      const analysis = invoice.analysis || (invoice.data && invoice.data.analysis)
      return sum + (analysis?.financial_data?.total_amount || 0)
    }, 0)

    alerts.push({
      type: 'info',
      title: 'High Value Invoices',
      message: `${highValueInvoices.length} invoice${highValueInvoices.length > 1 ? 's' : ''} worth $${totalHighValue.toFixed(2)} detected`,
      icon: 'currency-dollar'
    })
  }

  // 4. Data Quality Issues Alert
  const invoicesWithWarnings = successfulResults.filter(result => {
    const warnings = result.warnings || (result.data && result.data.warnings)
    return warnings && warnings.length > 0
  })

  if (invoicesWithWarnings.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Data Quality Issues',
      message: `${invoicesWithWarnings.length} invoice${invoicesWithWarnings.length > 1 ? 's' : ''} ${invoicesWithWarnings.length > 1 ? 'have' : 'has'} validation warnings. Review recommended.`,
      icon: 'exclamation'
    })
  }

  // 5. Duplicate Vendor Alert
  if (successfulResults.length > 1) {
    const vendorCounts: Record<string, number> = {}
    successfulResults.forEach(result => {
      const analysis = result.analysis || (result.data && result.data.analysis)
      const vendor = analysis?.vendor_info?.vendor_name
      if (vendor) {
        vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1
      }
    })

    const duplicateVendors = Object.entries(vendorCounts).filter(([, count]) => count > 1)
    if (duplicateVendors.length > 0) {
      const [topVendor, count] = duplicateVendors[0]
      alerts.push({
        type: 'info',
        title: 'Duplicate Vendors Detected',
        message: `"${topVendor}" appears ${count} times in your batch`,
        icon: 'duplicate'
      })
    }
  }

  console.log('Generated alerts:', alerts) // Debug log
  return alerts
}

// Add filtered results state and filtering logic
const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ 
  batchResults = [], 
  allInvoices = [],
  onSearch,
  onFilter
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ from: '', to: '' })
  const [amountFilter, setAmountFilter] = useState<AmountFilter>({ min: '', max: '' })
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [vendorFilter, setVendorFilter] = useState<string>('')

  // Add filtered results state
  const [filteredResults, setFilteredResults] = useState<BatchResult[]>([])
  const [isFiltersApplied, setIsFiltersApplied] = useState<boolean>(false)

  // Add loading state for actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Analytics data
  const [analytics, setAnalytics] = useState<Analytics>({
    totalInvoices: 0,
    totalAmount: 0,
    averageAmount: 0,
    topVendors: [],
    monthlyTrends: [],
    dueInvoices: [],
    categories: {}
  })

  // Add handler functions for Quick Actions
  const handleQuickBooksExport = async () => {
    setActionLoading('quickbooks')
    try {
      // Prepare the invoice data for QuickBooks
      const invoiceData = batchResults
        .filter(result => result.success && (result.analysis || (result.data && result.data.analysis)))
        .map(result => {
          const analysis = result.analysis || (result.data && result.data.analysis)
          return {
            vendor_name: analysis?.vendor_info?.vendor_name || 'Unknown Vendor',
            invoice_number: analysis?.document_details?.invoice_number || 'N/A',
            invoice_date: analysis?.document_details?.invoice_date || new Date().toISOString().split('T')[0],
            due_date: analysis?.document_details?.due_date || '',
            total_amount: analysis?.financial_data?.total_amount || 0,
            currency: analysis?.financial_data?.currency || 'USD',
            line_items: analysis?.line_items || []
          }
        })

      if (invoiceData.length === 0) {
        alert('❌ No processed invoices found. Please process some invoices first.')
        return
      }

      const response = await fetch('http://localhost:8000/export/quickbooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoices: invoiceData,
          summary: {
            total_count: invoiceData.length,
            total_amount: analytics.totalAmount
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Export failed' }))
        throw new Error(errorData.detail || 'Export failed')
      }
      
      const result = await response.json()
      alert(`✅ Success! Sent ${invoiceData.length} invoices to QuickBooks webhook. Total: $${analytics.totalAmount.toFixed(2)}`)
      
    } catch (error) {
      console.error('QuickBooks export error:', error)
      alert(`❌ Export failed: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleXeroExport = async () => {
    setActionLoading('xero')
    try {
      // Prepare the invoice data for Xero
      const invoiceData = batchResults
        .filter(result => result.success && (result.analysis || (result.data && result.data.analysis)))
        .map(result => {
          const analysis = result.analysis || (result.data && result.data.analysis)
          return {
            vendor_name: analysis?.vendor_info?.vendor_name || 'Unknown Vendor',
            invoice_number: analysis?.document_details?.invoice_number || 'N/A',
            invoice_date: analysis?.document_details?.invoice_date || new Date().toISOString().split('T')[0],
            due_date: analysis?.document_details?.due_date || '',
            total_amount: analysis?.financial_data?.total_amount || 0,
            subtotal: analysis?.financial_data?.subtotal || 0,
            tax_amount: analysis?.financial_data?.tax_amount || 0,
            currency: analysis?.financial_data?.currency || 'USD'
          }
        })

      if (invoiceData.length === 0) {
        alert('❌ No processed invoices found. Please process some invoices first.')
        return
      }

      const response = await fetch('http://localhost:8000/export/xero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoices: invoiceData,
          summary: {
            total_count: invoiceData.length,
            total_amount: analytics.totalAmount
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Export failed' }))
        throw new Error(errorData.detail || 'Export failed')
      }
      
      const result = await response.json()
      alert(`✅ Success! Sent ${invoiceData.length} invoices to Xero webhook. Total: $${analytics.totalAmount.toFixed(2)}`)
      
    } catch (error) {
      console.error('Xero export error:', error)
      alert(`❌ Export failed: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateReport = async () => {
    setActionLoading('report')
    try {
      // Calculate analytics fresh from batchResults to ensure accuracy
      const successfulResults = batchResults.filter(result => 
        result.success && (result.analysis || (result.data && result.data.analysis))
      )
      
      console.log('Successful results for report:', successfulResults.length) // Debug log
      
      if (successfulResults.length === 0) {
        alert('❌ No processed invoices found. Please process some invoices first.')
        setActionLoading(null)
        return
      }
  
      // Calculate fresh analytics for the report
      const freshTotalAmount = successfulResults.reduce((sum, result) => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const amount = analysis?.financial_data?.total_amount || 0
        console.log(`Report calc - Invoice ${result.filename}: amount=${amount}`) // Debug log
        return sum + amount
      }, 0)
  
      const freshAverageAmount = successfulResults.length > 0 ? freshTotalAmount / successfulResults.length : 0
  
      // Calculate fresh vendor and category data
      const vendorMap: Record<string, number> = {}
      const categoryMap: Record<string, number> = {}
  
      successfulResults.forEach(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        
        // Vendor aggregation
        const vendor = analysis?.vendor_info?.vendor_name || 'Unknown Vendor'
        const amount = analysis?.financial_data?.total_amount || 0
        vendorMap[vendor] = (vendorMap[vendor] || 0) + amount
  
        // Category aggregation
        const category = analysis?.business_insights?.spending_category || 'Other'
        categoryMap[category] = (categoryMap[category] || 0) + amount
      })
  
      const freshTopVendors = Object.entries(vendorMap)
        .map(([vendor, amount]) => ({ vendor, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
  
      console.log('Fresh analytics for report:', {
        totalInvoices: successfulResults.length,
        totalAmount: freshTotalAmount,
        averageAmount: freshAverageAmount,
        topVendors: freshTopVendors,
        categories: categoryMap
      }) // Debug log
      
      // Prepare the invoice data to send
      const invoiceData = successfulResults.map(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const processingInfo = result.processing_info || (result.data && result.data.processing_info)
        
        const invoiceItem = {
          filename: result.filename || processingInfo?.filename || 'Unknown',
          vendor_name: analysis?.vendor_info?.vendor_name || 'Unknown Vendor',
          invoice_number: analysis?.document_details?.invoice_number || 'N/A',
          invoice_date: analysis?.document_details?.invoice_date || new Date().toISOString().split('T')[0],
          due_date: analysis?.document_details?.due_date || '',
          total_amount: analysis?.financial_data?.total_amount || 0,
          subtotal: analysis?.financial_data?.subtotal || 0,
          tax_amount: analysis?.financial_data?.tax_amount || 0,
          currency: analysis?.financial_data?.currency || 'USD',
          spending_category: analysis?.business_insights?.spending_category || 'Other',
          payment_urgency: analysis?.business_insights?.payment_urgency || 'standard',
          data_completeness: analysis?.business_insights?.data_completeness || 'partial',
          processing_confidence: processingInfo?.processing_confidence || 0,
          ocr_confidence: processingInfo?.ocr_confidence || 0,
          text_length: processingInfo?.text_length || 0,
          detected_language: processingInfo?.detected_language || 'en',
          warnings: result.warnings || []
        }
        
        console.log(`Invoice item for ${result.filename}:`, invoiceItem) // Debug log
        return invoiceItem
      })
  
      const summaryData = {
        total_invoices: successfulResults.length,
        total_amount: freshTotalAmount,
        average_amount: freshAverageAmount,
        categories: categoryMap,
        top_vendors: freshTopVendors
      }
  
      const requestPayload = {
        invoices: invoiceData,
        summary: summaryData
      }
  
      console.log('Full request payload:', requestPayload) // Debug log
      console.log('Request payload JSON string length:', JSON.stringify(requestPayload).length) // Debug log
  
      // Use the correct endpoint that processes frontend data
      const response = await fetch(`http://localhost:8000/reports/session-summary?format=csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      })
      
      console.log('Response status:', response.status) // Debug log
      console.log('Response headers:', Object.fromEntries(response.headers.entries())) // Debug log
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Report generation response:', response.status, errorText)
        throw new Error(`Report generation failed: ${response.status} ${response.statusText}`)
      }
      
      // Check if response is actually a CSV
      const contentType = response.headers.get('content-type')
      console.log('Response content type:', contentType)
      
      // Download the CSV file
      const blob = await response.blob()
      console.log('Blob size:', blob.size, 'Type:', blob.type)
      
      // Also log the content to see what we're getting
      const textContent = await blob.text()
      console.log('Received CSV content preview:', textContent.substring(0, 500)) // Debug log
      
      if (blob.size === 0) {
        throw new Error('Received empty file from server')
      }
      
      // Create a new blob for download (since we consumed the original)
      const downloadBlob = new Blob([textContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(downloadBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session_report_${new Date().toISOString().split('T')[0]}_${invoiceData.length}invoices.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert(`✅ Report generated successfully! ${invoiceData.length} invoices included, total: $${freshTotalAmount.toFixed(2)}`)
      
    } catch (error) {
      console.error('Report generation error:', error)
      alert(`❌ Report generation failed: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Add filtering function
  const applyFilters = (results: BatchResult[]) => {
    let filtered = results.filter(result => result.success && (result.analysis || (result.data && result.data.analysis)))
    
    // Search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const filename = result.filename?.toLowerCase() || ''
        const vendor = analysis?.vendor_info?.vendor_name?.toLowerCase() || ''
        const invoiceNumber = analysis?.document_details?.invoice_number?.toLowerCase() || ''
        const category = analysis?.business_insights?.spending_category?.toLowerCase() || ''
        
        const searchLower = searchTerm.toLowerCase()
        return filename.includes(searchLower) || 
               vendor.includes(searchLower) || 
               invoiceNumber.includes(searchLower) ||
               category.includes(searchLower)
      })
    }
    
    // Date range filter
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const invoiceDate = analysis?.document_details?.invoice_date
        
        if (!invoiceDate) return false
        
        const date = new Date(invoiceDate)
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null
        
        if (fromDate && date < fromDate) return false
        if (toDate && date > toDate) return false
        
        return true
      })
    }
    
    // Amount range filter
    if (amountFilter.min || amountFilter.max) {
      filtered = filtered.filter(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const amount = analysis?.financial_data?.total_amount || 0
        
        const minAmount = amountFilter.min ? parseFloat(amountFilter.min) : null
        const maxAmount = amountFilter.max ? parseFloat(amountFilter.max) : null
        
        if (minAmount && amount < minAmount) return false
        if (maxAmount && amount > maxAmount) return false
        
        return true
      })
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const category = analysis?.business_insights?.spending_category
        return category === categoryFilter
      })
    }
    
    // Vendor filter
    if (vendorFilter.trim()) {
      filtered = filtered.filter(result => {
        const analysis = result.analysis || (result.data && result.data.analysis)
        const vendor = analysis?.vendor_info?.vendor_name?.toLowerCase() || ''
        return vendor.includes(vendorFilter.toLowerCase())
      })
    }
    
    return filtered
  }

  // Update analytics calculation to use filtered results when filters are applied
  useEffect(() => {
    console.log('Calculating analytics for batch results:', batchResults) // Debug log
    
    if (!batchResults || batchResults.length === 0) {
      console.log('No batch results to analyze') // Debug log
      setAnalytics({
        totalInvoices: 0,
        totalAmount: 0,
        averageAmount: 0,
        topVendors: [],
        monthlyTrends: [],
        dueInvoices: [],
        categories: {}
      })
      return
    }

    // Filter successful results with proper data access
    const successfulResults = batchResults.filter(result => {
      const hasAnalysis = result.success && (result.analysis || (result.data && result.data.analysis))
      console.log(`Result ${result.filename}: success=${result.success}, hasAnalysis=${hasAnalysis}`) // Debug log
      return hasAnalysis
    })

    console.log(`Processing ${successfulResults.length} successful results`) // Debug log

    // Calculate total amount with proper data access
    const totalAmount = successfulResults.reduce((sum, result) => {
      // Try both data structures
      const analysis = result.analysis || (result.data && result.data.analysis)
      const amount = analysis?.financial_data?.total_amount || 0
      console.log(`Invoice ${result.filename}: amount=${amount}`) // Debug log
      return sum + amount
    }, 0)

    console.log(`Total calculated amount: ${totalAmount}`) // Debug log

    // Calculate vendor data
    const vendorMap: Record<string, number> = {}
    const categoryMap: Record<string, number> = {}

    successfulResults.forEach(result => {
      const analysis = result.analysis || (result.data && result.data.analysis)
      
      // Vendor aggregation
      const vendor = analysis?.vendor_info?.vendor_name || 'Unknown Vendor'
      const amount = analysis?.financial_data?.total_amount || 0
      vendorMap[vendor] = (vendorMap[vendor] || 0) + amount

      // Category aggregation
      const category = analysis?.business_insights?.spending_category || 'Other'
      categoryMap[category] = (categoryMap[category] || 0) + amount
    })

    // Sort vendors by amount
    const topVendors = Object.entries(vendorMap)
      .map(([vendor, amount]) => ({ vendor, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const newAnalytics: Analytics = {
      totalInvoices: successfulResults.length,
      totalAmount: totalAmount,
      averageAmount: successfulResults.length > 0 ? totalAmount / successfulResults.length : 0,
      topVendors: topVendors,
      monthlyTrends: [], // Could be implemented later
      dueInvoices: [], // Could be implemented later
      categories: categoryMap
    }

    console.log('Final analytics:', newAnalytics) // Debug log
    setAnalytics(newAnalytics)
  }, [batchResults])

  const handleSearch = () => {
    console.log('Applying filters...')
    const filtered = applyFilters(batchResults)
    setFilteredResults(filtered)
    setIsFiltersApplied(true)
    
    console.log(`Filtered ${batchResults.length} results down to ${filtered.length}`)
    
    // Call the external onSearch callback if provided
    const filters: FilterOptions = {
      search: searchTerm,
      dateFrom: dateFilter.from,
      dateTo: dateFilter.to,
      amountMin: amountFilter.min ? parseFloat(amountFilter.min) : null,
      amountMax: amountFilter.max ? parseFloat(amountFilter.max) : null,
      category: categoryFilter,
      vendor: vendorFilter
    }
    
    if (onSearch) {
      onSearch(filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDateFilter({ from: '', to: '' })
    setAmountFilter({ min: '', max: '' })
    setCategoryFilter('')
    setVendorFilter('')
    setFilteredResults([])
    setIsFiltersApplied(false)
    console.log('Filters cleared')
  }

  // Get the results to display (filtered or all)
  const resultsToDisplay = isFiltersApplied ? filteredResults : batchResults
  const resultsToAnalyze = isFiltersApplied ? filteredResults : batchResults

  return (
    <div className="space-y-6">
      {/* Analytics Overview - show filter status */}
      {(batchResults?.length > 0 || analytics.totalInvoices > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📊 Analytics Overview</h3>
            {isFiltersApplied && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Filtered: {filteredResults.length} of {batchResults.length} invoices
              </span>
            )}
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalInvoices}</div>
              <div className="text-sm text-blue-800">
                {isFiltersApplied ? 'Filtered Invoices' : 'Total Invoices'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">${analytics.totalAmount.toFixed(2)}</div>
              <div className="text-sm text-green-800">
                {isFiltersApplied ? 'Filtered Amount' : 'Total Amount'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">${analytics.averageAmount.toFixed(2)}</div>
              <div className="text-sm text-purple-800">Average Amount</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(analytics.categories).length}
              </div>
              <div className="text-sm text-orange-800">Categories</div>
            </div>
          </div>

          {/* Show filter summary if filters are applied */}
          {isFiltersApplied && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    Search: "{searchTerm}"
                  </span>
                )}
                {dateFilter.from && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    From: {dateFilter.from}
                  </span>
                )}
                {dateFilter.to && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    To: {dateFilter.to}
                  </span>
                )}
                {amountFilter.min && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    Min: ${amountFilter.min}
                  </span>
                )}
                {amountFilter.max && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    Max: ${amountFilter.max}
                  </span>
                )}
                {categoryFilter && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    Category: {categoryFilter}
                  </span>
                )}
                {vendorFilter && (
                  <span className="text-xs bg-white px-2 py-1 rounded border">
                    Vendor: "{vendorFilter}"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rest of your analytics sections... */}
          {analytics.topVendors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">🏢 Top Vendors by Amount</h4>
              <div className="space-y-2">
                {analytics.topVendors.map((vendor, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{vendor.vendor}</span>
                    <span className="text-green-600 font-semibold">${vendor.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(analytics.categories).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">📋 Spending Categories</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(analytics.categories).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters section - keep as is */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔍 Search & Filter</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
            type="button"
          >
            Clear all filters
          </button>
        </div>

        {/* Your existing search and filter controls... */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices, vendors, descriptions..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                placeholder="From"
                value={dateFilter.from}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                placeholder="To"
                value={dateFilter.to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min amount"
                value={amountFilter.min}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="number"
                placeholder="Max amount"
                value={amountFilter.max}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All categories</option>
              <option value="software">Software</option>
              <option value="services">Services</option>
              <option value="supplies">Supplies</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              type="text"
              placeholder="Vendor name"
              value={vendorFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVendorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Smart Alerts - use filtered results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Smart Alerts</h3>

        {(() => {
          const realAlerts = generateRealAlerts(resultsToAnalyze, analytics)
          
          if (realAlerts.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <div className="text-sm">
                  {isFiltersApplied ? 'No alerts for filtered results' : 'No alerts at this time'}
                </div>
                <div className="text-xs">
                  {isFiltersApplied ? 'Try adjusting your filters' : 'Process some invoices to see smart insights here'}
                </div>
              </div>
            )
          }

          return (
            <div className="space-y-3">
              {realAlerts.map((alert, index) => (
                <div key={index} className={`flex items-center p-3 border rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-shrink-0">
                    {alert.icon === 'exclamation-triangle' && (
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {alert.icon === 'check-circle' && (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {alert.icon === 'currency-dollar' && (
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    )}
                    {alert.icon === 'exclamation' && (
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    {alert.icon === 'x-circle' && (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {alert.icon === 'duplicate' && (
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      alert.type === 'warning' ? 'text-yellow-800' :
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {alert.title}
                    </p>
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-yellow-700' :
                      alert.type === 'error' ? 'text-red-700' :
                      alert.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Recent Activity - use filtered results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Activity</h3>
        
        {resultsToDisplay && resultsToDisplay.length > 0 ? (
          <div className="space-y-3">
            {resultsToDisplay.slice(0, 5).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {result.processing_info?.filename || result.filename || `File ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.success ? 'Processed successfully' : 'Processing failed'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {result.success && result.analysis?.financial_data?.total_amount && (
                    <div className="text-sm font-medium text-green-600">
                      ${result.analysis.financial_data.total_amount.toFixed(2)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm">
              {isFiltersApplied ? 'No results match your filters' : 'No recent activity'}
            </div>
            <div className="text-xs">
              {isFiltersApplied ? 'Try adjusting your search criteria' : 'Upload some invoices to see activity here'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Updated with real functionality and loading states */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleQuickBooksExport}
            disabled={!batchResults || batchResults.length === 0 || actionLoading === 'quickbooks'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {actionLoading === 'quickbooks' ? '⏳' : '📊'}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {actionLoading === 'quickbooks' ? 'Sending...' : 'Export to QuickBooks'}
              </div>
              <div className="text-xs text-gray-500">
                {actionLoading === 'quickbooks' ? 'Processing webhook...' :
                 analytics.totalInvoices > 0 
                  ? `Send ${analytics.totalInvoices} invoice${analytics.totalInvoices > 1 ? 's' : ''} via webhook`
                  : 'No invoices to export'
                }
              </div>
            </div>
          </button>

          <button 
            onClick={handleGenerateReport}
            disabled={!batchResults || batchResults.length === 0 || actionLoading === 'report'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {actionLoading === 'report' ? '⏳' : '📈'}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {actionLoading === 'report' ? 'Generating...' : 'Generate Report'}
              </div>
              <div className="text-xs text-gray-500">
                {actionLoading === 'report' ? 'Creating CSV file...' :
                 analytics.totalInvoices > 0 
                  ? `Monthly summary ($${analytics.totalAmount.toFixed(2)})`
                  : 'Process invoices first'
                }
              </div>
            </div>
          </button>

          <button 
            onClick={handleXeroExport}
            disabled={!batchResults || batchResults.length === 0 || actionLoading === 'xero'}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {actionLoading === 'xero' ? '⏳' : '🔄'}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {actionLoading === 'xero' ? 'Syncing...' : 'Sync with Xero'}
              </div>
              <div className="text-xs text-gray-500">
                {actionLoading === 'xero' ? 'Sending webhook...' :
                 analytics.totalInvoices > 0 
                  ? `Update ${analytics.totalInvoices} record${analytics.totalInvoices > 1 ? 's' : ''} via webhook`
                  : 'No records to sync'
                }
              </div>
            </div>
          </button>
        </div>

        {/* Add webhook status info */}
        {actionLoading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">
                {actionLoading === 'quickbooks' && 'Sending data to QuickBooks webhook...'}
                {actionLoading === 'xero' && 'Sending data to Xero webhook...'}
                {actionLoading === 'report' && 'Generating monthly report...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceDashboard