/**
 * POST /api/auth/supabase-login
 * Supabase-based authentication - ROBUST & PRODUCTION-READY
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("[Supabase Login] Attempting login for:", email)

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log("[Supabase Login] Login failed:", error.message)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }

    console.log("[Supabase Login] Login successful for:", email)

    // Return user data and session
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split("@")[0],
        plan: data.user.user_metadata?.plan || "free",
        role: data.user.user_metadata?.role || "user",
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    })
  } catch (error) {
    console.error("[Supabase Login] Error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

