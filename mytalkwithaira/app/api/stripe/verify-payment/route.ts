/**
 * POST /api/stripe/verify-payment
 * Verifies a Stripe checkout session and upgrades the user
 */

import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { updateUserPlanByEmail } from "@/lib/user-profile-registry"

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email } = await req.json()

    console.log("[Verify Payment] Verifying session:", sessionId, "for email:", email)

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: "Session ID and email are required" },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log("[Verify Payment] Session status:", session.payment_status)
    console.log("[Verify Payment] Session customer email:", session.customer_email)

    // Check if payment was successful
    if (session.payment_status === "paid") {
      console.log("[Verify Payment] ✅ Payment confirmed! Upgrading user to premium")
      
      // Upgrade the user to premium
      const success = await updateUserPlanByEmail(email, "premium")
      
      if (success) {
        console.log("[Verify Payment] ✅ User upgraded successfully:", email)
        return NextResponse.json({
          success: true,
          plan: "premium",
          message: "Payment verified and user upgraded to premium"
        })
      } else {
        console.error("[Verify Payment] ❌ Failed to upgrade user - not found in Redis:", email)
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 }
        )
      }
    } else {
      console.log("[Verify Payment] ❌ Payment not completed. Status:", session.payment_status)
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[Verify Payment] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify payment" },
      { status: 500 }
    )
  }
}

