/**
 * POST /api/auth/register-user
 * Registers a user in Redis-based registry with fallbacks
 * Called after successful login/signup
 * Supports mock mode for testing
 */

import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/redis-user-registry"
import { isMockMode } from "@/lib/mock-services"

// Temporarily disable edge runtime to allow better error handling
// export const runtime = "edge"

export async function POST(req: NextRequest) {
  let email: string | undefined
  let userId: string | undefined
  let name: string | undefined
  let plan: string | undefined

  try {
    const body = await req.json()
    email = body.email
    userId = body.userId
    name = body.name
    plan = body.plan

    if (!email || !userId) {
      console.warn("[Register User API] Missing required fields - email:", email, "userId:", userId)
      return NextResponse.json({ error: "Email and userId are required" }, { status: 400 })
    }

    console.log("[Register User API] Registering user:", email, "ID:", userId)

    // Mock mode: return mock response
    if (isMockMode()) {
      console.log("[Register User API] Mock mode - returning mock response")
      return NextResponse.json({
        success: true,
        message: "User registered successfully (mock)",
        mock: true,
        user: {
          id: userId,
          email,
          name: name || email.split("@")[0],
          plan: plan || "free",
          createdAt: Date.now(),
        },
      })
    }

    // Register user with Redis and fallback
    const result = await registerUser(userId, {
      email,
      name: name || email.split("@")[0],
      plan: (plan as "free" | "pro" | "premium") || "free",
    })

    console.log("[Register User API] Successfully registered user:", email, result.fallback ? "(fallback)" : "(Redis)")

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      fallback: result.fallback,
      user: result.user,
    })
  } catch (error) {
    console.error("[Register User API] Error:", error instanceof Error ? error.message : error)

    // Even if registration fails, return success with fallback
    if (userId) {
      console.log("[Register User API] Returning fallback response for user:", userId)
      return NextResponse.json({
        success: true,
        message: "User registered (with fallback)",
        fallback: true,
        user: {
          id: userId,
          email: email || "unknown",
          name: name || "User",
          plan: plan || "free",
          createdAt: Date.now(),
        },
      })
    }

    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
}

