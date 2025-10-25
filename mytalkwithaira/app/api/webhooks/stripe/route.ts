/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for subscription updates
 */

import { NextRequest, NextResponse } from "next/server"
import { updatePlan } from "@/lib/redis"

// Map Stripe product IDs to plan names
// You'll need to set these in your environment variables
const STRIPE_PRODUCT_MAP: Record<string, "Free" | "Plus" | "Premium"> = {
  [process.env.STRIPE_PRODUCT_PLUS || ""]: "Plus",
  [process.env.STRIPE_PRODUCT_PREMIUM || ""]: "Premium",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event = body

    console.log("[Stripe Webhook] Received event:", event.type)

    // Handle subscription events
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object
      const customerId = subscription.customer
      const productId = subscription.items?.data?.[0]?.price?.product

      // Get user ID from customer metadata
      // You'll need to store user ID in Stripe customer metadata
      const userId = subscription.metadata?.user_id

      if (!userId) {
        console.warn("[Stripe Webhook] No user_id in subscription metadata")
        return NextResponse.json({ received: true })
      }

      const plan = STRIPE_PRODUCT_MAP[productId] || "Free"

      console.log("[Stripe Webhook] Updating plan for user:", userId, "Plan:", plan)
      await updatePlan(userId, plan)

      return NextResponse.json({ received: true })
    }

    // Handle subscription deletion (downgrade to Free)
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object
      const userId = subscription.metadata?.user_id

      if (!userId) {
        console.warn("[Stripe Webhook] No user_id in subscription metadata")
        return NextResponse.json({ received: true })
      }

      console.log("[Stripe Webhook] Downgrading user to Free:", userId)
      await updatePlan(userId, "Free")

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

