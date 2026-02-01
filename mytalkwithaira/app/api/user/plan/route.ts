/**
 * GET /api/user/plan
 * Fetches the user's current plan from Redis
 */

import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/user-profile-registry"

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    console.log("[User Plan API] Fetching plan for:", email)

    // Get user from Redis
    const user = await getUserByEmail(email)

    if (!user) {
      console.log("[User Plan API] User not found, returning free plan")
      return NextResponse.json({
        plan: "free",
        found: false,
      })
    }

    console.log("[User Plan API] Found user with plan:", user.plan)

    return NextResponse.json({
      plan: user.plan,
      found: true,
    })
  } catch (error) {
    console.error("[User Plan API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user plan", plan: "free" },
      { status: 500 }
    )
  }
}

