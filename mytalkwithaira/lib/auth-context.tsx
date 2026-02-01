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
  signup: (email: string, password: string, name: string, plan?: "free" | "plus" | "premium") => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateSubscription: (plan: "free" | "plus" | "premium") => void
  updateUserPlan: (plan: "free" | "plus" | "premium") => void
  refreshUserPlan: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log("[Auth Context] Server-side render, skipping")
      setIsLoading(false)
      return
    }

    console.log("[Auth Context] Initializing auth on client-side")
    const supabase = createClient()

    // Check for active Supabase session and stored user on mount
    const initializeAuth = async () => {
      try {
        console.log("[Auth Context] Getting session from Supabase...")
        const { data: { session } } = await supabase.auth.getSession()
        console.log("[Auth Context] Session result:", session ? `Found for ${session.user?.email}` : "No session")

        if (session?.user) {
          // User is authenticated via Supabase
          console.log("[Auth Context] ✅ Found active Supabase session for:", session.user.email)

          // Fetch the user's plan from Redis
          let userPlan: "free" | "plus" | "premium" = "free"
          try {
            const planResponse = await fetch(`/api/user/plan?email=${encodeURIComponent(session.user.email || "")}`)
            const planData = await planResponse.json()

            // If user not found in Redis, register them
            if (!planData.found) {
              console.log("[Auth Context] User not found in Redis, registering...")
              await fetch("/api/auth/register-oauth-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
                }),
              })
              // After registration, default to free plan
              userPlan = "free"
            } else {
              userPlan = planData.plan || "free"
            }

            console.log("[Auth Context] User plan:", userPlan)
          } catch (planError) {
            console.warn("[Auth Context] Could not fetch plan, using default:", planError)
          }

          const sessionUser: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            plan: userPlan,
            role: "user",
          }

          // Store in localStorage for quick access
          if (typeof window !== 'undefined') {
            localStorage.setItem("aira_user", JSON.stringify(sessionUser))
            localStorage.setItem("aira_session", JSON.stringify(session))
          }
          setUser(sessionUser)
          console.log("[Auth Context] ✅ User set in context:", sessionUser.email)
        } else {
          console.log("[Auth Context] No active session, checking localStorage...")
          // Check for stored user in localStorage
          if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem("aira_user")
            if (storedUser) {
              console.log("[Auth Context] Found stored user in localStorage")
              const parsedUser = JSON.parse(storedUser)

              // Refresh plan from Redis if user exists
              if (parsedUser.email) {
                try {
                  const planResponse = await fetch(`/api/user/plan?email=${encodeURIComponent(parsedUser.email)}`)
                  const planData = await planResponse.json()
                  parsedUser.plan = planData.plan || "free"
                  console.log("[Auth Context] Refreshed plan from Redis:", parsedUser.plan)
                  localStorage.setItem("aira_user", JSON.stringify(parsedUser))
                } catch (planError) {
                  console.warn("[Auth Context] Could not refresh plan:", planError)
                }
              }

              setUser(parsedUser)
            }
          }
        }
      } catch (error) {
        console.error("[Auth Context] Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth Context] Auth state changed:", event)

      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch the user's plan from Redis
        let userPlan: "free" | "plus" | "premium" = "free"
        try {
          const planResponse = await fetch(`/api/user/plan?email=${encodeURIComponent(session.user.email || "")}`)
          const planData = await planResponse.json()
          userPlan = planData.plan || "free"
          console.log("[Auth Context] Fetched user plan on sign in:", userPlan)
        } catch (planError) {
          console.warn("[Auth Context] Could not fetch plan on sign in:", planError)
        }

        const sessionUser: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
          plan: userPlan,
          role: "user",
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem("aira_user", JSON.stringify(sessionUser))
          localStorage.setItem("aira_session", JSON.stringify(session))
        }
        setUser(sessionUser)
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("aira_user")
          localStorage.removeItem("aira_session")
        }
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem("aira_user", JSON.stringify(sessionUser))
      if (data.session) {
        localStorage.setItem("aira_session", JSON.stringify(data.session))
      }
    }
    setUser(sessionUser)

    // Track user activity
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sessionUser.id, event: "login" }),
      })
    } catch (error) {
      console.warn("[Auth Context] Failed to track login:", error)
    }

    router.push("/dashboard")
  }

  const signup = async (email: string, password: string, name: string, plan: "free" | "plus" | "premium" = "free") => {
    // Validate password length
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    console.log("[Auth Context] Attempting Supabase signup for:", email, "with plan:", plan)

    // Call Supabase signup API
    const response = await fetch("/api/auth/supabase-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, plan }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Auth Context] Signup failed:", error.error)
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()

    // Check if email confirmation is required
    if (data.requiresConfirmation) {
      console.log("[Auth Context] Email confirmation required")
      throw new Error("Please check your email to confirm your account before signing in")
    }

    const sessionUser: User = data.user

    console.log("[Auth Context] Supabase signup successful for:", sessionUser.email)

    // Track new signup
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sessionUser.id, event: "signup", plan }),
      })
    } catch (error) {
      console.warn("[Auth Context] Failed to track signup:", error)
    }

    // Store user and session
    if (typeof window !== 'undefined') {
      localStorage.setItem("aira_user", JSON.stringify(sessionUser))
      if (data.session) {
        localStorage.setItem("aira_session", JSON.stringify(data.session))
      }
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

    if (typeof window !== 'undefined') {
      localStorage.removeItem("aira_user")
      localStorage.removeItem("aira_session")
    }
    setUser(null)
    router.push("/")
  }

  const updateSubscription = (plan: "free" | "plus" | "premium") => {
    if (user) {
      const updatedUser = { ...user, plan }
      if (typeof window !== 'undefined') {
        localStorage.setItem("aira_user", JSON.stringify(updatedUser))
      }
      setUser(updatedUser)
    }
  }

  const updateUserPlan = (plan: "free" | "plus" | "premium") => {
    if (user) {
      const updatedUser = { ...user, plan }
      if (typeof window !== 'undefined') {
        localStorage.setItem("aira_user", JSON.stringify(updatedUser))
      }
      setUser(updatedUser)
    }
  }

  const refreshUserPlan = async () => {
    if (!user?.email) {
      console.warn("[Auth Context] Cannot refresh plan - no user email")
      return
    }

    try {
      console.log("[Auth Context] Refreshing user plan from Redis for:", user.email)
      console.log("[Auth Context] Current plan:", user.plan)

      const planResponse = await fetch(`/api/user/plan?email=${encodeURIComponent(user.email)}`)
      console.log("[Auth Context] Plan API response status:", planResponse.status)

      const planData = await planResponse.json()
      console.log("[Auth Context] Plan API response data:", planData)

      const newPlan = planData.plan || "free"
      console.log("[Auth Context] New plan from Redis:", newPlan)

      const updatedUser = { ...user, plan: newPlan }
      if (typeof window !== 'undefined') {
        localStorage.setItem("aira_user", JSON.stringify(updatedUser))
        console.log("[Auth Context] Updated localStorage with new plan")
      }
      setUser(updatedUser)
      console.log("[Auth Context] Updated user state with new plan:", newPlan)
    } catch (error) {
      console.error("[Auth Context] Error refreshing plan:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, updateSubscription, updateUserPlan, refreshUserPlan, isLoading }}>
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
