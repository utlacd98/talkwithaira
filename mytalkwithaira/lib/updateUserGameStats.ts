/**
 * Update User Game Stats - Redis Helper
 * Handles saving game results to Redis for leaderboard tracking
 */

import { kv } from "@vercel/kv"

export interface GameStats {
  wins: number
  losses: number
  draws: number
  streak: number
  lastPlayedAt?: string
}

export interface GameResult {
  result: "win" | "loss" | "draw"
  game: string
  timestamp?: string
}

/**
 * Get user's current game stats from Redis
 */
export async function getUserGameStats(userId: string): Promise<GameStats> {
  try {
    const key = `user:${userId}:games`
    const stats = await kv.hgetall(key)

    if (!stats || Object.keys(stats).length === 0) {
      // Return default stats if user has no record
      return {
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
      }
    }

    return {
      wins: parseInt(stats.wins as string) || 0,
      losses: parseInt(stats.losses as string) || 0,
      draws: parseInt(stats.draws as string) || 0,
      streak: parseInt(stats.streak as string) || 0,
      lastPlayedAt: stats.lastPlayedAt as string,
    }
  } catch (error) {
    console.error("[Game Stats] Error getting user stats:", error)
    return {
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
    }
  }
}

/**
 * Update user's game stats after a game ends
 */
export async function updateUserGameStats(
  userId: string,
  result: GameResult
): Promise<GameStats> {
  try {
    const key = `user:${userId}:games`
    const currentStats = await getUserGameStats(userId)

    let newStats = { ...currentStats }

    // Update result count
    if (result.result === "win") {
      newStats.wins += 1
      newStats.streak += 1
    } else if (result.result === "loss") {
      newStats.losses += 1
      newStats.streak = 0 // Reset streak on loss
    } else if (result.result === "draw") {
      newStats.draws += 1
      newStats.streak = 0 // Reset streak on draw
    }

    // Update timestamp
    newStats.lastPlayedAt = result.timestamp || new Date().toISOString()

    // Save to Redis using HSET (hash set)
    await kv.hset(key, {
      wins: newStats.wins.toString(),
      losses: newStats.losses.toString(),
      draws: newStats.draws.toString(),
      streak: newStats.streak.toString(),
      lastPlayedAt: newStats.lastPlayedAt,
    })

    console.log("[Game Stats] Updated stats for user:", userId, newStats)

    return newStats
  } catch (error) {
    console.error("[Game Stats] Error updating user stats:", error)
    throw error
  }
}

/**
 * Get all users' game stats for leaderboard
 * Returns array of users with their stats
 */
export async function getAllUserGameStats(): Promise<
  Array<{
    userId: string
    username: string
    wins: number
    losses: number
    draws: number
    streak: number
    lastPlayedAt?: string
  }>
> {
  try {
    // Get all keys matching user:*:games pattern
    const keys = await kv.keys("user:*:games")

    if (!keys || keys.length === 0) {
      console.log("[Game Stats] No users found in leaderboard")
      return []
    }

    const users = []

    for (const key of keys) {
      try {
        // Extract userId from key (format: user:{userId}:games)
        const userId = key.split(":")[1]

        // Get stats
        const stats = await kv.hgetall(key)

        if (stats && Object.keys(stats).length > 0) {
          // Get username from user registry
          const username = await getUsernameFromRegistry(userId)

          users.push({
            userId,
            username: username || `User ${userId.substring(0, 8)}`,
            wins: parseInt(stats.wins as string) || 0,
            losses: parseInt(stats.losses as string) || 0,
            draws: parseInt(stats.draws as string) || 0,
            streak: parseInt(stats.streak as string) || 0,
            lastPlayedAt: stats.lastPlayedAt as string,
          })
        }
      } catch (err) {
        console.warn("[Game Stats] Error processing user key:", key, err)
        continue
      }
    }

    // Sort by wins (desc), then by streak (desc)
    users.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins
      }
      return b.streak - a.streak
    })

    return users
  } catch (error) {
    console.error("[Game Stats] Error getting all user stats:", error)
    return []
  }
}

/**
 * Get username from user registry
 */
async function getUsernameFromRegistry(userId: string): Promise<string | null> {
  try {
    // Try to get from user registry
    const registryKey = `user:${userId}:profile`
    const profile = await kv.hgetall(registryKey)

    if (profile && profile.username) {
      return profile.username as string
    }

    return null
  } catch (error) {
    console.warn("[Game Stats] Error getting username:", error)
    return null
  }
}

/**
 * Save user profile info for leaderboard display
 */
export async function saveUserProfile(
  userId: string,
  username: string,
  email?: string
): Promise<void> {
  try {
    const key = `user:${userId}:profile`

    await kv.hset(key, {
      userId,
      username,
      email: email || "",
      createdAt: new Date().toISOString(),
    })

    console.log("[Game Stats] Saved user profile:", userId, username)
  } catch (error) {
    console.error("[Game Stats] Error saving user profile:", error)
  }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
  try {
    const allUsers = await getAllUserGameStats()
    const rank = allUsers.findIndex((u) => u.userId === userId)

    return rank >= 0 ? rank + 1 : null
  } catch (error) {
    console.error("[Game Stats] Error getting user rank:", error)
    return null
  }
}

