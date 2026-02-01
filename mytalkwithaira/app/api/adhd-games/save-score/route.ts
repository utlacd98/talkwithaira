/**
 * Save ADHD Game Score API Endpoint
 * Saves high scores for ADHD cognitive games
 */

import { type NextRequest, NextResponse } from "next/server"
import { saveADHDGameScore } from "@/lib/adhd-game-stats"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, username, game, score } = body

    // Validate input
    if (!userId || !game || score === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, game, score" },
        { status: 400 }
      )
    }

    const validGames = ['focus-bubbles', 'pattern-chase', 'distraction-dodge', 'word-sort']
    if (!validGames.includes(game)) {
      return NextResponse.json(
        { success: false, error: `Invalid game. Must be one of: ${validGames.join(', ')}` },
        { status: 400 }
      )
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, error: "Score must be a non-negative number" },
        { status: 400 }
      )
    }

    console.log("[Save ADHD Score] Saving score for user:", userId, "game:", game, "score:", score)

    const result = await saveADHDGameScore(
      userId,
      username || `Player ${userId.substring(0, 6)}`,
      game,
      score
    )

    console.log("[Save ADHD Score] Result:", result.isNewHighScore ? "New high score!" : "Not a high score")

    return NextResponse.json({
      success: true,
      isNewHighScore: result.isNewHighScore,
      stats: result.stats,
    })
  } catch (error) {
    console.error("[Save ADHD Score] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save score",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

