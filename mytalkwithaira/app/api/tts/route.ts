import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "Text is too long. Maximum 4096 characters." },
        { status: 400 }
      )
    }

    console.log("[TTS API] Generating speech for text:", text.substring(0, 50) + "...")

    // Use OpenAI's TTS with a calm, therapeutic voice
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // Fast model for real-time responses
      voice: "nova", // Warm, calm female voice (closest to therapeutic)
      input: text,
      speed: 0.88, // Slightly slower for calming effect
    })

    console.log("[TTS API] Speech generated successfully")

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("[TTS API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate speech" },
      { status: 500 }
    )
  }
}

