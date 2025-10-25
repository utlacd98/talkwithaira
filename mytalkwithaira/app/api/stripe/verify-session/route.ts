/**
 * GET /api/stripe/verify-session
 * Verifies a Lemonsqueezy checkout session and returns the user's plan
 * Called after user returns from Lemonsqueezy checkout
 */

import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/user-registry"

export async function GET(req: NextRequest) {
  try {
    // Get user email from query params or headers
    const email = req.nextUrl.searchParams.get("email")
    const sessionId = req.nextUrl.searchParams.get("session_id")

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    console.log("[Verify Session] Checking plan for email:", email)

    // Look up user by email
    const user = await getUserByEmail(email)

    if (!user) {
      console.warn("[Verify Session] User not found:", email)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    console.log("[Verify Session] Found user:", email, "Plan:", user.plan)

    return NextResponse.json({
      success: true,
      plan: user.plan,
      userId: user.id,
      name: user.name,
    })
  } catch (error) {
    console.error("[Verify Session] Error:", error)
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    )
  }
}

