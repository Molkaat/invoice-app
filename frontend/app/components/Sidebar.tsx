"use client"
import { Upload, FileText, BarChart3, Zap, Download, LogOut, CreditCard, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeView: "upload" | "analyze" | "dashboard" | "integrations"  // Add "integrations" here
  onViewChange: (view: "upload" | "analyze" | "dashboard" | "integrations") => void  // Add "integrations" here
  hasResults: boolean
  onExport?: () => void
}

export default function Sidebar({ activeView, onViewChange, hasResults, onExport }: SidebarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const navItems = [
    { id: "upload" as const, label: "Upload", icon: Upload, description: "Process invoices" },
    { id: "analyze" as const, label: "Analysis", icon: FileText, description: "Review results", disabled: !hasResults },
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: BarChart3,
      description: "View insights",
      disabled: !hasResults,
    },
    { id: "integrations" as const, label: "Integrations", icon: CreditCard, description: "Connect accounts" },  // Add this line
  ]

  const handleSignOut = () => {
    signOut()
    router.push("/welcome")
  }

  // Calculate days until renewal
  const daysUntilRenewal = user
    ? Math.ceil((user.subscriptionRenewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center ai-glow">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">InvoiceAI</h1>
            <p className="text-xs text-muted-foreground">Intelligent Processing</p>
          </div>
        </div>
      </div>

      {/* Credits Display */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-4 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Credits</span>
            </div>
            <div className="mb-3">
              <div className="text-3xl font-bold text-foreground mb-1">{user.credits}</div>
              <p className="text-xs text-muted-foreground">of {user.creditsLimit} remaining</p>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(user.credits / user.creditsLimit) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Renews in {daysUntilRenewal} days</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const isDisabled = item.disabled

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isDisabled
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-75 truncate">{item.description}</div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={onExport}
          disabled={!hasResults}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
            ${
              hasResults
                ? "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                : "text-muted-foreground cursor-not-allowed opacity-50"
            }
          `}
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Export Results</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
