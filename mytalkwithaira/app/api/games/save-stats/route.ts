/**
 * Save Game Stats API Endpoint
 * Saves game results to Redis for leaderboard tracking
 */

import { type NextRequest, NextResponse } from "next/server"
import { updateUserGameStats, saveUserProfile } from "@/lib/updateUserGameStats"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
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

