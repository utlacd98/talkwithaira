/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe checkout session for Premium subscription
 */

import { NextRequest, NextResponse } from "next/server"
import { getStripe, getPriceId } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    // DEBUG: Check environment variables
    console.log("[DEBUG] STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY)
    console.log("[DEBUG] STRIPE_SECRET_KEY prefix:", process.env.STRIPE_SECRET_KEY?.substring(0, 7))
    console.log("[DEBUG] NEXT_PUBLIC_STRIPE_PRICE_PREMIUM:", process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM)

    const { email, userId, name } = await req.json()

    console.log("[Stripe Checkout] Creating session for:", email)

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      )
    }

    // Get Premium price ID
    const priceId = getPriceId("premium")

    if (!priceId) {
      console.error("[Stripe Checkout] NEXT_PUBLIC_STRIPE_PRICE_PREMIUM not configured")
      return NextResponse.json(
        { error: "Stripe price not configured. Please contact support." },
        { status: 500 }
      )
    }

    console.log("[DEBUG] Price ID:", priceId)

    let stripe
    try {
      stripe = getStripe()
      console.log("[DEBUG] Stripe client initialized successfully")
    } catch (stripeError) {
      console.error("[Stripe Checkout] Failed to initialize Stripe:", stripeError)
      return NextResponse.json(
        { error: "Stripe configuration error. Please contact support." },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://airasupport.com").trim()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        plan: "premium",
      },
      subscription_data: {
        metadata: {
          userId,
          plan: "premium",
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    })

    console.log("[Stripe Checkout] Session created:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("[Stripe Checkout] Error:", error)
    console.error("[Stripe Checkout] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[Stripe Checkout] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[Stripe Checkout] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

