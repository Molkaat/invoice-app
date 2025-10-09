"use client"
import {
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Upload,
  Brain,
  Download,
  BarChart3,
  Lock,
  Code2,
  Users,
  Clock,
  FileCheck,
  ChevronDown,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Play,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function WelcomePage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/welcome" className="flex items-center gap-3">
              <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-sm ai-glow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          AI-Powered Invoice Processing
        </div>

        <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance animate-fade-in-up animation-delay-100">
          Transform Invoices into <span className="text-primary">Actionable Data</span> Instantly
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty animate-fade-in-up animation-delay-200">
          Stop wasting hours on manual data entry. Our AI extracts, validates, and organizes invoice data with 99.5%
          accuracy—so you can focus on growing your business.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-300">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-lg ai-glow flex items-center justify-center gap-2 hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-all font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="animate-scale-in animation-delay-400">
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <p className="text-sm text-muted-foreground">Invoices Processed</p>
          </div>
          <div className="animate-scale-in animation-delay-500">
            <div className="text-4xl font-bold text-primary mb-2">99.5%</div>
            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
          </div>
          <div className="animate-scale-in animation-delay-600">
            <div className="text-4xl font-bold text-primary mb-2">10x</div>
            <p className="text-sm text-muted-foreground">Faster Processing</p>
          </div>
          <div className="animate-scale-in animation-delay-600">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <p className="text-sm text-muted-foreground">AI Processing</p>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate invoice processing and gain valuable insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">AI Data Extraction</h3>
            <p className="text-muted-foreground text-pretty">
              Advanced machine learning models automatically extract vendor names, amounts, dates, line items, and more
              from any invoice format.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Batch Processing</h3>
            <p className="text-muted-foreground text-pretty">
              Upload and process hundreds of invoices simultaneously. Save hours of manual work with intelligent bulk
              operations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Smart Integrations</h3>
            <p className="text-muted-foreground text-pretty">
              Seamlessly connect with QuickBooks, Xero, SAP, and other accounting platforms. Export data in any format
              you need.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Advanced Analytics</h3>
            <p className="text-muted-foreground text-pretty">
              Get real-time insights into spending patterns, vendor relationships, payment schedules, and cost trends
              with interactive dashboards.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Enterprise Security</h3>
            <p className="text-muted-foreground text-pretty">
              Bank-level encryption, SOC 2 compliance, and GDPR-ready data handling. Your sensitive financial data is
              always protected.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Developer API</h3>
            <p className="text-muted-foreground text-pretty">
              Build custom workflows with our RESTful API. Complete documentation, webhooks, and SDKs for popular
              languages.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From upload to export in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6 ai-glow animate-float">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
              1
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Upload Invoices</h3>
            <p className="text-muted-foreground text-pretty">
              Drag and drop your invoices or upload in bulk. We support PDF, PNG, JPG, and more. Process 1 to 1000+
              invoices at once.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-6 animate-float animation-delay-200">
              <Brain className="w-10 h-10 text-accent" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
              2
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">AI Processing</h3>
            <p className="text-muted-foreground text-pretty">
              Our AI extracts all relevant data with 99.5% accuracy. Review and edit results in real-time with
              confidence scores for each field.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6 ai-glow animate-float animation-delay-400">
              <Download className="w-10 h-10 text-primary" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
              3
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Export & Integrate</h3>
            <p className="text-muted-foreground text-pretty">
              Export to CSV, Excel, or JSON. Or sync directly with your accounting software via our integrations and
              API.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground mb-8">Choose the plan that fits your needs</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-accent">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground mb-6">Perfect for trying out INVOXIO</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">10 credits per month</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Basic AI extraction</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">CSV export</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Email support</span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="w-full block text-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-primary rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-primary/10 hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
              MOST POPULAR
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-foreground">${billingCycle === "monthly" ? "29" : "23"}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground mb-6">For growing businesses</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">500 credits per month</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Advanced AI extraction</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Batch processing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">All export formats</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Analytics dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">API access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Priority support</span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="w-full block text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold ai-glow"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-foreground">Custom</span>
            </div>
            <p className="text-muted-foreground mb-6">For large organizations</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Unlimited credits</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Custom AI training</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Custom integrations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">SLA guarantee</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">On-premise deployment</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">24/7 phone support</span>
              </li>
            </ul>

            <a
              href="mailto:sales@invoxio.com"
              className="w-full block text-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-12">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Built by Finance Professionals</h2>
            <p className="text-lg text-muted-foreground mb-6 text-pretty">
              "After spending years manually processing thousands of invoices, we knew there had to be a better way. We
              built INVOXIO to solve the exact pain points we experienced daily—tedious data entry, human errors, and
              hours wasted on repetitive tasks."
            </p>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              During our beta testing with 50+ businesses, we processed over 10,000 invoices and achieved 99.5%
              accuracy. Our users reported saving an average of 15 hours per week on invoice processing.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-accent" />
                <span>50+ Beta Testers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>15hrs Saved/Week</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span>10K+ Invoices Processed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Seamless Integrations</h2>
          <p className="text-xl text-muted-foreground">Connect with your favorite accounting software</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { name: "QuickBooks", color: "text-green-500" },
            { name: "Xero", color: "text-blue-500" },
            { name: "SAP", color: "text-blue-600" },
            { name: "Sage", color: "text-green-600" },
            { name: "NetSuite", color: "text-orange-500" },
            { name: "FreshBooks", color: "text-blue-400" },
            { name: "Zoho Books", color: "text-red-500" },
            { name: "Wave", color: "text-cyan-500" },
          ].map((integration) => (
            <div
              key={integration.name}
              className="bg-card border border-border rounded-xl p-6 flex items-center justify-center hover:border-primary/50 transition-colors"
            >
              <span className={`text-xl font-bold ${integration.color}`}>{integration.name}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Need a custom integration?</p>
          <a href="mailto:integrations@invoxio.com" className="text-primary hover:underline font-medium">
            Contact our integration team →
          </a>
        </div>
      </section>

      <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Everything you need to know about INVOXIO</p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "How do credits work?",
              answer:
                "Each invoice you process costs 1 credit. Credits renew automatically at the start of each billing cycle. Unused credits don't roll over, but you can upgrade your plan anytime for more credits.",
            },
            {
              question: "Is my data secure?",
              answer:
                "Absolutely. We use bank-level 256-bit encryption for all data in transit and at rest. We're SOC 2 compliant and GDPR-ready. Your invoice data is never shared with third parties and is automatically deleted after 30 days unless you choose to keep it longer.",
            },
            {
              question: "What's your accuracy rate?",
              answer:
                "Our AI achieves 99.5% accuracy on invoice data extraction. Each extracted field includes a confidence score, and you can review and edit any data before exporting. We continuously improve our models based on user feedback.",
            },
            {
              question: "Which file formats do you support?",
              answer:
                "We support PDF, PNG, JPG, JPEG, and TIFF files. Our AI can handle scanned documents, digital invoices, and even photos taken with your phone. Maximum file size is 10MB per invoice.",
            },
            {
              question: "Can I integrate with my accounting software?",
              answer:
                "Yes! We offer native integrations with QuickBooks, Xero, SAP, Sage, and other popular accounting platforms. You can also use our REST API to build custom integrations with any system.",
            },
            {
              question: "What happens if I run out of credits?",
              answer:
                "If you run out of credits before your renewal date, you can either upgrade to a higher plan or purchase additional credits as needed. We'll send you notifications when you're running low so you're never caught off guard.",
            },
            {
              question: "Do you offer refunds?",
              answer:
                "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with INVOXIO for any reason, contact our support team within 14 days of your purchase for a full refund.",
            },
            {
              question: "Can I cancel my subscription anytime?",
              answer:
                "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to your plan features until the end of your current billing period. No cancellation fees or hidden charges.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-foreground">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-muted-foreground text-pretty">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Invoice Processing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses saving time and money with AI-powered invoice automation
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-lg ai-glow flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="mailto:sales@invoxio.com"
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold text-lg"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Press Kit
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Partners
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    GDPR
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@invoxio.com"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    support@invoxio.com
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:sales@invoxio.com"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sales Inquiries
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Status Page
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/invoxio-logo.png" alt="INVOXIO" width={100} height={32} className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2025 INVOXIO. All rights reserved.</span>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Twitter className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Github className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
