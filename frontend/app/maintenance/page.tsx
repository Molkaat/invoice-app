import Link from "next/link"
import Image from "next/image"
import { Wrench, Clock, Twitter, Linkedin } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center animate-fade-in-up">
        <Link href="/welcome" className="inline-flex items-center justify-center gap-3 mb-8">
          <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Wrench className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Under Maintenance</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto mb-6">
            We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Estimated Downtime</p>
            </div>
            <p className="text-2xl font-bold text-primary">2 hours</p>
            <p className="text-sm text-muted-foreground mt-2">Expected completion: 3:00 PM EST</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Stay updated on our progress:</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="#"
                className="w-12 h-12 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Need immediate assistance?</p>
            <a
              href="mailto:support@invoxio.com"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Contact Emergency Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
