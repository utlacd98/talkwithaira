"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { trackPricingViewed, trackPlanSelected, trackCheckoutStarted, trackError } from "@/lib/vercel-analytics"

const plans = [
  {
    name: "Free Plan",
    price: "£0",
    period: "forever",
    description: "Perfect for trying out Aira",
    features: [
      "5 messages/day",
      "Basic mood tracker",
      "Basic AI responses",
      "Mini games",
    ],
    cta: "Get Started",
    planId: "free",
    highlighted: false,
  },
  {
    name: "Aira Premium",
    price: "£2.99",
    period: "month",
    description: "Unlimited access to all premium features",
    features: [
      "Unlimited chats with Aira",
      "Advanced mood tracking & history",
      "Mood progress visualization",
      "AI-powered mood insights",
      "Personalized affirmations",
      "Support resources finder",
      "All mini games unlocked",
      "Dark mode",
      "Priority support",
      "Early access to new features",
      "Cancel anytime",
    ],
    cta: "Subscribe Now",
    planId: "premium",
    highlighted: true,
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // Track pricing page view
  useEffect(() => {
    trackPricingViewed()
  }, [])

  const handleSelectPlan = async (planId: string) => {
    // Track plan selection
    trackPlanSelected(planId as 'free' | 'plus' | 'premium')

    // If user not logged in, redirect to appropriate signup page
    if (!user) {
      if (planId === "premium") {
        router.push("/signup/premium")
      } else {
        router.push("/signup")
      }
      return
    }

    if (planId === "free") {
      router.push("/dashboard")
      return
    }

    // Admin/Owner bypass - no payment needed
    if (user.role === "admin" || user.role === "owner") {
      setLoading(planId)
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard?upgraded=true")
      return
    }

    // For Premium plan, redirect to Stripe Payment Link
    if (planId === "premium") {
      setLoading(planId)

      // Track checkout started
      trackCheckoutStarted('premium', 2.99)

      try {
        console.log("[Pricing] Creating Stripe checkout session for:", user.email)

        // Create a Stripe Checkout Session via API
        const response = await fetch("/api/stripe/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            userId: user.id,
            name: user.name,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create checkout session")
        }

        const { url } = await response.json()

        if (url) {
          console.log("[Pricing] Redirecting to Stripe checkout")
          window.location.href = url
        } else {
          throw new Error("No checkout URL returned")
        }
      } catch (error) {
        console.error("[Pricing] Checkout error:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to start checkout"
        trackError('checkout', errorMessage)
        alert(errorMessage + ". Please try again.")
        setLoading(null)
      }
      return
    }

    setLoading(planId)
    router.push(`/checkout?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your connection with Aira deepens
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.planId}
              className={`relative p-8 glass-card ${
                plan.highlighted ? "border-2 border-primary shadow-glow-primary scale-105" : "border border-border/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div>
                  <p className="text-2xl font-bold mb-2">{plan.name}</p>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.planId !== "free" && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.planId)}
                  disabled={loading === plan.planId || user?.plan === plan.planId}
                  className={`w-full ${
                    plan.highlighted ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {loading === plan.planId ? "Processing..." : user?.plan === plan.planId ? "Current Plan" : plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-lg">
              <p className="font-semibold mb-2">Can I cancel anytime?</p>
              <p className="text-muted-foreground text-sm">
                Yes! You can cancel your subscription anytime. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <p className="font-semibold mb-2">Is there a free trial?</p>
              <p className="text-muted-foreground text-sm">
                The Free plan gives you 5 messages per day - forever, with no credit card required. Try it out and upgrade when you're ready.
              </p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <p className="font-semibold mb-2">What payment methods do you accept?</p>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, debit cards, and digital payment methods through Stripe.
              </p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <p className="font-semibold mb-2">What happens if I cancel?</p>
              <p className="text-muted-foreground text-sm">
                You'll revert to the Free plan with 5 messages per day. Your conversation history stays safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
