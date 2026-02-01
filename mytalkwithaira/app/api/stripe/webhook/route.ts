/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription management
 */

import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { updateUserPlanByEmail, updateUserPlan } from "@/lib/user-profile-registry"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    console.log("[Stripe Webhook] ========================================")
    console.log("[Stripe Webhook] Received webhook request")
    console.log("[Stripe Webhook] Signature present:", !!signature)
    console.log("[Stripe Webhook] Body length:", body.length)

    if (!signature) {
      console.error("[Stripe Webhook] Missing signature")
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const isTestMode = process.env.NODE_ENV === "development" || !webhookSecret || webhookSecret === "your_stripe_webhook_secret_here"

    console.log("[Stripe Webhook] Environment:", process.env.NODE_ENV)
    console.log("[Stripe Webhook] Webhook secret exists:", !!webhookSecret)
    console.log("[Stripe Webhook] Webhook secret value:", webhookSecret ? webhookSecret.substring(0, 15) + "..." : "NOT SET")
    console.log("[Stripe Webhook] Is test mode:", isTestMode)

    if (!webhookSecret || webhookSecret === "your_stripe_webhook_secret_here") {
      console.warn("[Stripe Webhook] ⚠️ STRIPE_WEBHOOK_SECRET not configured")
      console.warn("[Stripe Webhook] ⚠️ Running in UNSAFE mode - signature verification DISABLED")
      console.warn("[Stripe Webhook] ⚠️ Please set STRIPE_WEBHOOK_SECRET in Vercel environment variables")
      console.warn("[Stripe Webhook] ⚠️ See STRIPE_WEBHOOK_SETUP.md for instructions")
    }

    const stripe = getStripe()

    // Verify webhook signature (or skip in test mode)
    let event: Stripe.Event

    if (isTestMode) {
      // UNSAFE: Skip signature verification for testing
      console.warn("[Stripe Webhook] ⚠️ SKIPPING signature verification (test mode)")
      try {
        event = JSON.parse(body) as Stripe.Event
        console.log("[Stripe Webhook] ⚠️ Parsed event without verification")
      } catch (parseErr) {
        console.error("[Stripe Webhook] ❌ Failed to parse webhook body:", parseErr)
        return NextResponse.json(
          { error: "Invalid webhook body" },
          { status: 400 }
        )
      }
    } else {
      // SAFE: Verify signature in production
      console.log("[Stripe Webhook] Webhook secret configured:", webhookSecret!.substring(0, 10) + "...")
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)
        console.log("[Stripe Webhook] ✅ Signature verified successfully")
      } catch (err) {
        console.error("[Stripe Webhook] ❌ Signature verification failed:", err)
        console.error("[Stripe Webhook] This usually means:")
        console.error("[Stripe Webhook] 1. Wrong webhook secret (check Vercel environment variables)")
        console.error("[Stripe Webhook] 2. Body was modified before reaching this handler")
        console.error("[Stripe Webhook] 3. Using production secret with test webhooks (or vice versa)")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        )
      }
    }

    console.log("[Stripe Webhook] ========================================")
    console.log("[Stripe Webhook] Received event:", event.type)
    console.log("[Stripe Webhook] Event ID:", event.id)
    console.log("[Stripe Webhook] Event data:", JSON.stringify(event.data.object, null, 2))
    console.log("[Stripe Webhook] ========================================")

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("[Stripe Webhook] Checkout completed:", session.id)
        console.log("[Stripe Webhook] Session mode:", session.mode)
        console.log("[Stripe Webhook] Session customer:", session.customer)
        console.log("[Stripe Webhook] Session client_reference_id:", session.client_reference_id)
        console.log("[Stripe Webhook] Session customer_email:", session.customer_email)
        console.log("[Stripe Webhook] Session customer_details:", session.customer_details)

        // Try to get user ID from client_reference_id first (most reliable)
        const userId = session.client_reference_id
        const customerEmail = session.customer_email || session.customer_details?.email

        if (userId) {
          console.log("[Stripe Webhook] Upgrading user to premium via userId:", userId)
          const success = await updateUserPlan(userId, "premium")
          if (success) {
            console.log("[Stripe Webhook] ✅ User upgraded successfully via userId:", userId)
          } else {
            console.error("[Stripe Webhook] ❌ Failed to upgrade user via userId:", userId)
          }
        } else if (customerEmail) {
          console.log("[Stripe Webhook] Upgrading user to premium via email:", customerEmail)
          const success = await updateUserPlanByEmail(customerEmail, "premium")
          if (success) {
            console.log("[Stripe Webhook] ✅ User upgraded successfully via email:", customerEmail)
          } else {
            console.error("[Stripe Webhook] ❌ Failed to upgrade user via email:", customerEmail)
          }
        } else {
          console.warn("[Stripe Webhook] ⚠️ No user ID or customer email found in session")
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("[Stripe Webhook] ========================================")
        console.log("[Stripe Webhook] Subscription event:", event.type)
        console.log("[Stripe Webhook] Subscription ID:", subscription.id)
        console.log("[Stripe Webhook] Subscription status:", subscription.status)
        console.log("[Stripe Webhook] Customer ID:", subscription.customer)

        // Get customer email
        const stripe = getStripe()
        const customer = await stripe.customers.retrieve(subscription.customer as string)

        if (customer.deleted) {
          console.warn("[Stripe Webhook] ❌ Customer deleted")
          console.log("[Stripe Webhook] ========================================")
          break
        }

        const customerEmail = customer.email
        console.log("[Stripe Webhook] Customer email from Stripe:", customerEmail)

        if (customerEmail) {
          // Check subscription status
          if (subscription.status === "active" || subscription.status === "trialing") {
            console.log("[Stripe Webhook] ✅ Subscription is active, upgrading user to premium")
            console.log("[Stripe Webhook] Looking up user by email:", customerEmail)
            const success = await updateUserPlanByEmail(customerEmail, "premium")
            if (success) {
              console.log("[Stripe Webhook] ✅ Successfully upgraded user to premium:", customerEmail)
            } else {
              console.error("[Stripe Webhook] ❌ Failed to upgrade user - user not found in Redis:", customerEmail)
            }
          } else {
            console.log("[Stripe Webhook] ⚠️ Subscription not active (status:", subscription.status, "), downgrading:", customerEmail)
            await updateUserPlanByEmail(customerEmail, "free")
          }
        } else {
          console.error("[Stripe Webhook] ❌ No customer email found in Stripe customer object!")
          console.error("[Stripe Webhook] Customer object:", JSON.stringify(customer, null, 2))
        }
        console.log("[Stripe Webhook] ========================================")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("[Stripe Webhook] Subscription deleted:", subscription.id)

        // Get customer email and downgrade to free
        const stripe = getStripe()
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        
        if (customer.deleted) {
          console.warn("[Stripe Webhook] Customer deleted")
          break
        }

        const customerEmail = customer.email
        
        if (customerEmail) {
          console.log("[Stripe Webhook] Downgrading user to free:", customerEmail)
          await updateUserPlanByEmail(customerEmail, "free")
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.warn("[Stripe Webhook] Payment failed for invoice:", invoice.id)
        
        // Optionally notify user or take action
        // For now, just log it
        break
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Configure for webhook signature verification
// IMPORTANT: Edge runtime doesn't support raw body parsing needed for Stripe webhooks
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

