import Link from "next/link"
import Image from "next/image"

export default function CookiePolicyPage() {
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
        <h1 className="text-5xl font-bold text-foreground mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 7, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">1. What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              INVOXIO uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Essential Cookies:</strong> Required for the website to function
                properly, including authentication and security
              </li>
              <li>
                <strong className="text-foreground">Performance Cookies:</strong> Help us understand how visitors
                interact with our website by collecting anonymous information
              </li>
              <li>
                <strong className="text-foreground">Functionality Cookies:</strong> Remember your preferences and
                settings to provide enhanced features
              </li>
              <li>
                <strong className="text-foreground">Analytics Cookies:</strong> Help us improve our service by analyzing
                usage patterns
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Session Cookies</h3>
                <p className="text-muted-foreground">
                  Temporary cookies that expire when you close your browser. Used for authentication and maintaining
                  your session.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Persistent Cookies</h3>
                <p className="text-muted-foreground">
                  Remain on your device for a set period or until you delete them. Used to remember your preferences and
                  settings.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Third-Party Cookies</h3>
                <p className="text-muted-foreground">
                  Set by third-party services we use, such as analytics providers. These help us understand how our
                  service is being used.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">4. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Browser Settings:</strong> Most browsers allow you to refuse or
                accept cookies through their settings
              </li>
              <li>
                <strong className="text-foreground">Delete Cookies:</strong> You can delete cookies that have already
                been set
              </li>
              <li>
                <strong className="text-foreground">Third-Party Tools:</strong> Use browser extensions or privacy tools
                to manage cookies
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please note that blocking or deleting cookies may impact your experience on INVOXIO and some features may
              not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">5. Cookie List</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Cookie Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Purpose</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">invoiceai_session</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Authentication and session management</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">invoiceai_remember</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Remember login preference</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">30 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">invoiceai_preferences</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Store user preferences and settings</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">_ga</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Google Analytics tracking</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new
              policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us at{" "}
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
