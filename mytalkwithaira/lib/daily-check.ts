/**
 * Daily Check Utility
 * Handles daily login tracking and days_active increment
 */

import { redis } from "./redis"
import { incrementDaysActive } from "./redis"

/**
 * Check if user has logged in today
 * Returns true if this is their first login of the day
 */
export async function isFirstLoginOfDay(userId: string): Promise<boolean> {
  try {
    const key = `user:${userId}:last_login`
    const today = new Date().toDateString()

    // Get last login date
    const lastLogin = await redis.get(key)

    // If no last login or different day, it's a new day
    if (!lastLogin || lastLogin !== today) {
      // Update last login date
      await redis.set(key, today)
      return true
    }

    return false
  } catch (error) {
    console.error("[Daily Check] Error checking login:", error)
    return false
  }
}

/**
 * Handle daily login - increment days_active if first login of day
 */
export async function handleDailyLogin(userId: string): Promise<void> {
  try {
    const isFirstLogin = await isFirstLoginOfDay(userId)

    if (isFirstLogin) {
      await incrementDaysActive(userId)
      console.log("[Daily Check] Incremented days_active for user:", userId)
    }
  } catch (error) {
    console.error("[Daily Check] Error handling daily login:", error)
    // Don't throw - this is non-critical
  }
}

/**
 * Get user's login streak (consecutive days)
 * Note: This is a simplified version - production would need more logic
 */
export async function getLoginStreak(userId: string): Promise<number> {
  try {
    const key = `user:${userId}:stats`
    const stats = await redis.hget(key, "days_active")
    return parseInt(stats as string) || 0
  } catch (error) {
    console.error("[Daily Check] Error getting login streak:", error)
    return 0
  }
}

