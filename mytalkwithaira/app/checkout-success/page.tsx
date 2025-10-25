"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { user, updateUserPlan } = useAuth()
  const [status, setStatus] = useState<"success" | "redirecting">("success")

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        console.log("[CheckoutSuccess] Payment successful!")

        // Get the plan from localStorage (it was set during checkout)
        const pendingPlan = localStorage.getItem("pending_plan_upgrade")

        if (pendingPlan) {
          console.log("[CheckoutSuccess] Upgrading user to plan:", pendingPlan)
          updateUserPlan(pendingPlan as "plus" | "premium")
          localStorage.removeItem("pending_plan_upgrade")
        }

        setStatus("redirecting")

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard?upgraded=true")
        }, 2000)
      } catch (error) {
        console.error("[CheckoutSuccess] Error:", error)
        setTimeout(() => router.push("/dashboard"), 2000)
      }
    }

    handleSuccess()
  }, [router, updateUserPlan])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful! 🎉</h1>
        <p className="text-muted-foreground mb-4">Your subscription has been activated.</p>
        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}

