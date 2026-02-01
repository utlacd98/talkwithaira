import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { AIRA_SYSTEM_PROMPT } from "@/lib/aira-system-prompt"
import {
  isMockMode,
  generateMockAIResponse,
  simulateNetworkDelay,
  getOrCreateMockSession,
} from "@/lib/mock-services"
import { canSendChat, incrementChatCount } from "@/lib/usage-limits"
import { getUserProfile } from "@/lib/user-profile-registry"

// Lazy initialization of OpenAI client to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, isVoiceMode } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Check usage limits for authenticated users
    if (userId && userId !== "anonymous") {
      try {
        // Get user's plan from Redis
        const userProfile = await getUserProfile(userId)
        const userPlan = userProfile?.plan || "free"

        // Check if user can send a chat
        const { allowed, remaining, limit } = await canSendChat(userId, userPlan)

        if (!allowed) {
          console.log(`[Chat API] User ${userId} exceeded daily limit (${limit} chats)`)
          return NextResponse.json(
            {
              error: "Daily chat limit reached",
              message: `You've reached your daily limit of ${limit} chats. Upgrade to Premium for unlimited chats!`,
              limit,
              remaining: 0,
              upgradeUrl: "/pricing",
            },
            { status: 429 }
          )
        }

        console.log(`[Chat API] User ${userId} has ${remaining} chats remaining (plan: ${userPlan})`)
      } catch (limitError) {
        console.warn("[Chat API] Error checking usage limits:", limitError)
        // Continue anyway - fail open
      }
    }

    // Mock mode: return simulated response
    if (isMockMode()) {
      await simulateNetworkDelay()
      const mockResponse = generateMockAIResponse(userId || "mock-user")
      if (userId) {
        getOrCreateMockSession(userId)
      }
      console.log(`[Chat API] Mock response for user: ${userId || "mock-user"}`)
      return NextResponse.json({ message: mockResponse.message, mock: true })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set")
      return NextResponse.json(
        { error: "API configuration error. Please check server configuration." },
        { status: 500 }
      )
    }

    // Convert messages to OpenAI format
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    // Call OpenAI API
    const openai = getOpenAIClient()

    // Modify system prompt for voice mode
    let systemPrompt = AIRA_SYSTEM_PROMPT
    if (isVoiceMode) {
      systemPrompt += `\n\n**VOICE MODE ACTIVE**: Keep your response under 100 words. Use short, gentle sentences (8-12 words). Add natural pauses with double line breaks. Speak conversationally - no lists or bullet points. Use a calming, supportive tone like a therapist speaking. Include breathing cues when helpful. End with a gentle question or invitation.`
    }

    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...formattedMessages,
      ],
      temperature: 0.7,
      max_tokens: isVoiceMode ? 200 : 500, // Shorter responses for voice
      top_p: 0.9,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    // Increment chat count for authenticated users
    if (userId && userId !== "anonymous") {
      try {
        const newCount = await incrementChatCount(userId)
        console.log(`[Chat API] Incremented chat count for user ${userId}: ${newCount}`)

        // Track message in analytics
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, event: "message" }),
        }).catch(err => console.warn("[Chat API] Failed to track message:", err))
      } catch (countError) {
        console.warn("[Chat API] Error incrementing chat count:", countError)
        // Don't fail the request if count increment fails
      }
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("[Aira Chat API] Error:", error)

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      }
      if (error.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
      }
      if (error.status === 500) {
        return NextResponse.json({ error: "OpenAI service error. Please try again later." }, { status: 503 })
      }
    }

    return NextResponse.json(
      { error: "Failed to process message. Please try again." },
      { status: 500 }
    )
  }
}
