/**
 * ADHD Games Leaderboard API Endpoint
 * Fetches and sorts user ADHD game stats for the leaderboard
 */

import { type NextRequest, NextResponse } from "next/server"
import { getAllADHDGameStats, getADHDGameStats } from "@/lib/adhd-game-stats"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const gameFilter = searchParams.get("game") // Optional: filter by specific game
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    console.log("[ADHD Leaderboard] Fetching - userId:", userId, "game:", gameFilter)

    // Get all user stats
    let allUsers = await getAllADHDGameStats()

    // If filtering by game, re-sort by that game's score
    if (gameFilter) {
      const gameField = {
        'focus-bubbles': 'focusBubbles',
        'pattern-chase': 'patternChase',
        'distraction-dodge': 'distractionDodge',
        'word-sort': 'wordSort',
      }[gameFilter] as keyof typeof allUsers[0] | undefined

      if (gameField) {
        allUsers = allUsers
          .filter(u => (u[gameField] as number) > 0)
          .sort((a, b) => (b[gameField] as number) - (a[gameField] as number))
      }
    }

    // Get user's rank if userId provided
    let userRank: number | null = null
    let userStats = null

    if (userId) {
      userStats = await getADHDGameStats(userId)
      const userIndex = allUsers.findIndex(u => u.userId === userId)
      userRank = userIndex >= 0 ? userIndex + 1 : null
    }

    // Apply pagination
    const total = allUsers.length
    const paginatedUsers = allUsers.slice(offset, offset + limit)

    // Format response
    const leaderboard = paginatedUsers.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.userId,
      username: user.username || `Player ${user.userId.substring(0, 6)}`,
      focusBubbles: user.focusBubbles,
      patternChase: user.patternChase,
      distractionDodge: user.distractionDodge,
      wordSort: user.wordSort,
      totalScore: user.totalScore,
      lastPlayedAt: user.lastPlayedAt,
    }))

    console.log("[ADHD Leaderboard] Returning", leaderboard.length, "users")

    return NextResponse.json({
      success: true,
      leaderboard,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      userRank,
      userStats: userStats && userStats.totalScore > 0 ? {
        rank: userRank,
        username: userStats.username || `Player ${userId?.substring(0, 6)}`,
        focusBubbles: userStats.focusBubbles,
        patternChase: userStats.patternChase,
        distractionDodge: userStats.distractionDodge,
        wordSort: userStats.wordSort,
        totalScore: userStats.totalScore,
      } : null,
    })
  } catch (error) {
    console.error("[ADHD Leaderboard] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

