/**
 * POST /api/games/move
 * Make a move in an active game
 * 
 * GET /api/games/move
 * Get current game state
 */

import { NextRequest, NextResponse } from "next/server"
import { makeMove, getGameSession, endGame } from "@/lib/game-matchmaking"

export async function POST(req: NextRequest) {
  try {
    const { gameId, userId, position, action } = await req.json()

    if (!gameId || !userId) {
      return NextResponse.json(
        { error: "gameId and userId are required" },
        { status: 400 }
      )
    }

    // Handle end game action
    if (action === "end") {
      await endGame(gameId)
      return NextResponse.json({ success: true, message: "Game ended" })
    }

    // Validate position
    if (typeof position !== "number" || position < 0 || position > 8) {
      return NextResponse.json(
        { error: "Invalid position" },
        { status: 400 }
      )
    }

    // Make the move
    const result = await makeMove(gameId, userId, position)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      game: result.session,
    })
  } catch (error) {
    console.error("[Game Move API] Error:", error)
    return NextResponse.json(
      { error: "Failed to make move" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const gameId = req.nextUrl.searchParams.get("gameId")

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      )
    }

    const game = await getGameSession(gameId)

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, game })
  } catch (error) {
    console.error("[Game Move API] Error:", error)
    return NextResponse.json(
      { error: "Failed to get game state" },
      { status: 500 }
    )
  }
}

