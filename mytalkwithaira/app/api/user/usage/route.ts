/**
 * GET /api/user/usage
 * Fetches the user's current usage stats (chat count, remaining chats, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { getTodayChatCount, canSendChat } from "@/lib/usage-limits"
import { getUserProfile } from "@/lib/user-profile-registry"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    console.log("[User Usage API] Fetching usage for:", userId)

    // Get user's plan
    const userProfile = await getUserProfile(userId)
    const userPlan = userProfile?.plan || "free"

    // Get usage stats
    const { allowed, remaining, limit } = await canSendChat(userId, userPlan)
    const used = await getTodayChatCount(userId)

    console.log("[User Usage API] Usage stats:", { plan: userPlan, used, remaining, limit })

    return NextResponse.json({
      success: true,
      plan: userPlan,
      used,
      remaining,
      limit,
      allowed,
    })
  } catch (error) {
    console.error("[User Usage API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    )
  }
}

