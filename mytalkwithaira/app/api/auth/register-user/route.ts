/**
 * POST /api/auth/register-user
 * Registers a user in the server-side registry
 * Called after successful login/signup
 */

import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/user-registry"

export async function POST(req: NextRequest) {
  try {
    const { email, userId, name, plan } = await req.json()

    if (!email || !userId) {
      return NextResponse.json({ error: "Email and userId are required" }, { status: 400 })
    }

    await registerUser(email, userId, name || email.split("@")[0], plan || "free")

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("[Register User API] Error:", error)
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
}

