"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

const plans = [
  {
    name: "Free Plan",
    priceMonthly: "£0",
    priceYearly: "–",
    period: "forever",
    description: "Perfect for trying out Aira",
    features: [
      "10 chats/day",
      "Mood tracker (manual)",
      "Basic responses",
    ],
    cta: "Get Started",
    planId: "free",
    highlighted: false,
  },
  {
    name: "Aira Plus",
    priceMonthly: "£4.99",
    priceYearly: "£49.99/yr",
    yearlyDiscount: "save 15%",
    period: "per month",
    description: "Everyday users & journaling fans",
    features: [
      "Unlimited chats",
      "Advanced mood tracking & history",
      "Mood progress visualization",
      "Dark mode",
      "Reflection & gratitude prompts",
    ],
    cta: "Upgrade to Plus",
    planId: "plus",
    highlighted: true,
  },
  {
    name: "Aira Premium",
    priceMonthly: "£8.99",
    priceYearly: "£89.99/yr",
    yearlyDiscount: "save 20%",
    period: "per month",
    description: "Advanced features & priority support",
    features: [
      "Everything in Plus",
      "Advanced mood insights (AI analysis)",
      "Personalized affirmations",
      "Multi-language chat",
      "Priority support",
      "Early access to new Aira features",
    ],
    cta: "Upgrade to Premium",
    planId: "premium",
    highlighted: false,
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      router.push("/signup")
      return
    }

    if (planId === "free") {
      router.push("/dashboard")
      return
    }

    // For paid plans, redirect to Lemonsqueezy checkout
    if (planId === "plus") {
      const productId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PLUS
      localStorage.setItem("pending_plan_upgrade", "plus")
      const checkoutUrl = `https://talkwithaira.lemonsqueezy.com/buy/${productId}?checkout[email]=${encodeURIComponent(user.email)}&checkout[name]=${encodeURIComponent(user.name || "")}`
      window.location.href = checkoutUrl
      return
    }

    if (planId === "premium") {
      const productId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PREMIUM
      localStorage.setItem("pending_plan_upgrade", "premium")
      const checkoutUrl = `https://talkwithaira.lemonsqueezy.com/buy/${productId}?checkout[email]=${encodeURIComponent(user.email)}&checkout[name]=${encodeURIComponent(user.name || "")}`
      window.location.href = checkoutUrl
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

    setLoading(planId)
    // Redirect to Stripe checkout
    router.push(`/checkout?plan=${planId}&billing=${billingPeriod}`)
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

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly}
                  </span>
                  {plan.planId !== "free" && (
                    <>
                      <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                      {billingPeriod === "yearly" && plan.yearlyDiscount && (
                        <span className="text-xs font-semibold text-accent ml-2">({plan.yearlyDiscount})</span>
                      )}
                    </>
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
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm">
                The Free plan is available forever with no credit card required. Upgrade when you're ready.
              </p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, debit cards, and digital payment methods through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
