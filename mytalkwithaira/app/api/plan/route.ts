/**
 * PATCH /api/plan
 * Updates subscription plan (called by Stripe webhook or user action)
 */

import { NextRequest, NextResponse } from "next/server"
import { updatePlan, getUserStats } from "@/lib/redis"

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { plan } = body

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 })
    }

    const validPlans = ["Free", "Plus", "Premium"]
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Plan must be one of: ${validPlans.join(", ")}` },
        { status: 400 }
      )
    }

    console.log("[Plan API] Updating plan for user:", userId, "Plan:", plan)

    await updatePlan(userId, plan)

    const updatedStats = await getUserStats(userId)

    return NextResponse.json(
      {
        success: true,
        message: "Plan updated successfully",
        data: updatedStats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Plan API] Error:", error)
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    )
  }
}

