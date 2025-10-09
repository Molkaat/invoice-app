"use client"
import { useState } from "react"

import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function VerifyEmailPendingPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const email = "user@example.com" // This would come from auth context

  const handleResend = async () => {
    setResending(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setResent(true)
    setResending(false)

    // Reset after 3 seconds
    setTimeout(() => {
      setResent(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
          <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3">Verify Your Email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <span className="font-medium text-foreground">{email}</span>
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 text-sm text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-2">Next steps:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>You'll be redirected to your dashboard</li>
            </ol>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground text-left">
            <p className="mb-2">Didn't receive the email?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes before requesting a new one</li>
            </ul>
          </div>

          {resent && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4 flex items-center gap-3 text-accent animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Verification email sent successfully!</p>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold mb-4 flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : resent ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Email Sent
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>

          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/signin" className="text-muted-foreground hover:text-foreground transition-colors">
              Back to Sign In
            </Link>
            <span className="text-border">|</span>
            <Link href="/dashboard" className="text-primary hover:underline font-medium">
              Skip for Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
