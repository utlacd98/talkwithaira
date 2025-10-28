/**
 * GET /api/affirmations
 * Generates personalized affirmations based on user's mood and conversation history
 */

import { NextRequest, NextResponse } from "next/server"
import { getMoodHistory, getMoodStats } from "@/lib/redis"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[Affirmations API] Generating personalized affirmation for user:", userId)

    // Get user's mood data
    const moodHistory = await getMoodHistory(userId, 7) // Last 7 entries
    const moodStats = await getMoodStats(userId, 30) // Last 30 days

    // Generate personalized affirmation using AI
    const affirmation = await generatePersonalizedAffirmation(moodHistory, moodStats)

    return NextResponse.json(
      {
        success: true,
        affirmation,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Affirmations API] Error:", error)
    
    // Fallback to a generic affirmation
    const fallbackAffirmations = [
      "You are worthy of love, care, and compassion—especially from yourself.",
      "Every step you take, no matter how small, is progress worth celebrating.",
      "Your journey is unique, and you're exactly where you need to be right now.",
      "You have the strength to handle whatever comes your way today.",
      "It's okay to rest. Taking care of yourself is not selfish—it's necessary.",
    ]
    
    return NextResponse.json(
      {
        success: true,
        affirmation: fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)],
      },
      { status: 200 }
    )
  }
}

async function generatePersonalizedAffirmation(
  moodHistory: Array<{ score: number; timestamp: string; note?: string }>,
  moodStats: {
    average: number
    highest: number
    lowest: number
    trend: "improving" | "declining" | "stable"
    totalEntries: number
  }
): Promise<string> {
  try {
    // Build context from mood data
    const currentMood = moodHistory[0]?.score || 5
    const recentMoods = moodHistory.slice(0, 3).map(m => m.score)
    
    let moodContext = ""
    if (currentMood < 4) {
      moodContext = "The user is currently experiencing low mood."
    } else if (currentMood < 7) {
      moodContext = "The user is currently in a moderate mood state."
    } else {
      moodContext = "The user is currently experiencing positive mood."
    }

    let trendContext = ""
    if (moodStats.trend === "improving") {
      trendContext = "Their mood has been improving recently."
    } else if (moodStats.trend === "declining") {
      trendContext = "They've been facing some challenges lately."
    } else {
      trendContext = "Their mood has been relatively stable."
    }

    const prompt = `You are a compassionate mental health companion. Generate a personalized, encouraging affirmation for someone based on their emotional state.

Context:
- ${moodContext}
- ${trendContext}
- Recent mood scores: ${recentMoods.join(", ")}/10
- 30-day average: ${moodStats.average}/10

Guidelines:
- Keep it to 1-2 sentences (max 30 words)
- Be warm, genuine, and encouraging
- Acknowledge their current state without being patronizing
- Focus on strength, resilience, or self-compassion
- Avoid clichés or overly generic statements
- Make it feel personal and meaningful

Generate the affirmation:`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a compassionate mental health companion who creates personalized, meaningful affirmations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    const affirmation = response.choices[0]?.message?.content?.trim() || ""
    
    // Remove quotes if the AI added them
    return affirmation.replace(/^["']|["']$/g, "")
  } catch (error) {
    console.error("[Affirmations] Error generating with AI:", error)
    
    // Fallback affirmations based on mood
    const fallbacks = {
      low: "You're navigating difficult waters with courage. That strength is real, even when you can't feel it.",
      medium: "You're doing better than you think. Every moment of showing up for yourself counts.",
      high: "Your resilience is shining through. This positive energy you're feeling is well-deserved.",
    }
    
    const currentMood = moodHistory[0]?.score || 5
    if (currentMood < 4) return fallbacks.low
    if (currentMood < 7) return fallbacks.medium
    return fallbacks.high
  }
}

