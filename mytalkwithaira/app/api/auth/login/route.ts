/**
 * POST /api/auth/login
 * Validates user credentials and returns user data
 */

import { NextRequest, NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth-db"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("[Login API] Attempting login for:", email)

    // Validate credentials
    const user = validateCredentials(email, password)

    if (!user) {
      console.log("[Login API] Login failed for:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log("[Login API] Login successful for:", email)

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
    console.error("[Login API] Error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

