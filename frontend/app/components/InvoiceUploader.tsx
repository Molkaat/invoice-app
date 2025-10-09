"use client"
import type React from "react"
import { Upload, FileText, Loader2, XCircle } from "lucide-react"

interface BatchProgress {
  current: number
  total: number
  file: string
}

interface InvoiceUploaderProps {
  files: File[]
  setFiles: (files: File[]) => void
  loading: boolean
  error: string | null
  batchProgress: BatchProgress | null
  onUpload: () => void
}

export default function InvoiceUploader({
  files,
  setFiles,
  loading,
  error,
  batchProgress,
  onUpload,
}: InvoiceUploaderProps) {
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles: File[] = []
    const errors: string[] = []

    selectedFiles.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`)
        return
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/bmp",
        "image/tiff",
        "image/gif",
      ]
      const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".gif"]

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      ) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      alert("Some files were rejected:\n" + errors.join("\n"))
    }

    setFiles(validFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Invoices</h2>
        <p className="text-muted-foreground">Process 1 to N invoices with AI-powered extraction</p>
      </div>

      {/* Upload Area */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.gif"
            onChange={handleFilesSelect}
            disabled={loading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">PDF, JPG, PNG, BMP, TIFF, GIF (max 10MB each)</p>
            <p className="text-xs text-muted-foreground mt-2">Upload 1 or multiple files at once</p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-destructive hover:text-destructive/80 p-1 flex-shrink-0"
                      title="Remove file"
                      type="button"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            {batchProgress && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-medium text-foreground">Processing: {batchProgress.file}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {batchProgress.current}/{batchProgress.total}
                  </span>
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">Processing Error</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={onUpload}
              disabled={loading || files.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-all ai-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing {batchProgress?.current} of {batchProgress?.total}...
                </>
              ) : (
                `Process ${files.length} Invoice${files.length > 1 ? "s" : ""}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
