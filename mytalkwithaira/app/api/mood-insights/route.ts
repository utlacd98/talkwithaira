/**
 * GET /api/mood-insights
 * Generates AI-powered insights from user's mood history
 */

import { NextRequest, NextResponse } from "next/server"
import { getMoodHistory, getMoodStats } from "@/lib/redis"
import OpenAI from "openai"

// Lazy initialization of OpenAI client to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[Mood Insights API] Generating insights for user:", userId)

    // Get user's mood data
    const moodHistory = await getMoodHistory(userId, 30) // Last 30 entries
    const moodStats = await getMoodStats(userId, 30) // Last 30 days

    if (moodHistory.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Not enough mood data yet. Track your mood for a few days to see insights.",
        },
        { status: 200 }
      )
    }

    // Generate insights using AI
    const insights = await generateMoodInsights(moodHistory, moodStats)

    return NextResponse.json(
      {
        success: true,
        insights,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Mood Insights API] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate mood insights" },
      { status: 500 }
    )
  }
}

async function generateMoodInsights(
  moodHistory: Array<{ score: number; timestamp: string; note?: string }>,
  moodStats: {
    average: number
    highest: number
    lowest: number
    trend: "improving" | "declining" | "stable"
    totalEntries: number
  }
) {
  try {
    // Prepare mood data for analysis
    const recentScores = moodHistory.slice(0, 14).map(m => m.score)
    const scoresByDay = groupMoodsByDay(moodHistory)
    
    const prompt = `You are an AI mental health analyst. Analyze this user's mood data and provide insights.

Mood Data:
- Total entries: ${moodStats.totalEntries}
- Average mood: ${moodStats.average}/10
- Highest: ${moodStats.highest}/10
- Lowest: ${moodStats.lowest}/10
- Trend: ${moodStats.trend}
- Recent scores (last 14 entries): ${recentScores.join(", ")}

Provide a JSON response with:
1. "summary": A 2-3 sentence compassionate summary of their emotional state
2. "patterns": Array of 2-3 specific patterns you notice (e.g., "Mood tends to be lower on weekdays")
3. "recommendations": Array of 2-3 actionable, personalized recommendations

Guidelines:
- Be compassionate and non-judgmental
- Focus on actionable insights
- Acknowledge both challenges and strengths
- Keep language warm and supportive
- Be specific based on the data

Return ONLY valid JSON in this exact format:
{
  "summary": "string",
  "patterns": ["string", "string"],
  "recommendations": ["string", "string"]
}`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a compassionate AI mental health analyst. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    })

    const aiResponse = response.choices[0]?.message?.content?.trim() || "{}"
    const parsed = JSON.parse(aiResponse)

    return {
      summary: parsed.summary || "Your mood data shows a unique pattern worth exploring.",
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      trend: moodStats.trend,
      averageMood: moodStats.average,
      moodRange: {
        highest: moodStats.highest,
        lowest: moodStats.lowest,
      },
    }
  } catch (error) {
    console.error("[Mood Insights] Error generating with AI:", error)

    // Fallback insights based on stats
    return generateFallbackInsights(moodStats)
  }
}

function generateFallbackInsights(moodStats: {
  average: number
  highest: number
  lowest: number
  trend: "improving" | "declining" | "stable"
  totalEntries: number
}) {
  const summary = moodStats.trend === "improving"
    ? `Your mood has been on an upward trajectory recently, with an average of ${moodStats.average}/10. This positive trend suggests you're making progress in your emotional well-being.`
    : moodStats.trend === "declining"
    ? `Your mood has been facing some challenges lately, averaging ${moodStats.average}/10. Remember that fluctuations are normal, and reaching out for support is a sign of strength.`
    : `Your mood has been relatively stable at ${moodStats.average}/10. This consistency can be a foundation to build upon as you continue your wellness journey.`

  const patterns = []
  const recommendations = []

  if (moodStats.average < 5) {
    patterns.push("Your average mood is below the midpoint, indicating you may be experiencing ongoing challenges")
    recommendations.push("Consider reaching out to a mental health professional for additional support")
    recommendations.push("Try incorporating small self-care activities into your daily routine")
  } else if (moodStats.average >= 7) {
    patterns.push("Your mood scores are consistently positive, showing strong emotional resilience")
    recommendations.push("Continue the practices that are working well for you")
    recommendations.push("Consider journaling about what contributes to your positive mood")
  } else {
    patterns.push("Your mood fluctuates within a moderate range, which is quite normal")
    recommendations.push("Track what activities or situations correlate with higher mood scores")
    recommendations.push("Build on moments when you feel better to create positive momentum")
  }

  const range = moodStats.highest - moodStats.lowest
  if (range > 5) {
    patterns.push("You experience significant mood variability, ranging from " + moodStats.lowest + " to " + moodStats.highest)
    recommendations.push("Identify triggers for both low and high moods to better understand your patterns")
  }

  return {
    summary,
    patterns: patterns.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    trend: moodStats.trend,
    averageMood: moodStats.average,
    moodRange: {
      highest: moodStats.highest,
      lowest: moodStats.lowest,
    },
  }
}

function groupMoodsByDay(moodHistory: Array<{ score: number; timestamp: string }>) {
  const grouped: { [key: string]: number[] } = {}
  
  moodHistory.forEach(entry => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(entry.score)
  })
  
  return grouped
}

