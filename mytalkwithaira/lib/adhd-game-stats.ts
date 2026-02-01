/**
 * ADHD Game Stats - Redis Helper
 * Handles saving high scores for ADHD cognitive games
 */

import { kv } from "@vercel/kv"

export interface ADHDGameScore {
  score: number
  game: string
  timestamp: string
}

export interface ADHDUserStats {
  userId: string
  username: string
  focusBubbles: number
  patternChase: number
  distractionDodge: number
  wordSort: number
  totalScore: number
  lastPlayedAt?: string
}

const GAME_KEY_MAP: Record<string, keyof Omit<ADHDUserStats, 'userId' | 'username' | 'totalScore' | 'lastPlayedAt'>> = {
  'focus-bubbles': 'focusBubbles',
  'pattern-chase': 'patternChase',
  'distraction-dodge': 'distractionDodge',
  'word-sort': 'wordSort',
}

/**
 * Get user's ADHD game stats from Redis
 */
export async function getADHDGameStats(userId: string): Promise<ADHDUserStats> {
  try {
    const key = `user:${userId}:adhd-games`
    const stats = await kv.hgetall(key)

    if (!stats || Object.keys(stats).length === 0) {
      return {
        userId,
        username: '',
        focusBubbles: 0,
        patternChase: 0,
        distractionDodge: 0,
        wordSort: 0,
        totalScore: 0,
      }
    }

    const focusBubbles = parseInt(stats.focusBubbles as string) || 0
    const patternChase = parseInt(stats.patternChase as string) || 0
    const distractionDodge = parseInt(stats.distractionDodge as string) || 0
    const wordSort = parseInt(stats.wordSort as string) || 0

    return {
      userId,
      username: (stats.username as string) || '',
      focusBubbles,
      patternChase,
      distractionDodge,
      wordSort,
      totalScore: focusBubbles + patternChase + distractionDodge + wordSort,
      lastPlayedAt: stats.lastPlayedAt as string,
    }
  } catch (error) {
    console.error("[ADHD Stats] Error getting user stats:", error)
    return {
      userId,
      username: '',
      focusBubbles: 0,
      patternChase: 0,
      distractionDodge: 0,
      wordSort: 0,
      totalScore: 0,
    }
  }
}

/**
 * Save high score for an ADHD game (only saves if higher than existing)
 */
export async function saveADHDGameScore(
  userId: string,
  username: string,
  gameId: string,
  score: number
): Promise<{ isNewHighScore: boolean; stats: ADHDUserStats }> {
  try {
    const key = `user:${userId}:adhd-games`
    const currentStats = await getADHDGameStats(userId)
    
    const gameField = GAME_KEY_MAP[gameId]
    if (!gameField) {
      throw new Error(`Unknown game: ${gameId}`)
    }

    const currentHighScore = currentStats[gameField] as number
    const isNewHighScore = score > currentHighScore

    // Only update if it's a new high score
    if (isNewHighScore) {
      await kv.hset(key, {
        username,
        [gameField]: score.toString(),
        lastPlayedAt: new Date().toISOString(),
      })

      currentStats[gameField] = score
      currentStats.username = username
      currentStats.totalScore = 
        currentStats.focusBubbles + 
        currentStats.patternChase + 
        currentStats.distractionDodge + 
        currentStats.wordSort
      currentStats.lastPlayedAt = new Date().toISOString()

      console.log(`[ADHD Stats] New high score for ${gameId}:`, score)
    }

    // Register user in ADHD leaderboard index
    await kv.sadd('adhd-games:users', userId)

    return { isNewHighScore, stats: currentStats }
  } catch (error) {
    console.error("[ADHD Stats] Error saving score:", error)
    throw error
  }
}

/**
 * Get all users' ADHD game stats for leaderboard
 */
export async function getAllADHDGameStats(): Promise<ADHDUserStats[]> {
  try {
    // Get all registered ADHD game users
    const userIds = await kv.smembers('adhd-games:users')
    
    if (!userIds || userIds.length === 0) {
      return []
    }

    const users: ADHDUserStats[] = []

    for (const oderId of userIds) {
      const stats = await getADHDGameStats(oderId as string)
      if (stats.totalScore > 0) {
        users.push(stats)
      }
    }

    // Sort by total score descending
    users.sort((a, b) => b.totalScore - a.totalScore)

    return users
  } catch (error) {
    console.error("[ADHD Stats] Error getting all stats:", error)
    return []
  }
}

