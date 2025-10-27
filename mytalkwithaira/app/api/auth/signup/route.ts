/**
 * POST /api/auth/signup
 * Registers a new user and returns user data
 */

import { NextRequest, NextResponse } from "next/server"
import { registerNewUser } from "@/lib/auth-db"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    console.log("[Signup API] Attempting signup for:", email)

    // Register new user
    const user = registerNewUser(email, password, name)

    if (!user) {
      console.log("[Signup API] Signup failed for:", email, "- Email already exists")
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    console.log("[Signup API] Signup successful for:", email)

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id || Math.random().toString(36).substr(2, 9),
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[Signup API] Error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}

