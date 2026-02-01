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
    const events: Array<{
      id: string
      type: "mood" | "chat" | "affirmation" | "badge" | "milestone"
      title: string
      description: string
      timestamp: string
      value?: number
    }> = []

    // Get recent mood entries
    const { data: moodData } = await supabase
      .from("mood_entries")
      .select("id, score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (moodData) {
      moodData.forEach((mood) => {
        events.push({
          id: `mood-${mood.id}`,
          type: "mood",
          title: "Mood Check-in",
          description: `Mood score: ${mood.score}/10`,
          timestamp: mood.created_at,
          value: mood.score,
        })
      })
    }

    // Get recent chat sessions
    const { data: chatData } = await supabase
      .from("messages")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(10)

    if (chatData) {
      chatData.forEach((chat) => {
        events.push({
          id: `chat-${chat.id}`,
          type: "chat",
          title: "Chat Session",
          description: chat.content.substring(0, 50) + (chat.content.length > 50 ? "..." : ""),
          timestamp: chat.created_at,
        })
      })
    }

    // Get recent affirmation views
    const { data: affirmationData } = await supabase
      .from("affirmation_views")
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (affirmationData) {
      affirmationData.forEach((affirmation) => {
        events.push({
          id: `affirmation-${affirmation.id}`,
          type: "affirmation",
          title: "Daily Affirmation",
          description: "Viewed your daily affirmation",
          timestamp: affirmation.created_at,
        })
      })
    }

    // Sort all events by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit to 20 most recent events
    const recentEvents = events.slice(0, 20)

    return NextResponse.json({
      success: true,
      events: recentEvents,
    })
  } catch (error) {
    console.error("Error fetching journey:", error)
    return NextResponse.json({
      success: true,
      events: [],
    })
  }
}

