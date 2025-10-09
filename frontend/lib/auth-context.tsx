"use client"
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  company_id: string
  company_name: string
  credits: number
  creditsUsed: number
  creditsLimit: number
  subscriptionRenewDate: Date
  token?: string // Add token to User interface
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  useCredit: () => boolean
  refreshCredits: () => void
  extractInvoice: (formData: FormData) => Promise<any> // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const hasCheckedRenewal = useRef(false)

  // Fix refreshCredits to not depend on user state
  const refreshCredits = () => {
    setUser(currentUser => {
      if (!currentUser) return currentUser

      const now = new Date()
      const renewDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      return {
        ...currentUser,
        credits: currentUser.creditsLimit,
        creditsUsed: 0,
        subscriptionRenewDate: renewDate,
      }
    })
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Convert date string back to Date object if it exists
        if (parsedUser.subscriptionRenewDate) {
          parsedUser.subscriptionRenewDate = new Date(parsedUser.subscriptionRenewDate)
        } else {
          // Set default renewal date for new backend users
          const now = new Date()
          parsedUser.subscriptionRenewDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        }
        
        // Set default credits if not present (for backward compatibility)
        if (!parsedUser.credits) {
          parsedUser.credits = 100
          parsedUser.creditsUsed = 0
          parsedUser.creditsLimit = 100
        }
        
        parsedUser.token = token // Add token to user object
        setUser(parsedUser)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
  }, [])

  // Check credit renewal only once when user first loads
  useEffect(() => {
    if (user && user.subscriptionRenewDate && !hasCheckedRenewal.current) {
      const now = new Date()
      if (now >= user.subscriptionRenewDate) {
        hasCheckedRenewal.current = true
        refreshCredits()
      }
    }
  }, [user])

  // Reset the renewal check flag when user logs out
  useEffect(() => {
    if (!user) {
      hasCheckedRenewal.current = false
    }
  }, [user])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user_data", JSON.stringify(user))
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8000/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Sign in failed')
    }

    const { user: backendUser, token } = await response.json()
    
    // Store token
    localStorage.setItem('auth_token', token)
    
    // Set up user data with credit system
    const now = new Date()
    const renewDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    
    const userData: User = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name,
      role: backendUser.role,
      company_id: backendUser.company_id,
      company_name: backendUser.company_name,
      credits: 100, // Default credits for new users
      creditsUsed: 0,
      creditsLimit: 100,
      subscriptionRenewDate: renewDate,
      token, // Add token to user data
    }

    setUser(userData)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, full_name: name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Sign up failed')
    }

    const { user: backendUser, token } = await response.json()
    
    // Store token
    localStorage.setItem('auth_token', token)
    
    // Set up user data with credit system
    const now = new Date()
    const renewDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    
    const userData: User = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name,
      role: backendUser.role,
      company_id: backendUser.company_id,
      company_name: backendUser.company_name,
      credits: 100, // Default credits for new users
      creditsUsed: 0,
      creditsLimit: 100,
      subscriptionRenewDate: renewDate,
      token, // Add token to user data
    }

    setUser(userData)
  }

  const signOut = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  const useCredit = (): boolean => {
    let success = false
    
    setUser(currentUser => {
      if (!currentUser || currentUser.credits <= 0) {
        success = false
        return currentUser
      }

      success = true
      return {
        ...currentUser,
        credits: currentUser.credits - 1,
        creditsUsed: currentUser.creditsUsed + 1,
      }
    })
    
    return success
  }

  const extractInvoice = async (formData: FormData) => {
    if (!user?.token) {
      throw new Error("User is not authenticated")
    }

    const response = await fetch("http://localhost:8000/extract-invoice/", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${user?.token}`, // Add this line
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Invoice extraction failed')
    }

    return await response.json()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        useCredit,
        refreshCredits,
        extractInvoice, // Add this line
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
