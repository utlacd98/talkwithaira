"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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
  logout: () => void
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user is admin/owner (bypass payment)
    let role: "user" | "admin" | "owner" = "user"
    let plan: "free" | "plus" | "premium" = "premium" // TEMPORARY: All users get premium access during testing

    // Admin accounts - bypass payment
    if (email === "owner@aira.ai" || email === "admin1@aira.ai" || email === "admin2@aira.ai") {
      role = email === "owner@aira.ai" ? "owner" : "admin"
      plan = "premium" // Admins get premium access
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
      plan,
      role,
    }

    localStorage.setItem("aira_user", JSON.stringify(mockUser))
    setUser(mockUser)

    // Register user on server side
    try {
      await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mockUser.email,
          userId: mockUser.id,
          name: mockUser.name,
          plan: mockUser.plan,
        }),
      })
    } catch (err) {
      console.warn("[Auth] Failed to register user on server:", err)
    }

    router.push("/dashboard")
  }

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user is admin/owner (bypass payment)
    let role: "user" | "admin" | "owner" = "user"
    let plan: "free" | "plus" | "premium" = "premium" // TEMPORARY: All users get premium access during testing

    // Admin accounts - bypass payment
    if (email === "owner@aira.ai" || email === "admin1@aira.ai" || email === "admin2@aira.ai") {
      role = email === "owner@aira.ai" ? "owner" : "admin"
      plan = "premium" // Admins get premium access
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      plan,
      role,
    }

    localStorage.setItem("aira_user", JSON.stringify(mockUser))
    setUser(mockUser)

    // Register user on server side
    try {
      await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mockUser.email,
          userId: mockUser.id,
          name: mockUser.name,
          plan: mockUser.plan,
        }),
      })
    } catch (err) {
      console.warn("[Auth] Failed to register user on server:", err)
    }

    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("aira_user")
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
    <AuthContext.Provider value={{ user, login, signup, logout, updateSubscription, updateUserPlan, isLoading }}>
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
