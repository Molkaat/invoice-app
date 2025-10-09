"use client"
import { useState } from "react"
import type React from "react"

import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Github } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

type Plan = "free" | "pro" | "enterprise"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [step, setStep] = useState<"plan" | "details">("plan")
  const [selectedPlan, setSelectedPlan] = useState<Plan>("free")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: "free" as Plan,
      name: "Free",
      price: "$0",
      credits: "10 credits/month",
      features: ["Basic AI extraction", "CSV export", "Email support"],
    },
    {
      id: "pro" as Plan,
      name: "Pro",
      price: "$29",
      credits: "500 credits/month",
      features: ["Advanced AI extraction", "All export formats", "Priority support", "API access"],
      popular: true,
    },
    {
      id: "enterprise" as Plan,
      name: "Enterprise",
      price: "Custom",
      credits: "Unlimited credits",
      features: ["Custom AI training", "Dedicated support", "SLA guarantee", "On-premise option"],
    },
  ]

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    if (plan === "enterprise") {
      window.location.href = "mailto:sales@invoxio.com"
    } else {
      setStep("details")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, name)
      router.push("/verify-email-pending")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`[v0] Social login with ${provider}`)
    alert(`Social login with ${provider} - This would integrate with OAuth providers`)
  }

  if (step === "plan") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-5xl animate-fade-in-up">
          <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-3">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Start with a plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/50"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.id !== "enterprise" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.credits}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 ai-glow"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {plan.id === "enterprise" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Already have an account? <span className="text-primary hover:underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link href="/welcome" className="flex items-center justify-center gap-3 mb-8">
          <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
        </Link>

        {/* Sign Up Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground">
              Start with the <span className="font-semibold text-foreground">{selectedPlan}</span> plan
            </p>
            <button onClick={() => setStep("plan")} className="text-sm text-primary hover:underline mt-1">
              Change plan
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full px-6 py-3 bg-background border border-input rounded-lg hover:bg-muted transition-colors font-medium flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialLogin("GitHub")}
              className="w-full px-6 py-3 bg-background border border-input rounded-lg hover:bg-muted transition-colors font-medium flex items-center justify-center gap-3"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or continue with email</span>
            </div>
          </div>
          {/* </CHANGE> */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer">
                  Send me product updates and marketing emails (optional)
                </label>
              </div>
            </div>
            {/* </CHANGE> */}

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold ai-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/welcome" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
