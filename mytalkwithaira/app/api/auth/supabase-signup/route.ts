/**
 * POST /api/auth/supabase-signup
 * Supabase-based user registration - ROBUST & PRODUCTION-READY
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    console.log("[Supabase Signup] Attempting signup for:", email)

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          plan: "free",
          role: "user",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.log("[Supabase Signup] Signup failed:", error.message)

      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        )
      }

      if (error.message.includes("invalid") && error.message.includes("email")) {
        return NextResponse.json(
          { error: "Please use a valid email address (e.g., yourname@gmail.com)" },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Registration failed - no user returned" },
        { status: 500 }
      )
    }

    console.log("[Supabase Signup] Signup successful for:", email)

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log("[Supabase Signup] Email confirmation required for:", email)
      return NextResponse.json({
        success: true,
        requiresConfirmation: true,
        message: "Please check your email to confirm your account",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || name,
          plan: "free",
          role: "user",
        },
      })
    }

    // Return user data and session
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || name,
        plan: "free",
        role: "user",
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    })
  } catch (error) {
    console.error("[Supabase Signup] Error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}

