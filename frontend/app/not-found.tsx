import Link from "next/link"
import Image from "next/image"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center animate-fade-in-up">
        <Link href="/welcome" className="inline-flex items-center justify-center gap-3 mb-8">
          <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/welcome"
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold ai-glow flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Need help? Here are some useful links:</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/welcome#features" className="text-primary hover:underline">
              Features
            </Link>
            <Link href="/welcome#pricing" className="text-primary hover:underline">
              Pricing
            </Link>
            <Link href="/welcome#faq" className="text-primary hover:underline">
              FAQ
            </Link>
            <a href="mailto:support@invoxio.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
