/**
 * POST /api/admin/upgrade
 * Admin endpoint to manually upgrade a user to premium
 * Protected by admin secret
 */

import { NextRequest, NextResponse } from "next/server"
import { updateUserPlanByEmail } from "@/lib/user-profile-registry"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, secret, plan = "premium" } = body

    // Simple secret protection - use ADMIN_SECRET env var or fallback
    const adminSecret = process.env.ADMIN_SECRET || "aira-admin-2024"
    
    if (secret !== adminSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    console.log("[Admin Upgrade] Upgrading user:", email, "to:", plan)

    const success = await updateUserPlanByEmail(email, plan)

    if (success) {
      console.log("[Admin Upgrade] ✅ User upgraded successfully:", email)
      return NextResponse.json({
        success: true,
        message: `User ${email} upgraded to ${plan}`,
      })
    } else {
      console.log("[Admin Upgrade] ❌ Failed to upgrade user:", email)
      return NextResponse.json(
        { error: "Failed to upgrade user - user may not exist in Redis" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("[Admin Upgrade] Error:", error)
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    )
  }
}

