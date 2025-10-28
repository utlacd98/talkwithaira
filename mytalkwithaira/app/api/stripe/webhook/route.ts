/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription management
 */

import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { updateUserPlanByEmail } from "@/lib/user-profile-registry"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      console.error("[Stripe Webhook] Missing signature")
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    const stripe = getStripe()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    console.log("[Stripe Webhook] Received event:", event.type)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("[Stripe Webhook] Checkout completed:", session.id)

        // Get customer email and update user plan
        const customerEmail = session.customer_email || session.customer_details?.email
        
        if (customerEmail) {
          console.log("[Stripe Webhook] Upgrading user to premium:", customerEmail)
          await updateUserPlanByEmail(customerEmail, "premium")
          console.log("[Stripe Webhook] User upgraded successfully")
        } else {
          console.warn("[Stripe Webhook] No customer email found in session")
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("[Stripe Webhook] Subscription updated:", subscription.id)

        // Get customer email
        const stripe = getStripe()
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        
        if (customer.deleted) {
          console.warn("[Stripe Webhook] Customer deleted")
          break
        }

        const customerEmail = customer.email
        
        if (customerEmail) {
          // Check subscription status
          if (subscription.status === "active" || subscription.status === "trialing") {
            console.log("[Stripe Webhook] Activating premium for:", customerEmail)
            await updateUserPlanByEmail(customerEmail, "premium")
          } else {
            console.log("[Stripe Webhook] Subscription not active, downgrading:", customerEmail)
            await updateUserPlanByEmail(customerEmail, "free")
          }
        }
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

// Disable body parsing for webhook signature verification
export const runtime = "nodejs"

