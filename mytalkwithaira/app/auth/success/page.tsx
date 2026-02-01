"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Sparkles } from "lucide-react"

export default function AuthSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking")

  useEffect(() => {
    let attemptCount = 0
    let intervalId: NodeJS.Timeout

    const checkSession = async () => {
      try {
        console.log(`[Auth Success] Checking session (attempt ${attemptCount + 1})`)
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[Auth Success] Error getting session:", error)
          attemptCount++

          if (attemptCount >= 10) {
            console.error("[Auth Success] Max attempts reached, redirecting to login")
            clearInterval(intervalId)
            setStatus("error")
            setTimeout(() => router.push("/login"), 2000)
          }
          return
        }

        if (session?.user) {
          console.log("[Auth Success] ✅ Session found for:", session.user.email)
          clearInterval(intervalId)
          setStatus("success")

          // Redirect to dashboard immediately
          router.push("/dashboard")
        } else {
          console.log("[Auth Success] No session yet, will retry...")
          attemptCount++

          if (attemptCount >= 10) {
            console.error("[Auth Success] Max attempts reached, redirecting to login")
            clearInterval(intervalId)
            setStatus("error")
            setTimeout(() => router.push("/login"), 2000)
          }
        }
      } catch (err) {
        console.error("[Auth Success] Error:", err)
        clearInterval(intervalId)
        setStatus("error")
        setTimeout(() => router.push("/login"), 2000)
      }
    }

    // Check immediately
    checkSession()

    // Then check every 500ms
    intervalId = setInterval(checkSession, 500)

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {status === "checking" && (
            <>
              <h1 className="text-2xl font-bold font-heading">Signing you in...</h1>
              <p className="text-muted-foreground">
                Setting up your account
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold font-heading text-green-600">Success!</h1>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
              <div className="flex justify-center">
                <div className="animate-pulse text-4xl">✓</div>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold font-heading text-destructive">Something went wrong</h1>
              <p className="text-muted-foreground">
                Redirecting back to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

