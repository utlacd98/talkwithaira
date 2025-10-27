/**
 * POST /api/auth/google/verify
 * Verifies Google ID token and creates/updates user
 */

import { NextRequest, NextResponse } from "next/server"
import { findOrCreateGoogleUser, updateGoogleUser } from "@/lib/auth-db"

/**
 * Verify Google ID token with Google's servers
 */
async function verifyGoogleIdToken(idToken: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${idToken}`
    )

    if (!response.ok) {
      console.error("[Google Verify] Token verification failed:", response.statusText)
      return null
    }

    const data = await response.json()

    // Verify the token is for our app
    if (data.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("[Google Verify] Token audience mismatch")
      return null
    }

    return data
  } catch (error) {
    console.error("[Google Verify] Error verifying token:", error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      )
    }

    console.log("[Google Verify] Verifying token...")

    // Verify token with Google
    const tokenData = await verifyGoogleIdToken(idToken)

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { email, name, picture, sub: googleId } = tokenData

    console.log("[Google Verify] Token verified for:", email)

    // Find or create user in our database
    const user = findOrCreateGoogleUser(googleId, email, name, picture)

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    console.log("[Google Verify] User authenticated:", user.email)

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        plan: user.plan,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[Google Verify API] Error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

