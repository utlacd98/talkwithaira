/**
 * POST /api/games/matchmaking
 * Join matchmaking queue for multiplayer games
 * 
 * GET /api/games/matchmaking
 * Check matchmaking status and get current game
 */

import { NextRequest, NextResponse } from "next/server"
import { joinWaitingList, leaveWaitingList, getUserGame } from "@/lib/game-matchmaking"

export async function POST(req: NextRequest) {
  try {
    const { userId, username, gameType, action } = await req.json()

    if (!userId || !username) {
      return NextResponse.json(
        { error: "userId and username are required" },
        { status: 400 }
      )
    }

    if (!gameType || !["noughts-crosses", "memory"].includes(gameType)) {
      return NextResponse.json(
        { error: "Invalid game type" },
        { status: 400 }
      )
    }

    // Handle leave action
    if (action === "leave") {
      await leaveWaitingList(userId, gameType)
      return NextResponse.json({ success: true, message: "Left waiting list" })
    }

    // Join matchmaking
    const result = await joinWaitingList(userId, username, gameType)

    return NextResponse.json({
      success: true,
      matched: result.matched,
      gameId: result.gameId,
      opponent: result.opponent,
    })
  } catch (error) {
    console.error("[Matchmaking API] Error:", error)
    return NextResponse.json(
      { error: "Failed to join matchmaking" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const game = await getUserGame(userId)

    if (!game) {
      return NextResponse.json({ success: true, game: null })
    }

    return NextResponse.json({ success: true, game })
  } catch (error) {
    console.error("[Matchmaking API] Error:", error)
    return NextResponse.json(
      { error: "Failed to get game status" },
      { status: 500 }
    )
  }
}

