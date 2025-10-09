import Link from "next/link"
import Image from "next/image"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-3">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <Link
            href="/welcome"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 7, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using INVOXIO, you agree to be bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily use INVOXIO for personal or commercial invoice processing purposes.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without a paid subscription</li>
              <li>Attempt to reverse engineer any software contained in INVOXIO</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">3. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              INVOXIO provides AI-powered invoice processing services. We use machine learning models to extract data
              from invoices with high accuracy. While we strive for 99.5% accuracy, we cannot guarantee 100% accuracy
              and users are responsible for verifying extracted data before use.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">4. Account Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">To use INVOXIO, you must:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Be at least 18 years old or have parental consent</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activity under your account</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid subscriptions are billed in advance on a monthly or annual basis. Credits renew at the start of each
              billing cycle and do not roll over. You can cancel your subscription at any time, and you will continue to
              have access until the end of your current billing period. We offer a 14-day money-back guarantee on all
              paid plans.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Upload malicious files or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service to process illegal or fraudulent documents</li>
              <li>Abuse or overload our systems</li>
              <li>Share your account with others</li>
              <li>Resell or redistribute our services without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service and its original content, features, and functionality are owned by INVOXIO and are protected
              by international copyright, trademark, patent, trade secret, and other intellectual property laws. You
              retain all rights to the invoices and data you upload.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              INVOXIO shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the service. Our total liability shall not exceed the
              amount you paid us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms
              of Service. Upon termination, your right to use the service will immediately cease, and we may delete your
              data after 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via
              email. Your continued use of the service after such modifications constitutes your acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about the Terms of Service should be sent to{" "}
              <a href="mailto:legal@invoxio.com" className="text-primary hover:underline">
                legal@invoxio.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
