import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    // Check if user has tracked mood today
    const { data: moodData } = await supabase
      .from("mood_entries")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .limit(1)

    // Check if user has viewed affirmation today
    const { data: affirmationData } = await supabase
      .from("affirmation_views")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .limit(1)

    // Check if user has chatted today
    const { data: chatData } = await supabase
      .from("messages")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .limit(1)

    const goals = [
      {
        id: "track-mood",
        label: "Track Mood",
        completed: (moodData?.length || 0) > 0,
      },
      {
        id: "view-affirmation",
        label: "View Affirmation",
        completed: (affirmationData?.length || 0) > 0,
      },
      {
        id: "chat-with-aira",
        label: "Chat with Aira",
        completed: (chatData?.length || 0) > 0,
      },
    ]

    return NextResponse.json({
      success: true,
      goals,
    })
  } catch (error) {
    console.error("Error fetching daily goals:", error)
    return NextResponse.json({
      success: true,
      goals: [
        { id: "track-mood", label: "Track Mood", completed: false },
        { id: "view-affirmation", label: "View Affirmation", completed: false },
        { id: "chat-with-aira", label: "Chat with Aira", completed: false },
      ],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, goalId } = body

    if (!userId || !goalId) {
      return NextResponse.json({ error: "Missing userId or goalId" }, { status: 400 })
    }

    // Goals are automatically tracked through their respective actions
    // This endpoint is here for future manual tracking if needed

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating daily goal:", error)
    return NextResponse.json({ error: "Failed to update daily goal" }, { status: 500 })
  }
}

