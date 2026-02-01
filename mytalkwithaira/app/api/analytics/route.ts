/**
 * GET /api/analytics
 * Returns comprehensive analytics metrics for admin dashboard
 * Protected endpoint - should only be accessible to admins
 */

import { NextRequest, NextResponse } from "next/server"
import { redis, executeWithRetry } from "@/lib/redis"

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll use a simple API key check
    const apiKey = req.headers.get("x-api-key")
    const validApiKey = process.env.ANALYTICS_API_KEY || "aira-admin-2024"
    
    if (apiKey !== validApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]
    const thisWeek = getWeekKey()
    const thisMonth = getMonthKey()

    // Fetch all metrics in parallel
    const [
      // User metrics
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersToday,
      activeUsersThisWeek,
      activeUsersThisMonth,

      // Usage metrics
      totalChats,
      chatsToday,
      chatsThisWeek,
      chatsThisMonth,
      totalMessages,
      messagesToday,

      // Plan metrics
      freeUsers,
      plusUsers,
      premiumUsers,
    ] = await Promise.all([
      // User metrics
      executeWithRetry(() => redis.scard("analytics:users:all"), "analytics:totalUsers"),
      executeWithRetry(() => redis.scard(`analytics:signups:${today}`), "analytics:newToday"),
      executeWithRetry(() => redis.scard(`analytics:signups:${thisWeek}`), "analytics:newWeek"),
      executeWithRetry(() => redis.scard(`analytics:signups:${thisMonth}`), "analytics:newMonth"),
      executeWithRetry(() => redis.scard(`analytics:active:${today}`), "analytics:activeToday"),
      executeWithRetry(() => redis.scard(`analytics:active:${thisWeek}`), "analytics:activeWeek"),
      executeWithRetry(() => redis.scard(`analytics:active:${thisMonth}`), "analytics:activeMonth"),

      // Usage metrics
      executeWithRetry(() => redis.get("analytics:chats:total"), "analytics:totalChats"),
      executeWithRetry(() => redis.get(`analytics:chats:${today}`), "analytics:chatsToday"),
      executeWithRetry(() => redis.get(`analytics:chats:${thisWeek}`), "analytics:chatsWeek"),
      executeWithRetry(() => redis.get(`analytics:chats:${thisMonth}`), "analytics:chatsMonth"),
      executeWithRetry(() => redis.get("analytics:messages:total"), "analytics:totalMessages"),
      executeWithRetry(() => redis.get(`analytics:messages:${today}`), "analytics:messagesToday"),

      // Plan metrics
      executeWithRetry(() => redis.scard("analytics:plans:free"), "analytics:freeUsers"),
      executeWithRetry(() => redis.scard("analytics:plans:plus"), "analytics:plusUsers"),
      executeWithRetry(() => redis.scard("analytics:plans:premium"), "analytics:premiumUsers"),
    ])

    // Calculate derived metrics
    const totalUsersNum = Number(totalUsers) || 0
    const totalChatsNum = Number(totalChats) || 0
    const totalMessagesNum = Number(totalMessages) || 0
    const plusUsersNum = Number(plusUsers) || 0
    const premiumUsersNum = Number(premiumUsers) || 0

    const averageChatsPerUser = totalUsersNum > 0 ? totalChatsNum / totalUsersNum : 0
    const averageMessagesPerChat = totalChatsNum > 0 ? totalMessagesNum / totalChatsNum : 0
    
    // Revenue calculation (£4.99 for Plus, £2.99 for Premium)
    const monthlyRecurringRevenue = (plusUsersNum * 4.99) + (premiumUsersNum * 2.99)

    const metrics = {
      // User Metrics
      totalUsers: totalUsersNum,
      newUsersToday: Number(newUsersToday) || 0,
      newUsersThisWeek: Number(newUsersThisWeek) || 0,
      newUsersThisMonth: Number(newUsersThisMonth) || 0,
      activeUsersToday: Number(activeUsersToday) || 0,
      activeUsersThisWeek: Number(activeUsersThisWeek) || 0,
      activeUsersThisMonth: Number(activeUsersThisMonth) || 0,

      // Usage Metrics
      totalChats: totalChatsNum,
      chatsToday: Number(chatsToday) || 0,
      chatsThisWeek: Number(chatsThisWeek) || 0,
      chatsThisMonth: Number(chatsThisMonth) || 0,
      totalMessages: totalMessagesNum,
      messagesToday: Number(messagesToday) || 0,

      // Engagement Metrics
      averageChatsPerUser: Math.round(averageChatsPerUser * 100) / 100,
      averageMessagesPerChat: Math.round(averageMessagesPerChat * 100) / 100,
      dailyActiveUsers: Number(activeUsersToday) || 0,
      weeklyActiveUsers: Number(activeUsersThisWeek) || 0,
      monthlyActiveUsers: Number(activeUsersThisMonth) || 0,

      // Revenue Metrics
      totalSubscribers: plusUsersNum + premiumUsersNum,
      freeUsers: Number(freeUsers) || 0,
      plusUsers: plusUsersNum,
      premiumUsers: premiumUsersNum,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      period: {
        today,
        thisWeek,
        thisMonth,
      },
    }

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
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

