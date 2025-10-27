"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"

interface User {
  id: string
  email: string
  name: string
  plan: "free" | "plus" | "premium"
  role: "user" | "admin" | "owner"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateSubscription: (plan: "free" | "plus" | "premium") => void
  updateUserPlan: (plan: "free" | "plus" | "premium") => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("aira_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    console.log("[Auth Context] Attempting Supabase login for:", email)

    // Call Supabase login API
    const response = await fetch("/api/auth/supabase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Auth Context] Login failed:", error.error)
      throw new Error(error.error || "Invalid email or password")
    }

    const data = await response.json()
    const sessionUser: User = data.user

    console.log("[Auth Context] Supabase login successful for:", sessionUser.email)

    // Store user and session
    localStorage.setItem("aira_user", JSON.stringify(sessionUser))
    if (data.session) {
      localStorage.setItem("aira_session", JSON.stringify(data.session))
    }
    setUser(sessionUser)

    router.push("/dashboard")
  }

  const signup = async (email: string, password: string, name: string) => {
    // Validate password length
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    console.log("[Auth Context] Attempting Supabase signup for:", email)

    // Call Supabase signup API
    const response = await fetch("/api/auth/supabase-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Auth Context] Signup failed:", error.error)
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()
    const sessionUser: User = data.user

    console.log("[Auth Context] Supabase signup successful for:", sessionUser.email)

    // Store user and session
    localStorage.setItem("aira_user", JSON.stringify(sessionUser))
    if (data.session) {
      localStorage.setItem("aira_session", JSON.stringify(data.session))
    }
    setUser(sessionUser)

    router.push("/dashboard")
  }

  const signInWithGoogle = async () => {
    console.log("[Auth Context] Initiating Google Sign-In via Supabase")

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error("[Auth Context] Google Sign-In error:", error)
      throw new Error(error.message || "Google Sign-In failed")
    }

    console.log("[Auth Context] Google Sign-In initiated, redirecting...")
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    localStorage.removeItem("aira_user")
    localStorage.removeItem("aira_session")
    setUser(null)
    router.push("/")
  }

  const updateSubscription = (plan: "free" | "plus" | "premium") => {
    if (user) {
      const updatedUser = { ...user, plan }
      localStorage.setItem("aira_user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const updateUserPlan = (plan: "free" | "plus" | "premium") => {
    if (user) {
      const updatedUser = { ...user, plan }
      localStorage.setItem("aira_user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, updateSubscription, updateUserPlan, isLoading }}>
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
