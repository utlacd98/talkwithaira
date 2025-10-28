/**
 * PATCH /api/mood
 * Updates mood_score in Redis and adds to mood history
 *
 * GET /api/mood
 * Gets mood history and statistics
 */

import { NextRequest, NextResponse } from "next/server"
import { addMoodEntry, getMoodHistory, getMoodStats, getUserStats } from "@/lib/redis"

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { score, note } = body

    if (score === undefined || score === null) {
      return NextResponse.json({ error: "Mood score is required" }, { status: 400 })
    }

    if (typeof score !== "number" || score < 0 || score > 10) {
      return NextResponse.json(
        { error: "Mood score must be a number between 0 and 10" },
        { status: 400 }
      )
    }

    console.log("[Mood API] Adding mood entry for user:", userId, "Score:", score)

    // Add mood entry (this also updates the current mood score)
    await addMoodEntry(userId, score, note)

    const updatedStats = await getUserStats(userId)

    return NextResponse.json(
      {
        success: true,
        message: "Mood entry added",
        data: updatedStats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Mood API] Error:", error)
    return NextResponse.json(
      { error: "Failed to update mood score" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || req.headers.get("x-user-id")
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30")
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[Mood API] Getting mood history for user:", userId)

    const history = await getMoodHistory(userId, limit)
    const stats = await getMoodStats(userId, days)

    return NextResponse.json(
      {
        success: true,
        history,
        stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Mood API] Error:", error)
    return NextResponse.json(
      { error: "Failed to get mood history" },
      { status: 500 }
    )
  }
}

