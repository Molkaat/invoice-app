"use client"
import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, FileText, AlertCircle, BarChart3 } from "lucide-react"

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
  data_completeness: "complete" | "partial" | "incomplete"
  spending_category: string
  payment_urgency: "immediate" | "standard" | "low"
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

interface InvoiceDashboardProps {
  batchResults?: BatchResult[]
  allInvoices?: any[]
  onSearch?: (filters: FilterOptions) => void
  onFilter?: (filters: FilterOptions) => void
}

const generateRealAlerts = (batchResults: BatchResult[], analytics: Analytics) => {
  const alerts: Array<{
    type: "warning" | "info" | "success" | "error"
    title: string
    message: string
    icon: string
  }> = []

  if (!batchResults || batchResults.length === 0) {
    return alerts
  }

  const successfulResults = batchResults.filter((r) => {
    const hasAnalysis = r.success && (r.analysis || (r.data && r.data.analysis))
    return hasAnalysis
  })

  if (successfulResults.length > 0) {
    alerts.push({
      type: "success",
      title: "Processing Complete",
      message: `Successfully processed ${successfulResults.length} out of ${batchResults.length} invoice${batchResults.length > 1 ? "s" : ""}`,
      icon: "check-circle",
    })
  }

  const failedResults = batchResults.filter((r) => !r.success)
  if (failedResults.length > 0) {
    alerts.push({
      type: "error",
      title: "Processing Failures",
      message: `${failedResults.length} file${failedResults.length > 1 ? "s" : ""} failed to process. Check file quality and format.`,
      icon: "x-circle",
    })
  }

  const highValueThreshold = 100
  const highValueInvoices = successfulResults.filter((result) => {
    const analysis = result.analysis || (result.data && result.data.analysis)
    const amount = analysis?.financial_data?.total_amount || 0
    return amount >= highValueThreshold
  })

  if (highValueInvoices.length > 0) {
    const totalHighValue = highValueInvoices.reduce((sum, invoice) => {
      const analysis = invoice.analysis || (invoice.data && invoice.data.analysis)
      return sum + (analysis?.financial_data?.total_amount || 0)
    }, 0)

    alerts.push({
      type: "info",
      title: "High Value Invoices",
      message: `${highValueInvoices.length} invoice${highValueInvoices.length > 1 ? "s" : ""} worth $${totalHighValue.toFixed(2)} detected`,
      icon: "currency-dollar",
    })
  }

  const invoicesWithWarnings = successfulResults.filter((result) => {
    const warnings = result.warnings || (result.data && result.data.warnings)
    return warnings && warnings.length > 0
  })

  if (invoicesWithWarnings.length > 0) {
    alerts.push({
      type: "warning",
      title: "Data Quality Issues",
      message: `${invoicesWithWarnings.length} invoice${invoicesWithWarnings.length > 1 ? "s" : ""} ${invoicesWithWarnings.length > 1 ? "have" : "has"} validation warnings. Review recommended.`,
      icon: "exclamation",
    })
  }

  return alerts
}

const calculateAnalytics = (batchResults: BatchResult[]): Analytics => {
  const successfulResults = batchResults.filter((r) => r.success && (r.analysis || (r.data && r.data.analysis)))

  const totalAmount = successfulResults.reduce((sum, result) => {
    const analysis = result.analysis || (result.data && result.data.analysis)
    return sum + (analysis?.financial_data?.total_amount || 0)
  }, 0)

  const vendorTotals: Record<string, number> = {}
  const categories: Record<string, number> = {}

  successfulResults.forEach((result) => {
    const analysis = result.analysis || (result.data && result.data.analysis)
    const vendor = analysis?.vendor_info?.vendor_name || "Unknown"
    const amount = analysis?.financial_data?.total_amount || 0
    const category = analysis?.business_insights?.spending_category || "Uncategorized"

    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + amount
    categories[category] = (categories[category] || 0) + 1
  })

  const topVendors = Object.entries(vendorTotals)
    .map(([vendor, amount]) => ({ vendor, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    totalInvoices: successfulResults.length,
    totalAmount,
    averageAmount: successfulResults.length > 0 ? totalAmount / successfulResults.length : 0,
    topVendors,
    monthlyTrends: [],
    dueInvoices: [],
    categories,
  }
}

export default function InvoiceDashboard({
  batchResults = [],
  allInvoices = [],
  onSearch,
  onFilter,
}: InvoiceDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalInvoices: 0,
    totalAmount: 0,
    averageAmount: 0,
    topVendors: [],
    monthlyTrends: [],
    dueInvoices: [],
    categories: {},
  })

  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (batchResults.length > 0) {
      const newAnalytics = calculateAnalytics(batchResults)
      setAnalytics(newAnalytics)
      setAlerts(generateRealAlerts(batchResults, newAnalytics))
    }
  }, [batchResults])

  if (batchResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
          <p className="text-sm text-muted-foreground">Process some invoices to see analytics and insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Analytics and insights from your processed invoices</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 border ${
                alert.type === "success"
                  ? "bg-green-500/10 border-green-500/30"
                  : alert.type === "error"
                    ? "bg-red-500/10 border-red-500/30"
                    : alert.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.type === "success"
                      ? "text-green-500"
                      : alert.type === "error"
                        ? "text-red-500"
                        : alert.type === "warning"
                          ? "text-yellow-500"
                          : "text-blue-500"
                  }`}
                />
                <div>
                  <h4
                    className={`text-sm font-semibold mb-1 ${
                      alert.type === "success"
                        ? "text-green-500"
                        : alert.type === "error"
                          ? "text-red-500"
                          : alert.type === "warning"
                            ? "text-yellow-500"
                            : "text-blue-500"
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p className="text-sm text-foreground/80">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{analytics.totalInvoices}</div>
          <p className="text-sm text-muted-foreground">Total Invoices</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">${analytics.totalAmount.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">${analytics.averageAmount.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Average Amount</p>
        </div>
      </div>

      {/* Top Vendors */}
      {analytics.topVendors.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Vendors</h3>
          <div className="space-y-3">
            {analytics.topVendors.map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">{vendor.vendor}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">${vendor.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {Object.keys(analytics.categories).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.categories).map(([category, count]) => (
              <div key={category} className="bg-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground mb-1">{count}</div>
                <p className="text-xs text-muted-foreground">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
