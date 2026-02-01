import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const days = parseInt(searchParams.get("days") || "7")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get mood entries for the date range
    const { data: moodData, error } = await supabase
      .from("mood_entries")
      .select("score, created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching mood history:", error)
      return NextResponse.json({
        success: true,
        history: [],
      })
    }

    // Group by date and calculate average mood per day
    const moodByDate: Record<string, { total: number; count: number }> = {}

    moodData?.forEach((entry) => {
      const date = new Date(entry.created_at).toISOString().split("T")[0]
      if (!moodByDate[date]) {
        moodByDate[date] = { total: 0, count: 0 }
      }
      moodByDate[date].total += entry.score
      moodByDate[date].count += 1
    })

    // Create array of last N days with mood data
    const history = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      if (moodByDate[dateStr]) {
        const avgScore = moodByDate[dateStr].total / moodByDate[dateStr].count
        history.push({
          date: dateStr,
          score: Math.round(avgScore * 10) / 10, // Round to 1 decimal
          label: getMoodLabel(avgScore),
        })
      }
    }

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error("Error fetching mood history:", error)
    return NextResponse.json({
      success: true,
      history: [],
    })
  }
}

function getMoodLabel(score: number): string {
  if (score < 2) return "Very Low"
  if (score < 4) return "Low"
  if (score < 6) return "Moderate"
  if (score < 8) return "Good"
  return "Excellent"
}

