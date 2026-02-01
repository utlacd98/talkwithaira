/**
 * Usage Limits for Free vs Premium Plans
 * Enforces daily chat limits and feature access
 */

import { kv } from "@vercel/kv"

export const PLAN_LIMITS = {
  free: {
    dailyChats: 5, // 5 messages/day for free users
    moodHistory: 7, // days
    advancedInsights: false,
    allGames: false,
    dailyADHDGames: 1, // 1 game play per day for free users
  },
  plus: {
    dailyChats: 50,
    moodHistory: 30, // days
    advancedInsights: true,
    allGames: true,
    dailyADHDGames: Infinity, // Unlimited for Plus
  },
  premium: {
    dailyChats: Infinity, // Unlimited for £6.99/month subscribers
    moodHistory: Infinity,
    advancedInsights: true,
    allGames: true,
    dailyADHDGames: Infinity, // Unlimited for Premium
  },
} as const

/**
 * Get today's date key for Redis (YYYY-MM-DD)
 */
function getTodayKey(): string {
  const now = new Date()
  return now.toISOString().split("T")[0]
}

/**
 * Get user's chat count for today
 */
export async function getTodayChatCount(userId: string): Promise<number> {
  try {
    const today = getTodayKey()
    const key = `user:${userId}:chats:${today}`
    const count = await kv.get<number>(key)
    return count || 0
  } catch (error) {
    console.error("[Usage Limits] Error getting chat count:", error)
    return 0
  }
}

/**
 * Increment user's chat count for today
 */
export async function incrementChatCount(userId: string): Promise<number> {
  try {
    const today = getTodayKey()
    const key = `user:${userId}:chats:${today}`
    
    // Increment and set expiry to end of day (24 hours from now)
    const newCount = await kv.incr(key)
    
    // Set expiry to 48 hours to be safe (will auto-delete after 2 days)
    await kv.expire(key, 60 * 60 * 48)
    
    return newCount
  } catch (error) {
    console.error("[Usage Limits] Error incrementing chat count:", error)
    return 0
  }
}

/**
 * Check if user can send a chat message
 */
export async function canSendChat(
  userId: string,
  plan: "free" | "plus" | "premium"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const limit = PLAN_LIMITS[plan].dailyChats
    
    // Premium has unlimited chats
    if (limit === Infinity) {
      return {
        allowed: true,
        remaining: Infinity,
        limit: Infinity,
      }
    }
    
    const count = await getTodayChatCount(userId)
    const remaining = Math.max(0, limit - count)
    
    return {
      allowed: count < limit,
      remaining,
      limit,
    }
  } catch (error) {
    console.error("[Usage Limits] Error checking chat limit:", error)
    // On error, allow the chat (fail open)
    return {
      allowed: true,
      remaining: 0,
      limit: PLAN_LIMITS[plan].dailyChats,
    }
  }
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  plan: "free" | "plus" | "premium",
  feature: "advancedInsights" | "allGames"
): boolean {
  return PLAN_LIMITS[plan][feature]
}

/**
 * Get mood history limit in days
 */
export function getMoodHistoryLimit(plan: "free" | "plus" | "premium"): number {
  return PLAN_LIMITS[plan].moodHistory
}

