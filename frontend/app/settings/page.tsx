"use client"
import { useState } from "react"
import type React from "react"

import { User, Lock, CreditCard, Trash2, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Tab = "profile" | "security" | "billing" | "account"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  // Profile state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)
  const [securityError, setSecurityError] = useState("")

  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setProfileSuccess(true)
    setProfileLoading(false)

    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityError("")

    if (newPassword.length < 6) {
      setSecurityError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match")
      return
    }

    setSecurityLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSecuritySuccess(true)
    setSecurityLoading(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setTimeout(() => setSecuritySuccess(false), 3000)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return
    }

    setDeleteLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    signOut()
    router.push("/welcome")
  }

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "security" as Tab, label: "Security", icon: Lock },
    { id: "billing" as Tab, label: "Billing", icon: CreditCard },
    { id: "account" as Tab, label: "Account", icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/invoxio-logo.png" alt="INVOXIO" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-2xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>

                {profileSuccess && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <p className="text-sm text-accent">Profile updated successfully!</p>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Changing your email will require verification</p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all font-semibold flex items-center gap-2"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-card border border-border rounded-2xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Security Settings</h2>

                {securitySuccess && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <p className="text-sm text-accent">Password changed successfully!</p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {securityError && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{securityError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={securityLoading}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all font-semibold flex items-center gap-2"
                  >
                    {securityLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="bg-card border border-border rounded-2xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Billing & Subscription</h2>

                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
                        <p className="text-sm text-muted-foreground">Free Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">$0</p>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Mail className="w-4 h-4" />
                      <span>10 credits per month</span>
                    </div>
                    <Link
                      href="/welcome#pricing"
                      className="w-full block text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold"
                    >
                      Upgrade Plan
                    </Link>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Usage This Month</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Credits Used</span>
                        <span className="text-sm font-medium text-foreground">
                          {user?.creditsUsed || 0} / {user?.creditsLimit || 100}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${((user?.creditsUsed || 0) / (user?.creditsLimit || 100)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
                    <p className="text-sm text-muted-foreground mb-4">No payment method on file</p>
                    <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-semibold">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-card border border-border rounded-2xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Delete Account</h2>

                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-2">Warning: This action cannot be undone</h3>
                      <p className="text-sm text-destructive/80">
                        Deleting your account will permanently remove all your data, including:
                      </p>
                      <ul className="list-disc list-inside text-sm text-destructive/80 mt-2 space-y-1">
                        <li>All processed invoices and analysis results</li>
                        <li>Your account settings and preferences</li>
                        <li>Billing history and subscription information</li>
                        <li>API keys and integration settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="deleteConfirm" className="text-sm font-medium text-foreground">
                      Type <span className="font-mono font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE" || deleteLoading}
                    className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete My Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
