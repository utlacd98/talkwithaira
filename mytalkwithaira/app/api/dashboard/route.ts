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

    // Check if Redis is configured
    const redisConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    if (!redisConfigured) {
      console.warn("[Dashboard API] Redis not configured, returning default stats")
      return NextResponse.json(
        {
          success: true,
          data: DEFAULT_STATS,
          redisHealthy: false,
          message: "Redis not configured - using default stats",
        },
        { status: 200 }
      )
    }

    // Check Redis health first with timeout
    let redisHealthy = false
    try {
      const healthCheckPromise = healthCheck()
      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000))
      redisHealthy = await Promise.race([healthCheckPromise, timeoutPromise])

      if (!redisHealthy) {
        console.warn("[Dashboard API] Redis health check failed or timed out, using defaults")
        return NextResponse.json(
          {
            success: true,
            data: DEFAULT_STATS,
            redisHealthy: false,
          },
          { status: 200 }
        )
      }
    } catch (healthError) {
      console.warn("[Dashboard API] Redis health check error:", healthError instanceof Error ? healthError.message : healthError)
      return NextResponse.json(
        {
          success: true,
          data: DEFAULT_STATS,
          redisHealthy: false,
        },
        { status: 200 }
      )
    }

    let stats: UserStats | null = null

    // Try to get existing stats with timeout
    try {
      const getStatsPromise = getUserStats(userId)
      const timeoutPromise = new Promise<UserStats | null>((resolve) => setTimeout(() => resolve(null), 2000))
      stats = await Promise.race([getStatsPromise, timeoutPromise])

      if (stats) {
        console.log("[Dashboard API] Retrieved existing stats for user:", userId)
      }
    } catch (redisError) {
      console.warn("[Dashboard API] Redis unavailable:", redisError instanceof Error ? redisError.message : redisError)
      stats = null
    }

    // If stats don't exist, try to create them
    if (!stats) {
      try {
        console.log("[Dashboard API] Creating new stats for user:", userId)
        const createStatsPromise = createUserStats(userId)
        const timeoutPromise = new Promise<UserStats>((resolve) => setTimeout(() => resolve(DEFAULT_STATS), 2000))
        stats = await Promise.race([createStatsPromise, timeoutPromise])
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
        data: stats || DEFAULT_STATS,
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

