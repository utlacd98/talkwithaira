/**
 * PATCH /api/mood
 * Updates mood_score in Redis
 */

import { NextRequest, NextResponse } from "next/server"
import { updateMoodScore, getUserStats } from "@/lib/redis"

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { score } = body

    if (score === undefined || score === null) {
      return NextResponse.json({ error: "Mood score is required" }, { status: 400 })
    }

    if (typeof score !== "number" || score < 0 || score > 10) {
      return NextResponse.json(
        { error: "Mood score must be a number between 0 and 10" },
        { status: 400 }
      )
    }

    console.log("[Mood API] Updating mood score for user:", userId, "Score:", score)

    await updateMoodScore(userId, score)

    const updatedStats = await getUserStats(userId)

    return NextResponse.json(
      {
        success: true,
        message: "Mood score updated",
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

