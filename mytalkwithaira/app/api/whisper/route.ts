import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "nodejs"
export const maxDuration = 30

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    console.log("[Whisper API] Received transcription request")

    // Get the form data
    const formData = await request.formData()
    const audioFile = formData.get("file") as File

    if (!audioFile) {
      console.error("[Whisper API] No audio file provided")
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    console.log("[Whisper API] Audio file received:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    })

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
      console.error("[Whisper API] File too large:", audioFile.size)
      return NextResponse.json(
        { error: "Audio file too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = [
      "audio/webm",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/m4a",
      "audio/mp4",
      "audio/mpeg",
      "audio/mp3",
    ]

    if (!allowedTypes.includes(audioFile.type) && !audioFile.name.match(/\.(webm|wav|m4a|mp3|mp4)$/i)) {
      console.error("[Whisper API] Invalid file type:", audioFile.type)
      return NextResponse.json(
        { error: "Invalid audio format. Supported formats: webm, wav, m4a, mp3" },
        { status: 400 }
      )
    }

    console.log("[Whisper API] Sending to OpenAI Whisper...")

    // Convert File to format OpenAI expects
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a File-like object that OpenAI SDK accepts
    const file = new File([buffer], audioFile.name, { type: audioFile.type })

    // Call OpenAI Whisper API with optimizations for speed
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text", // Faster than JSON format
      language: "en", // Specify language for better accuracy and speed
      prompt: "Mental health conversation with Aira AI therapist.", // Context helps accuracy
    })

    console.log("[Whisper API] Transcription successful:", transcription)

    // Handle both text and JSON response formats
    const transcriptText = typeof transcription === 'string' ? transcription : transcription.text

    if (!transcriptText || transcriptText.trim() === "") {
      console.warn("[Whisper API] Empty transcription received")
      return NextResponse.json(
        { error: "Could not transcribe audio. Please try speaking more clearly." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      transcript: transcriptText.trim(),
    })
  } catch (error: any) {
    console.error("[Whisper API] Error:", error)

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "OpenAI API key is invalid" },
        { status: 500 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio. Please try again." },
      { status: 500 }
    )
  }
}

