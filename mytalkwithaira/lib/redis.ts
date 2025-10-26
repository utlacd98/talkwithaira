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
  maxRetries: 3,
  retryDelayMs: 500,
  timeoutMs: 30000, // 30 second timeout
}

/**
 * Execute Redis operation with retry logic
 */
async function executeWithRetry<T>(
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

    return {
      conversations: parseInt(stats.conversations as string) || 0,
      mood_score: parseFloat(stats.mood_score as string) || 0,
      days_active: parseInt(stats.days_active as string) || 0,
      recent_conversations: JSON.parse((stats.recent_conversations as string) || "[]"),
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

