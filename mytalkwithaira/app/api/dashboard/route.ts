/**
 * GET /api/dashboard
 * Returns parsed Redis stats for authenticated user
 * Falls back to default stats if Redis is unavailable
 * Includes health checks and retry logic
 * Supports mock mode for load testing
 */

import { NextRequest, NextResponse } from "next/server"
import { getUserStats, createUserStats, healthCheck, type UserStats } from "@/lib/redis"
import { isMockMode, generateMockStats, simulateNetworkDelay, getOrCreateMockSession } from "@/lib/mock-services"

export const runtime = "edge"

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
      console.warn("[Dashboard API] Missing userId parameter")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[Dashboard API] Fetching stats for user:", userId)

    // Mock mode: return simulated stats
    if (isMockMode()) {
      await simulateNetworkDelay()
      const mockStats = generateMockStats(userId)
      getOrCreateMockSession(userId)
      console.log(`[Dashboard API] Mock stats for user: ${userId}`)
      return NextResponse.json(
        {
          success: true,
          data: mockStats,
          redisHealthy: true,
          mock: true,
        },
        { status: 200 }
      )
    }

    // Check Redis health first
    let redisHealthy = false
    try {
      redisHealthy = await healthCheck()
      if (!redisHealthy) {
        console.warn("[Dashboard API] Redis health check failed")
      }
    } catch (healthError) {
      console.warn("[Dashboard API] Redis health check error:", healthError instanceof Error ? healthError.message : healthError)
    }

    let stats: UserStats | null = null

    // Try to get existing stats
    try {
      stats = await getUserStats(userId)
      if (stats) {
        console.log("[Dashboard API] Retrieved existing stats for user:", userId)
      }
    } catch (redisError) {
      console.warn("[Dashboard API] Redis unavailable — retrying.", redisError instanceof Error ? redisError.message : redisError)
      stats = null
    }

    // If stats don't exist, try to create them
    if (!stats) {
      try {
        console.log("[Dashboard API] Creating new stats for user:", userId)
        stats = await createUserStats(userId)
        console.log("[Dashboard API] Successfully created stats for user:", userId)
      } catch (createError) {
        console.warn(
          "[Dashboard API] Could not create stats in Redis, using defaults:",
          createError instanceof Error ? createError.message : createError
        )
        stats = DEFAULT_STATS
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: stats,
        redisHealthy,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Dashboard API] Unexpected error:", error instanceof Error ? error.message : error)
    // Return default stats instead of error
    return NextResponse.json(
      {
        success: true,
        data: DEFAULT_STATS,
        redisHealthy: false,
      },
      { status: 200 }
    )
  }
}

