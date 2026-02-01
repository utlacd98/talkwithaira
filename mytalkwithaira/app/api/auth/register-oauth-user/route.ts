import { NextResponse } from "next/server"
import { registerUser } from "@/lib/user-profile-registry"
import { createUserStats, getUserStats } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { userId, email, name, plan = "free" } = await request.json()

    console.log("[Register OAuth User] ========================================")
    console.log("[Register OAuth User] Registering user:", { userId, email, name, plan })

    if (!userId || !email) {
      console.error("[Register OAuth User] Missing required fields:", { userId, email, name })
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      )
    }

    // Register user with specified plan
    try {
      await registerUser(email, userId, name || "User", plan)
      console.log("[Register OAuth User] ✅ User registered in Redis successfully with plan:", plan)
    } catch (registerError: any) {
      console.error("[Register OAuth User] ❌ Failed to register user in Redis:", registerError)
      console.error("[Register OAuth User] Error details:", registerError.message, registerError.stack)
      throw registerError
    }

    // Initialize user stats in Redis if they don't exist
    try {
      const existingStats = await getUserStats(userId)
      if (!existingStats || existingStats.conversations === undefined) {
        await createUserStats(userId)
        console.log("[Register OAuth User] ✅ Created initial stats for user:", userId)
      } else {
        console.log("[Register OAuth User] User stats already exist:", userId)
      }
    } catch (statsError) {
      console.warn("[Register OAuth User] ⚠️ Failed to create stats (non-critical):", statsError)
      // Don't fail registration if stats creation fails
    }

    console.log("[Register OAuth User] ✅ User registration completed successfully")
    console.log("[Register OAuth User] ========================================")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Register OAuth User] ❌ FATAL ERROR:", error)
    console.error("[Register OAuth User] Error message:", error.message)
    console.error("[Register OAuth User] Error stack:", error.stack)
    console.log("[Register OAuth User] ========================================")
    return NextResponse.json(
      { error: error.message || "Failed to register user", details: error.stack },
      { status: 500 }
    )
  }
}

