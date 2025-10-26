/**
 * Leaderboard API Endpoint
 * Fetches and sorts user game stats for the leaderboard
 */

import { type NextRequest, NextResponse } from "next/server"
import { getAllUserGameStats, getUserRank } from "@/lib/updateUserGameStats"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    console.log("[Leaderboard API] Fetching leaderboard - userId:", userId, "limit:", limit, "offset:", offset)

    // Get all user stats
    const allUsers = await getAllUserGameStats()

    // Get user's rank if userId provided
    let userRank: number | null = null
    let userStats = null

    if (userId) {
      userRank = await getUserRank(userId)
      userStats = allUsers.find((u) => u.userId === userId)
    }

    // Apply pagination
    const total = allUsers.length
    const paginatedUsers = allUsers.slice(offset, offset + limit)

    // Format response
    const leaderboard = paginatedUsers.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.userId,
      username: user.username,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      streak: user.streak,
      totalGames: user.wins + user.losses + user.draws,
      winRate: user.wins + user.losses + user.draws > 0 
        ? ((user.wins / (user.wins + user.losses + user.draws)) * 100).toFixed(1)
        : "0.0",
      lastPlayedAt: user.lastPlayedAt,
    }))

    console.log("[Leaderboard API] Returning", leaderboard.length, "users")

    return NextResponse.json({
      success: true,
      leaderboard,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      userRank,
      userStats: userStats
        ? {
            rank: userRank,
            username: userStats.username,
            wins: userStats.wins,
            losses: userStats.losses,
            draws: userStats.draws,
            streak: userStats.streak,
            totalGames: userStats.wins + userStats.losses + userStats.draws,
            winRate: userStats.wins + userStats.losses + userStats.draws > 0
              ? ((userStats.wins / (userStats.wins + userStats.losses + userStats.draws)) * 100).toFixed(1)
              : "0.0",
          }
        : null,
    })
  } catch (error) {
    console.error("[Leaderboard API] Error:", error)
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

