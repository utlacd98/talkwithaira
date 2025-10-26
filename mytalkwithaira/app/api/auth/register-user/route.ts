/**
 * POST /api/auth/register-user
 * Registers a user in Redis-based registry
 * Called after successful login/signup
 */

import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/user-registry"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { email, userId, name, plan } = await req.json()

    if (!email || !userId) {
      console.warn("[Register User API] Missing required fields - email:", email, "userId:", userId)
      return NextResponse.json({ error: "Email and userId are required" }, { status: 400 })
    }

    console.log("[Register User API] Registering user:", email, "ID:", userId)

    // Register user with retry logic built into registerUser
    await registerUser(email, userId, name || email.split("@")[0], plan || "free")

    console.log("[Register User API] Successfully registered user:", email)
    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("[Register User API] Error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
}

