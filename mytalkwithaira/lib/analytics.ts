/**
 * Analytics tracking system for Aira
 * Tracks user metrics, engagement, and revenue
 */

import { redis, executeWithRetry } from "./redis"

export interface AnalyticsMetrics {
  // User Metrics
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeUsersToday: number
  activeUsersThisWeek: number
  activeUsersThisMonth: number

  // Usage Metrics
  totalChats: number
  chatsToday: number
  chatsThisWeek: number
  chatsThisMonth: number
  totalMessages: number
  messagesToday: number

  // Engagement Metrics
  averageChatsPerUser: number
  averageMessagesPerChat: number
  moodTrackingRate: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number

  // Revenue Metrics
  totalSubscribers: number
  freeUsers: number
  plusUsers: number
  premiumUsers: number
  monthlyRecurringRevenue: number
  churnRate: number
}

/**
 * Track user signup
 */
export async function trackSignup(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const thisWeek = getWeekKey()
    const thisMonth = getMonthKey()

    await Promise.all([
      // Add to total users set
      executeWithRetry(() => redis.sadd("analytics:users:all", userId), "trackSignup:all"),
      
      // Add to daily signups
      executeWithRetry(() => redis.sadd(`analytics:signups:${today}`, userId), "trackSignup:daily"),
      
      // Add to weekly signups
      executeWithRetry(() => redis.sadd(`analytics:signups:${thisWeek}`, userId), "trackSignup:weekly"),
      
      // Add to monthly signups
      executeWithRetry(() => redis.sadd(`analytics:signups:${thisMonth}`, userId), "trackSignup:monthly"),
      
      // Increment total signups counter
      executeWithRetry(() => redis.incr("analytics:signups:total"), "trackSignup:counter"),
    ])

    console.log("[Analytics] Tracked signup for user:", userId)
  } catch (error) {
    console.error("[Analytics] Error tracking signup:", error)
  }
}

/**
 * Track user activity (login, chat, etc.)
 */
export async function trackActivity(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const thisWeek = getWeekKey()
    const thisMonth = getMonthKey()

    await Promise.all([
      // Add to daily active users
      executeWithRetry(() => redis.sadd(`analytics:active:${today}`, userId), "trackActivity:daily"),
      
      // Add to weekly active users
      executeWithRetry(() => redis.sadd(`analytics:active:${thisWeek}`, userId), "trackActivity:weekly"),
      
      // Add to monthly active users
      executeWithRetry(() => redis.sadd(`analytics:active:${thisMonth}`, userId), "trackActivity:monthly"),
    ])

    console.log("[Analytics] Tracked activity for user:", userId)
  } catch (error) {
    console.error("[Analytics] Error tracking activity:", error)
  }
}

/**
 * Track chat creation
 */
export async function trackChat(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const thisWeek = getWeekKey()
    const thisMonth = getMonthKey()

    await Promise.all([
      // Increment total chats
      executeWithRetry(() => redis.incr("analytics:chats:total"), "trackChat:total"),
      
      // Increment daily chats
      executeWithRetry(() => redis.incr(`analytics:chats:${today}`), "trackChat:daily"),
      
      // Increment weekly chats
      executeWithRetry(() => redis.incr(`analytics:chats:${thisWeek}`), "trackChat:weekly"),
      
      // Increment monthly chats
      executeWithRetry(() => redis.incr(`analytics:chats:${thisMonth}`), "trackChat:monthly"),
      
      // Track user activity
      trackActivity(userId),
    ])

    console.log("[Analytics] Tracked chat for user:", userId)
  } catch (error) {
    console.error("[Analytics] Error tracking chat:", error)
  }
}

/**
 * Track message sent
 */
export async function trackMessage(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]

    await Promise.all([
      // Increment total messages
      executeWithRetry(() => redis.incr("analytics:messages:total"), "trackMessage:total"),
      
      // Increment daily messages
      executeWithRetry(() => redis.incr(`analytics:messages:${today}`), "trackMessage:daily"),
    ])
  } catch (error) {
    console.error("[Analytics] Error tracking message:", error)
  }
}

/**
 * Track subscription change
 */
export async function trackSubscription(userId: string, plan: "Free" | "Plus" | "Premium"): Promise<void> {
  try {
    // Remove from all plan sets
    await Promise.all([
      executeWithRetry(() => redis.srem("analytics:plans:free", userId), "trackSub:removeFree"),
      executeWithRetry(() => redis.srem("analytics:plans:plus", userId), "trackSub:removePlus"),
      executeWithRetry(() => redis.srem("analytics:plans:premium", userId), "trackSub:removePremium"),
    ])

    // Add to new plan set
    const planKey = `analytics:plans:${plan.toLowerCase()}`
    await executeWithRetry(() => redis.sadd(planKey, userId), "trackSub:add")

    console.log("[Analytics] Tracked subscription change for user:", userId, "Plan:", plan)
  } catch (error) {
    console.error("[Analytics] Error tracking subscription:", error)
  }
}

// Helper functions
function getWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)
  return `${year}-W${week.toString().padStart(2, "0")}`
}

function getMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

