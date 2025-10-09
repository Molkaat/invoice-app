import Link from "next/link"
import Image from "next/image"

export default function PrivacyPolicyPage() {
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
        <h1 className="text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 7, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to INVOXIO. We respect your privacy and are committed to protecting your personal data. This
              privacy policy will inform you about how we look after your personal data when you visit our website and
              use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">2. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of personal data about you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Identity Data: name, username, or similar identifier</li>
              <li>Contact Data: email address and telephone numbers</li>
              <li>Financial Data: payment card details and billing information</li>
              <li>Transaction Data: details about payments and services you have purchased</li>
              <li>Technical Data: IP address, browser type, device information</li>
              <li>Usage Data: information about how you use our website and services</li>
              <li>Invoice Data: documents and data you upload for processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">3. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal
              data in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our service</li>
              <li>To process your invoices using AI technology</li>
              <li>To manage your account and subscription</li>
              <li>To communicate with you about service updates</li>
              <li>To improve our services and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally
              lost, used or accessed in an unauthorized way, altered or disclosed. We use bank-level 256-bit encryption
              for all data in transit and at rest. We are SOC 2 compliant and follow GDPR guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it
              for. Invoice data is automatically deleted after 30 days unless you choose to keep it longer. Account data
              is retained until you delete your account.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">6. Your Legal Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may share your data with trusted third-party service providers who assist us in operating our website,
              conducting our business, or servicing you. These parties are obligated to keep your information
              confidential and use it only for the purposes we specify.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please contact us at{" "}
              <a href="mailto:privacy@invoxio.com" className="text-primary hover:underline">
                privacy@invoxio.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
