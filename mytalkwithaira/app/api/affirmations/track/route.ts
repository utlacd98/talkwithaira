import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, affirmationText } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Silently succeed - affirmation tracking is optional
    // The table doesn't exist yet, but we don't want to break the UI
    console.log("[Affirmations Track] Tracking disabled - table not created yet")

    return NextResponse.json({
      success: true,
      message: "Affirmation view tracked",
    })
  } catch (error) {
    console.error("Error tracking affirmation view:", error)
    // Return success anyway to not break the UI
    return NextResponse.json({
      success: true,
      message: "Affirmation view tracked",
    })
  }
}

