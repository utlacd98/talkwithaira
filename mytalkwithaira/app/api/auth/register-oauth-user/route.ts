import { NextResponse } from "next/server"
import { registerUser } from "@/lib/user-profile-registry"
import { createUserStats, getUserStats } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { userId, email, name } = await request.json()

    console.log("[Register OAuth User] Registering user:", { userId, email, name })

    // Register user with free plan
    await registerUser(email, userId, name, "free")

    // Initialize user stats in Redis if they don't exist
    try {
      const existingStats = await getUserStats(userId)
      if (!existingStats || existingStats.conversations === undefined) {
        await createUserStats(userId)
        console.log("[Register OAuth User] Created initial stats for user:", userId)
      } else {
        console.log("[Register OAuth User] User stats already exist:", userId)
      }
    } catch (statsError) {
      console.warn("[Register OAuth User] Failed to create stats (non-critical):", statsError)
      // Don't fail registration if stats creation fails
    }

    console.log("[Register OAuth User] User registered successfully")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Register OAuth User] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    )
  }
}

