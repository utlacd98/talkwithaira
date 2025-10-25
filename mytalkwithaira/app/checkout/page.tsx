"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Lock, ArrowLeft, Loader2 } from "lucide-react"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = searchParams.get("plan")
  const billing = searchParams.get("billing") || "monthly"
  const planDetails = {
    plus: {
      name: "Aira Plus",
      priceMonthly: "£4.99",
      priceYearly: "£49.99",
      billingMonthly: "/month",
      billingYearly: "/year",
    },
    premium: {
      name: "Aira Premium",
      priceMonthly: "£8.99",
      priceYearly: "£89.99",
      billingMonthly: "/month",
      billingYearly: "/year",
    },
  }

  const currentPlan = plan && (plan === "plus" || plan === "premium") ? planDetails[plan] : null
  const displayPrice = billing === "yearly" ? currentPlan?.priceYearly : currentPlan?.priceMonthly
  const displayBilling = billing === "yearly" ? currentPlan?.billingYearly : currentPlan?.billingMonthly

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
    if (!plan || !currentPlan) {
      router.push("/pricing")
    }
  }, [user, plan, currentPlan, router])

  const handleCheckout = () => {
    if (!user || !plan) return

    setLoading(true)
    setError(null)

    try {
      // Get the Lemonsqueezy product ID based on plan
      const productId =
        plan === "plus"
          ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PLUS
          : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PREMIUM

      if (!productId) {
        throw new Error("Product not configured")
      }

      console.log("[Checkout] Redirecting to Lemonsqueezy for plan:", plan, "Product:", productId)

      // Store the plan upgrade in localStorage before redirecting
      localStorage.setItem("pending_plan_upgrade", plan)

      // Redirect to Lemonsqueezy checkout with pre-filled email and name
      const checkoutUrl = `https://talkwithaira.lemonsqueezy.com/buy/${productId}?checkout[email]=${encodeURIComponent(user.email)}&checkout[name]=${encodeURIComponent(user.name || "")}`
      window.location.href = checkoutUrl
    } catch (err) {
      console.error("[Checkout] Error:", err)
      setError(err instanceof Error ? err.message : "Checkout failed")
      setLoading(false)
    }
  }

  if (!currentPlan) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" onClick={() => router.push("/pricing")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Button>

        <Card className="glass-card p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
              <p className="text-muted-foreground">
                Upgrade to {currentPlan.name} for {displayPrice}{displayBilling}
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-muted/30 rounded-lg p-6 space-y-3">
              <h2 className="font-semibold text-lg">Order Summary</h2>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{currentPlan.name} Plan</span>
                <span className="font-semibold">{displayPrice}{displayBilling}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold">Total due today</span>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {displayPrice}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${displayPrice} with Stripe`
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secured by Stripe. Your payment info is encrypted.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
