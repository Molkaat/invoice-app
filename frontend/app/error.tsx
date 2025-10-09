"use client"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center animate-fade-in-up">
        <Link href="/welcome" className="inline-flex items-center justify-center gap-3 mb-8">
          <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4">500</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">Something Went Wrong</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-6">
            We're sorry, but something unexpected happened. Our team has been notified and we're working on a fix.
          </p>

          {error.digest && (
            <div className="bg-muted border border-border rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-xs text-muted-foreground">
                Error ID: <span className="font-mono text-foreground">{error.digest}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold ai-glow flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/welcome"
            className="w-full sm:w-auto px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            If the problem persists, please contact our support team:
          </p>
          <a
            href="mailto:support@invoxio.com"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            support@invoxio.com
          </a>
        </div>
      </div>
    </div>
  )
}
