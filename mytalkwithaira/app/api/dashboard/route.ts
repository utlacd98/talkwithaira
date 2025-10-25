/**
 * GET /api/dashboard
 * Returns parsed Redis stats for authenticated user
 * Falls back to default stats if Redis is unavailable
 */

import { NextRequest, NextResponse } from "next/server"
import { getUserStats, createUserStats, type UserStats } from "@/lib/redis"

// Default stats for new users or when Redis is unavailable
const DEFAULT_STATS: UserStats = {
  conversations: 0,
  mood_score: 0,
  days_active: 1,
  recent_conversations: [],
  plan: "Free",
}

export async function GET(req: NextRequest) {
  try {
    // Get user ID from query params or auth header
    const userId = req.nextUrl.searchParams.get("userId") || req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[Dashboard API] Fetching stats for user:", userId)

    let stats: UserStats | null = null

    try {
      stats = await getUserStats(userId)
    } catch (redisError) {
      console.warn("[Dashboard API] Redis unavailable, using default stats:", redisError)
      stats = null
    }

    // If stats don't exist, try to create them
    if (!stats) {
      try {
        console.log("[Dashboard API] Creating new stats for user:", userId)
        stats = await createUserStats(userId)
      } catch (createError) {
        console.warn("[Dashboard API] Could not create stats in Redis, using defaults:", createError)
        stats = DEFAULT_STATS
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Dashboard API] Error:", error)
    // Return default stats instead of error
    return NextResponse.json(
      {
        success: true,
        data: DEFAULT_STATS,
      },
      { status: 200 }
    )
  }
}

