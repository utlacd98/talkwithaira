/**
 * POST /api/webhooks/lemonsqueezy
 * Handles Lemonsqueezy webhook events for subscription updates
 */

import { NextRequest, NextResponse } from "next/server"
import { updateUserPlanByEmail } from "@/lib/user-profile-registry"
import crypto from "crypto"

// Map Lemonsqueezy product IDs to plan names
const LEMONSQUEEZY_PRODUCT_MAP: Record<string, "plus" | "premium"> = {
  [process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PLUS || ""]: "plus",
  [process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PREMIUM || ""]: "premium",
}

// Verify Lemonsqueezy webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Lemonsqueezy uses HMAC-SHA256 for signing
  // The secret should be from your Lemonsqueezy webhook settings
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ""
  
  if (!secret) {
    console.warn("[Lemonsqueezy Webhook] No webhook secret configured")
    return false
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-signature") || ""
    const body = await req.text()

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.warn("[Lemonsqueezy Webhook] Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("[Lemonsqueezy Webhook] Received event:", event.meta?.event_name)

    // Handle order.created event (new subscription/purchase)
    if (event.meta?.event_name === "order.created") {
      const order = event.data
      const productId = order.product_id?.toString()
      const customerEmail = order.customer_email

      if (!productId || !customerEmail) {
        console.warn("[Lemonsqueezy Webhook] Missing product_id or customer_email")
        return NextResponse.json({ received: true })
      }

      const plan = LEMONSQUEEZY_PRODUCT_MAP[productId]
      if (!plan) {
        console.warn("[Lemonsqueezy Webhook] Unknown product ID:", productId)
        return NextResponse.json({ received: true })
      }

      console.log("[Lemonsqueezy Webhook] Processing order for email:", customerEmail, "Plan:", plan)

      // Update user plan by email
      const updated = await updateUserPlanByEmail(customerEmail, plan)
      if (!updated) {
        console.warn("[Lemonsqueezy Webhook] Could not find user with email:", customerEmail)
      }

      return NextResponse.json({ received: true })
    }

    // Handle subscription.updated event
    if (event.meta?.event_name === "subscription.updated") {
      const subscription = event.data
      const productId = subscription.product_id?.toString()
      const customerEmail = subscription.customer_email

      if (!productId || !customerEmail) {
        console.warn("[Lemonsqueezy Webhook] Missing product_id or customer_email")
        return NextResponse.json({ received: true })
      }

      const plan = LEMONSQUEEZY_PRODUCT_MAP[productId]
      if (!plan) {
        console.warn("[Lemonsqueezy Webhook] Unknown product ID:", productId)
        return NextResponse.json({ received: true })
      }

      console.log("[Lemonsqueezy Webhook] Updating subscription for email:", customerEmail, "Plan:", plan)

      // Update user plan by email
      const updated = await updateUserPlanByEmail(customerEmail, plan)
      if (!updated) {
        console.warn("[Lemonsqueezy Webhook] Could not find user with email:", customerEmail)
      }

      return NextResponse.json({ received: true })
    }

    // Handle subscription.cancelled event (downgrade to Free)
    if (event.meta?.event_name === "subscription.cancelled") {
      const subscription = event.data
      const customerEmail = subscription.customer_email

      if (!customerEmail) {
        console.warn("[Lemonsqueezy Webhook] Missing customer_email")
        return NextResponse.json({ received: true })
      }

      console.log("[Lemonsqueezy Webhook] Cancelling subscription for email:", customerEmail)

      // Downgrade user to free plan
      const updated = await updateUserPlanByEmail(customerEmail, "free")
      if (!updated) {
        console.warn("[Lemonsqueezy Webhook] Could not find user with email:", customerEmail)
      }

      return NextResponse.json({ received: true })
    }

    // Unknown event type
    console.log("[Lemonsqueezy Webhook] Unhandled event type:", event.meta?.event_name)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Lemonsqueezy Webhook] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

