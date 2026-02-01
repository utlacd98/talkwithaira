import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export const runtime = "edge"

/**
 * Admin endpoint to get user statistics
 * GET /api/admin/stats
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Admin Stats] Fetching user statistics...")

    // Get all user profile keys
    const userKeys = await kv.keys("user:*:profile")
    console.log(`[Admin Stats] Found ${userKeys.length} user profiles`)

    if (userKeys.length === 0) {
      return NextResponse.json({
        total: 0,
        free: 0,
        plus: 0,
        premium: 0,
        breakdown: {
          free: 0,
          plus: 0,
          premium: 0,
        },
        percentages: {
          free: 0,
          plus: 0,
          premium: 0,
        },
      })
    }

    // Fetch all user profiles
    const profiles = await Promise.all(
      userKeys.map(async (key) => {
        const profile = await kv.hgetall(key)
        return profile
      })
    )

    // Count users by plan
    let freeCount = 0
    let plusCount = 0
    let premiumCount = 0

    profiles.forEach((profile) => {
      if (!profile || Object.keys(profile).length === 0) return

      const plan = (profile.plan as string) || "free"
      
      if (plan === "free") {
        freeCount++
      } else if (plan === "plus") {
        plusCount++
      } else if (plan === "premium") {
        premiumCount++
      }
    })

    const total = freeCount + plusCount + premiumCount

    // Calculate percentages
    const percentages = {
      free: total > 0 ? Math.round((freeCount / total) * 100) : 0,
      plus: total > 0 ? Math.round((plusCount / total) * 100) : 0,
      premium: total > 0 ? Math.round((premiumCount / total) * 100) : 0,
    }

    console.log("[Admin Stats] Statistics:", {
      total,
      free: freeCount,
      plus: plusCount,
      premium: premiumCount,
    })

    return NextResponse.json({
      total,
      free: freeCount,
      plus: plusCount,
      premium: premiumCount,
      breakdown: {
        free: freeCount,
        plus: plusCount,
        premium: premiumCount,
      },
      percentages,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Admin Stats] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}

