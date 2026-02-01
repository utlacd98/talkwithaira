/**
 * POST /api/analytics/track
 * Track user events (signup, login, chat, message, subscription)
 */

import { NextRequest, NextResponse } from "next/server"
import { trackSignup, trackActivity, trackChat, trackMessage, trackSubscription } from "@/lib/analytics"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, event, plan } = body

    if (!userId || !event) {
      return NextResponse.json(
        { error: "Missing userId or event" },
        { status: 400 }
      )
    }

    console.log("[Analytics Track] Event:", event, "User:", userId)

    switch (event) {
      case "signup":
        await trackSignup(userId)
        if (plan) {
          await trackSubscription(userId, plan)
        }
        break

      case "login":
        await trackActivity(userId)
        break

      case "chat":
        await trackChat(userId)
        break

      case "message":
        await trackMessage(userId)
        break

      case "subscription":
        if (plan) {
          await trackSubscription(userId, plan)
        }
        break

      default:
        return NextResponse.json(
          { error: "Invalid event type" },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics Track] Error:", error)
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    )
  }
}

