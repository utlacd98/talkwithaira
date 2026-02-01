/**
 * Redis Client Configuration for Vercel
 * Uses @vercel/kv for serverless compatibility
 * Includes retry logic, timeout handling, and health checks
 */

import { kv } from "@vercel/kv"

// Export kv as redis for compatibility
export const redis = kv

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelayMs: 300,
  timeoutMs: 3000, // 3 second timeout (Vercel free tier has 10s function timeout)
}

/**
 * Execute Redis operation with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  retries = 0
): Promise<T> {
  try {
    // Set timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Redis operation timeout")), RETRY_CONFIG.timeoutMs)
    )

    return await Promise.race([operation(), timeoutPromise])
  } catch (error) {
    if (retries < RETRY_CONFIG.maxRetries) {
      console.warn(
        `[Redis] ${operationName} failed (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries}), retrying...`,
        error instanceof Error ? error.message : error
      )
      await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.retryDelayMs))
      return executeWithRetry(operation, operationName, retries + 1)
    }

    console.error(`[Redis] ${operationName} failed after ${RETRY_CONFIG.maxRetries} retries:`, error)
    throw error
  }
}

/**
 * User Stats Interface
 */
export interface UserStats {
  conversations: number
  mood_score: number
  days_active: number
  recent_conversations: Array<{
    timestamp: string
    summary: string
  }>
  plan: "Free" | "Plus" | "Premium"
}

/**
 * Mood Entry Interface
 */
export interface MoodEntry {
  score: number
  timestamp: string
  note?: string
}

/**
 * Create initial stats for a new user
 */
export async function createUserStats(userId: string): Promise<UserStats> {
  const initialStats: UserStats = {
    conversations: 0,
    mood_score: 0,
    days_active: 1,
    recent_conversations: [],
    plan: "Free",
  }

  try {
    const key = `user:${userId}:stats`

    // Use retry logic for Redis operation
    await executeWithRetry(
      () =>
        redis.hset(key, {
          conversations: 0,
          mood_score: 0,
          days_active: 1,
          recent_conversations: JSON.stringify([]),
          plan: "Free",
        }),
      `createUserStats(${userId})`
    )

    console.log("[Redis] Created stats for user:", userId)
    return initialStats
  } catch (error) {
    console.error("[Redis] Error creating user stats:", error)
    throw error
  }
}

/**
 * Get user stats from Redis
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const key = `user:${userId}:stats`

    // Use retry logic for Redis operation
    const stats = await executeWithRetry(
      () => redis.hgetall(key),
      `getUserStats(${userId})`
    )

    if (!stats || Object.keys(stats).length === 0) {
      console.log("[Redis] No stats found for user:", userId)
      return null
    }

    // Safely parse recent_conversations
    let recentConversations = []
    try {
      const recentConvStr = stats.recent_conversations
      if (typeof recentConvStr === 'string') {
        const trimmed = recentConvStr.trim()
        if (trimmed) {
          recentConversations = JSON.parse(trimmed)
        }
      } else if (Array.isArray(recentConvStr)) {
        // Already an array
        recentConversations = recentConvStr
      }
    } catch (parseError) {
      console.error("[Redis] Error parsing recent_conversations:", parseError, "Type:", typeof stats.recent_conversations)
      recentConversations = []
    }

    return {
      conversations: parseInt(stats.conversations as string) || 0,
      mood_score: parseFloat(stats.mood_score as string) || 0,
      days_active: parseInt(stats.days_active as string) || 0,
      recent_conversations: recentConversations,
      plan: (stats.plan as "Free" | "Plus" | "Premium") || "Free",
    }
  } catch (error) {
    console.error("[Redis] Error getting user stats:", error)
    return null
  }
}

/**
 * Increment conversations count
 */
export async function incrementConversations(userId: string): Promise<number> {
  try {
    const key = `user:${userId}:stats`
    const result = await executeWithRetry(
      () => redis.hincrby(key, "conversations", 1),
      `incrementConversations(${userId})`
    )
    console.log("[Redis] Incremented conversations for user:", userId, "New count:", result)
    return result
  } catch (error) {
    console.error("[Redis] Error incrementing conversations:", error)
    throw error
  }
}

/**
 * Increment days active (call once per day)
 */
export async function incrementDaysActive(userId: string): Promise<number> {
  try {
    const key = `user:${userId}:stats`
    const result = await executeWithRetry(
      () => redis.hincrby(key, "days_active", 1),
      `incrementDaysActive(${userId})`
    )
    console.log("[Redis] Incremented days active for user:", userId, "New count:", result)
    return result
  } catch (error) {
    console.error("[Redis] Error incrementing days active:", error)
    throw error
  }
}

/**
 * Update mood score
 */
export async function updateMoodScore(userId: string, score: number): Promise<void> {
  try {
    if (score < 0 || score > 10) {
      throw new Error("Mood score must be between 0 and 10")
    }
    const key = `user:${userId}:stats`
    await executeWithRetry(
      () => redis.hset(key, { mood_score: score }),
      `updateMoodScore(${userId})`
    )
    console.log("[Redis] Updated mood score for user:", userId, "Score:", score)
  } catch (error) {
    console.error("[Redis] Error updating mood score:", error)
    throw error
  }
}

/**
 * Add recent conversation
 */
export async function addRecentConversation(
  userId: string,
  summary: string
): Promise<Array<{ timestamp: string; summary: string }>> {
  try {
    const key = `user:${userId}:stats`
    const stats = await getUserStats(userId)

    if (!stats) {
      throw new Error("User stats not found")
    }

    const newEntry = {
      timestamp: new Date().toISOString(),
      summary,
    }

    // Prepend new entry and keep last 3
    const updated = [newEntry, ...stats.recent_conversations].slice(0, 3)

    await executeWithRetry(
      () => redis.hset(key, { recent_conversations: JSON.stringify(updated) }),
      `addRecentConversation(${userId})`
    )
    console.log("[Redis] Added recent conversation for user:", userId)
    return updated
  } catch (error) {
    console.error("[Redis] Error adding recent conversation:", error)
    throw error
  }
}

/**
 * Update subscription plan
 */
export async function updatePlan(userId: string, plan: "Free" | "Plus" | "Premium"): Promise<void> {
  try {
    const key = `user:${userId}:stats`
    await executeWithRetry(
      () => redis.hset(key, { plan }),
      `updatePlan(${userId})`
    )
    console.log("[Redis] Updated plan for user:", userId, "Plan:", plan)
  } catch (error) {
    console.error("[Redis] Error updating plan:", error)
    throw error
  }
}

/**
 * Delete user stats (on account deletion)
 */
export async function deleteUserStats(userId: string): Promise<void> {
  try {
    const key = `user:${userId}:stats`
    await executeWithRetry(
      () => redis.del(key),
      `deleteUserStats(${userId})`
    )
    console.log("[Redis] Deleted stats for user:", userId)
  } catch (error) {
    console.error("[Redis] Error deleting user stats:", error)
    throw error
  }
}

/**
 * Check if user has stats (for first-time login detection)
 */
export async function userStatsExist(userId: string): Promise<boolean> {
  try {
    const key = `user:${userId}:stats`
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    console.error("[Redis] Error checking user stats existence:", error)
    return false
  }
}

/**
 * Health check - verify Redis connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await executeWithRetry(
      () => redis.set("health-check", "ok", { ex: 10 }),
      "healthCheck"
    )
    const result = await executeWithRetry(
      () => redis.get("health-check"),
      "healthCheck-verify"
    )
    console.log("[Redis] Health check passed")
    return result === "ok"
  } catch (error) {
    console.error("[Redis] Health check failed:", error)
    return false
  }
}

/**
 * Add a mood entry to user's mood history
 * Stores entries in a sorted set with timestamp as score
 */
export async function addMoodEntry(userId: string, score: number, note?: string): Promise<void> {
  try {
    if (score < 0 || score > 10) {
      throw new Error("Mood score must be between 0 and 10")
    }

    const timestamp = new Date().toISOString()
    const entry: MoodEntry = {
      score,
      timestamp,
      note,
    }

    const key = `user:${userId}:mood_history`
    const timestampScore = Date.now()

    // Add to sorted set (sorted by timestamp)
    await executeWithRetry(
      () => redis.zadd(key, { score: timestampScore, member: JSON.stringify(entry) }),
      `addMoodEntry(${userId})`
    )

    // Also update current mood score in stats
    await updateMoodScore(userId, score)

    console.log("[Redis] Added mood entry for user:", userId, "Score:", score)
  } catch (error) {
    console.error("[Redis] Error adding mood entry:", error)
    throw error
  }
}

/**
 * Get mood history for a user
 * Returns entries sorted by timestamp (newest first)
 */
export async function getMoodHistory(
  userId: string,
  limit: number = 30
): Promise<MoodEntry[]> {
  try {
    const key = `user:${userId}:mood_history`

    // Get entries from sorted set (newest first)
    const entries = await executeWithRetry(
      () => redis.zrange(key, -limit, -1, { rev: true }),
      `getMoodHistory(${userId})`
    )

    if (!entries || entries.length === 0) {
      return []
    }

    // Safely parse each entry
    return entries
      .map((entry) => {
        try {
          // Handle different types of entries
          if (typeof entry === 'string') {
            const trimmed = entry.trim()
            if (trimmed) {
              return JSON.parse(trimmed) as MoodEntry
            }
          } else if (typeof entry === 'object' && entry !== null) {
            // Entry is already an object
            return entry as MoodEntry
          }
          return null
        } catch (parseError) {
          console.error("[Redis] Error parsing mood entry:", parseError, "Entry type:", typeof entry)
          return null
        }
      })
      .filter((entry): entry is MoodEntry => entry !== null)
  } catch (error) {
    console.error("[Redis] Error getting mood history:", error)
    return []
  }
}

/**
 * Get mood statistics for a user
 */
export async function getMoodStats(userId: string, days: number = 30): Promise<{
  average: number
  highest: number
  lowest: number
  trend: "improving" | "declining" | "stable"
  totalEntries: number
}> {
  try {
    const entries = await getMoodHistory(userId, days * 2) // Get more entries to ensure we have enough

    if (entries.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        trend: "stable",
        totalEntries: 0,
      }
    }

    // Filter entries from the last N days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const recentEntries = entries.filter(
      (entry) => new Date(entry.timestamp) >= cutoffDate
    )

    if (recentEntries.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        trend: "stable",
        totalEntries: 0,
      }
    }

    const scores = recentEntries.map((e) => e.score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)

    // Calculate trend (compare first half vs second half)
    let trend: "improving" | "declining" | "stable" = "stable"
    if (recentEntries.length >= 4) {
      const midpoint = Math.floor(recentEntries.length / 2)
      const firstHalf = recentEntries.slice(midpoint).map((e) => e.score)
      const secondHalf = recentEntries.slice(0, midpoint).map((e) => e.score)
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

      if (secondAvg > firstAvg + 0.5) {
        trend = "improving"
      } else if (secondAvg < firstAvg - 0.5) {
        trend = "declining"
      }
    }

    return {
      average: Math.round(average * 10) / 10,
      highest,
      lowest,
      trend,
      totalEntries: recentEntries.length,
    }
  } catch (error) {
    console.error("[Redis] Error getting mood stats:", error)
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      trend: "stable",
      totalEntries: 0,
    }
  }
}
