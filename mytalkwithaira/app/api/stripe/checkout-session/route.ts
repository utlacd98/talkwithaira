/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe checkout session for Premium subscription
 */

import { NextRequest, NextResponse } from "next/server"
import { getStripe, getPriceId } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
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

    const stripe = getStripe()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
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
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

