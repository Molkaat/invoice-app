"use client"
import { useState, useEffect } from "react"

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      // Simulate email verification
      setTimeout(() => {
        setVerifying(false)
        // Randomly succeed or fail for demo
        const success = Math.random() > 0.2
        if (success) {
          setVerified(true)
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setError(true)
        }
      }, 2000)
    }
  }, [token, router])

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">Verifying Your Email</h2>
            <p className="text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully verified. You can now access all features of INVOXIO.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't verify your email. The link may have expired or is invalid.
            </p>

            <Link
              href="/verify-email-pending"
              className="w-full block text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold ai-glow mb-4"
            >
              Resend Verification Email
            </Link>

            <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
