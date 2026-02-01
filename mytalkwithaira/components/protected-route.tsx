"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("[Protected Route] Auth state:", { isLoading, hasUser: !!user, userEmail: user?.email })

    if (!isLoading && !user) {
      console.log("[Protected Route] ❌ No user found, redirecting to /login")
      router.push("/login")
    } else if (!isLoading && user) {
      console.log("[Protected Route] ✅ User authenticated, showing protected content")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    console.log("[Protected Route] Loading...")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    console.log("[Protected Route] No user, returning null")
    return null
  }

  console.log("[Protected Route] Rendering children for user:", user.email)
  return <>{children}</>
}
