"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { validateCredentials, registerNewUser } from "@/lib/auth-db"

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
    // Validate credentials against auth database
    const authUser = validateCredentials(email, password)

    if (!authUser) {
      throw new Error("Invalid email or password")
    }

    // Create user session
    const sessionUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: authUser.email,
      name: authUser.name,
      plan: authUser.plan,
      role: authUser.role,
    }

    localStorage.setItem("aira_user", JSON.stringify(sessionUser))
    setUser(sessionUser)

    // Register user on server side
    try {
      await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionUser.email,
          userId: sessionUser.id,
          name: sessionUser.name,
          plan: sessionUser.plan,
        }),
      })
    } catch (err) {
      console.warn("[Auth] Failed to register user on server:", err)
    }

    router.push("/dashboard")
  }

  const signup = async (email: string, password: string, name: string) => {
    // Validate password length
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    // Register new user in auth database
    const authUser = registerNewUser(email, password, name)

    if (!authUser) {
      throw new Error("Email already registered or invalid credentials")
    }

    // Create user session
    const sessionUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: authUser.email,
      name: authUser.name,
      plan: authUser.plan,
      role: authUser.role,
    }

    localStorage.setItem("aira_user", JSON.stringify(sessionUser))
    setUser(sessionUser)

    // Register user on server side
    try {
      await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionUser.email,
          userId: sessionUser.id,
          name: sessionUser.name,
          plan: sessionUser.plan,
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
