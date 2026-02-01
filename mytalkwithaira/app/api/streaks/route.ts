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

    // Get mood streak (consecutive days with mood entries)
    const { data: moodData } = await supabase
      .from("mood_entries")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)

    // Get journal streak (consecutive days with journal entries)
    const { data: journalData } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)

    // Get chat streak (consecutive days with chat messages)
    const { data: chatData } = await supabase
      .from("messages")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100)

    // Calculate streaks
    const moodStreak = calculateStreak(moodData || [])
    const journalStreak = calculateStreak(journalData || [])
    const chatStreak = calculateStreak(chatData || [])

    const longestStreak = Math.max(moodStreak, journalStreak, chatStreak)

    return NextResponse.json({
      success: true,
      streaks: {
        moodStreak,
        journalStreak,
        chatStreak,
        longestStreak,
      },
    })
  } catch (error) {
    console.error("Error fetching streaks:", error)
    return NextResponse.json({
      success: true,
      streaks: {
        moodStreak: 0,
        journalStreak: 0,
        chatStreak: 0,
        longestStreak: 0,
      },
    })
  }
}

function calculateStreak(entries: Array<{ created_at: string }>): number {
  if (!entries || entries.length === 0) return 0

  const dates = entries.map((e) => new Date(e.created_at).toDateString())
  const uniqueDates = [...new Set(dates)]

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDates.length; i++) {
    const entryDate = new Date(uniqueDates[i])
    entryDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

