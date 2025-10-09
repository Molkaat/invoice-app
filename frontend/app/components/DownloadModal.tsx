"use client"
import { useState } from "react"
import { Download, FileText, Table, Grid3x3, X } from "lucide-react"

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload: (format: "json" | "csv" | "excel") => void
  dataCount: number
}

export default function DownloadModal({ isOpen, onClose, onDownload, dataCount }: DownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv" | "excel">("json")

  if (!isOpen) return null

  const formats = [
    {
      id: "json" as const,
      name: "JSON",
      description: "Machine-readable format, perfect for developers",
      icon: FileText,
      extension: ".json"
    },
    {
      id: "csv" as const,
      name: "CSV",
      description: "Spreadsheet format, opens in Excel, Google Sheets",
      icon: Table,
      extension: ".csv"
    },
    {
      id: "excel" as const,
      name: "Excel",
      description: "Native Excel format with formatting and multiple sheets",
      icon: Grid3x3,
      extension: ".xlsx" // Back to .xlsx since we're generating real Excel files
    }
  ]

  const handleDownload = () => {
    onDownload(selectedFormat)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Download Results</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred format to download {dataCount} processed invoice{dataCount > 1 ? "s" : ""}.
        </p>

        <div className="space-y-3 mb-6">
          {formats.map((format) => {
            const Icon = format.icon
            return (
              <label
                key={format.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFormat === format.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.id}
                  checked={selectedFormat === format.id}
                  onChange={(e) => setSelectedFormat(e.target.value as "json" | "csv" | "excel")}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedFormat === format.id ? "bg-primary/20" : "bg-secondary"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    selectedFormat === format.id ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{format.name}</span>
                    <span className="text-xs text-muted-foreground">{format.extension}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download {formats.find(f => f.id === selectedFormat)?.name}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}