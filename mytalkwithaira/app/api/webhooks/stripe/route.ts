/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for subscription updates
 */

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { updatePlan } from "@/lib/redis"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Map Stripe product IDs to plan names
// You'll need to set these in your environment variables
const STRIPE_PRODUCT_MAP: Record<string, "Free" | "Plus" | "Premium"> = {
  [process.env.STRIPE_PRODUCT_PLUS || ""]: "Plus",
  [process.env.STRIPE_PRODUCT_PREMIUM || ""]: "Premium",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      console.error("[Stripe Webhook] No signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("[Stripe Webhook] No webhook secret configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("[Stripe Webhook] Received event:", event.type)

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const userId = session.metadata?.user_id

      if (!userId) {
        console.warn("[Stripe Webhook] No user_id in checkout session metadata")
        return NextResponse.json({ received: true })
      }

      // Get the subscription from the session
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const productId = subscription.items?.data?.[0]?.price?.product as string
          const plan = STRIPE_PRODUCT_MAP[productId] || "Free"

          console.log("[Stripe Webhook] Checkout completed - Updating plan for user:", userId, "Plan:", plan)
          await updatePlan(userId, plan)
        } catch (err) {
          console.error("[Stripe Webhook] Error retrieving subscription:", err)
        }
      }

      return NextResponse.json({ received: true })
    }

    // Handle payment intent succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object
      const userId = paymentIntent.metadata?.user_id

      if (!userId) {
        console.warn("[Stripe Webhook] No user_id in payment intent metadata")
        return NextResponse.json({ received: true })
      }

      console.log("[Stripe Webhook] Payment succeeded for user:", userId)

      // If this is a subscription payment, the subscription events will handle the plan update
      // This event is mainly for logging and confirmation

      return NextResponse.json({ received: true })
    }

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

// Configure for webhook signature verification
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

