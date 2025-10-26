import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { AIRA_SYSTEM_PROMPT } from "@/lib/aira-system-prompt"
import {
  isMockMode,
  generateMockAIResponse,
  simulateNetworkDelay,
  getOrCreateMockSession,
} from "@/lib/mock-services"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
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
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: AIRA_SYSTEM_PROMPT,
        },
        ...formattedMessages,
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
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
