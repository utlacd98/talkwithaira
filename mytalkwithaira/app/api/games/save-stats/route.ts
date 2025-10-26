/**
 * Save Game Stats API Endpoint
 * Saves game results to Redis for leaderboard tracking
 */

import { type NextRequest, NextResponse } from "next/server"
import { updateUserGameStats, saveUserProfile } from "@/lib/updateUserGameStats"
import { getAuth } from "@clerk/nextjs/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    // Get auth info
    const { userId: clerkUserId } = await getAuth(req)

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { userId, game, result, timestamp } = body

    // Validate input
    if (!userId || !game || !result) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!["win", "loss", "draw"].includes(result)) {
      return NextResponse.json(
        { success: false, error: "Invalid result" },
        { status: 400 }
      )
    }

    // Verify user is updating their own stats
    if (userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Cannot update other user's stats" },
        { status: 403 }
      )
    }

    console.log("[Save Stats API] Saving stats for user:", userId, "result:", result)

    // Update stats in Redis
    const updatedStats = await updateUserGameStats(userId, {
      result: result as "win" | "loss" | "draw",
      game,
      timestamp: timestamp || new Date().toISOString(),
    })

    console.log("[Save Stats API] Updated stats:", updatedStats)

    return NextResponse.json({
      success: true,
      stats: updatedStats,
    })
  } catch (error) {
    console.error("[Save Stats API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

