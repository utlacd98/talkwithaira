import { type NextRequest, NextResponse } from "next/server"
import {
  saveConversation,
  getConversation,
  getUserConversations,
  deleteConversation,
  type ChatMessage,
  type SavedChat,
} from "@/lib/vercel-kv"
import { incrementConversations, addRecentConversation } from "@/lib/redis"
import { isMockMode, generateMockSaveResponse, simulateNetworkDelay, getOrCreateMockSession } from "@/lib/mock-services"

interface SaveChatRequest {
  title?: string
  messages: ChatMessage[]
  userId?: string
  tags?: string[]
}

interface GetChatRequest {
  chatId: string
}

/**
 * In-memory fallback storage for when Vercel KV is unavailable
 * This persists across requests within the same deployment
 */
const IN_MEMORY_STORAGE: Map<string, SavedChat> = new Map()

/**
 * Save chat to in-memory fallback storage
 */
async function saveToFallback(chatId: string, userId: string, chat: SavedChat) {
  try {
    const key = `${userId}:${chatId}`
    IN_MEMORY_STORAGE.set(key, chat)
    console.log("[Storage] Saved chat to in-memory fallback storage:", key)
  } catch (error) {
    console.error("[Storage] Error saving to fallback:", error)
  }
}

/**
 * Load chats from in-memory fallback storage
 */
async function loadFromFallback(userId: string): Promise<SavedChat[]> {
  try {
    const chats: SavedChat[] = []

    for (const [key, chat] of IN_MEMORY_STORAGE.entries()) {
      if (key.startsWith(`${userId}:`)) {
        chats.push(chat)
        console.log("[Storage] Loaded chat from in-memory fallback:", key)
      }
    }

    return chats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("[Storage] Error loading from fallback:", error)
    return []
  }
}

/**
 * Delete chat from in-memory fallback storage
 */
async function deleteFromFallback(chatId: string, userId: string) {
  try {
    const key = `${userId}:${chatId}`
    if (IN_MEMORY_STORAGE.has(key)) {
      IN_MEMORY_STORAGE.delete(key)
      console.log("[Storage] Deleted chat from in-memory fallback:", key)
    }
  } catch (error) {
    console.error("[Storage] Error deleting from fallback:", error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveChatRequest = await req.json()

    console.log("[Save Chat API] Received request with", body.messages?.length || 0, "messages for user:", body.userId)

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error("[Save Chat API] Invalid messages format")
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    if (body.messages.length === 0) {
      console.error("[Save Chat API] Cannot save empty chat")
      return NextResponse.json({ error: "Cannot save empty chat" }, { status: 400 })
    }

    // Mock mode: return simulated save response
    if (isMockMode()) {
      await simulateNetworkDelay()
      const userId = body.userId || "mock-user"
      const mockResponse = generateMockSaveResponse(userId)
      getOrCreateMockSession(userId)
      console.log(`[Save Chat API] Mock save for user: ${userId}`)
      return NextResponse.json(mockResponse, { status: 201 })
    }

    // Generate chat ID and title
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const title = body.title || `Chat - ${new Date().toLocaleDateString()}`
    const userId = body.userId || "anonymous"

    console.log("[Save Chat API] Generated chatId:", chatId, "title:", title)

    // Extract intent/emotion tags from messages
    const autoTags = extractTags(body.messages)
    const allTags = [...new Set([...(body.tags || []), ...autoTags])]

    // Try to save to Vercel KV, fallback to file-based storage
    try {
      await saveConversation(chatId, userId, title, body.messages, allTags)
      console.log("[Save Chat API] Successfully saved to Vercel KV:", chatId)
    } catch (kvError) {
      console.warn("[Save Chat API] Vercel KV unavailable, using fallback storage:", kvError)
      // Fallback to file-based storage
      const chat: SavedChat = {
        id: chatId,
        title,
        messages: body.messages,
        tags: allTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: body.messages.length,
      }
      await saveToFallback(chatId, userId, chat)
      console.log("[Save Chat API] Successfully saved to file-based fallback storage:", chatId)
    }

    // Update user stats in Redis
    try {
      if (userId !== "anonymous") {
        // Increment conversations count
        await incrementConversations(userId)

        // Add to recent conversations
        const summary = title || `Chat with ${body.messages.length} messages`
        await addRecentConversation(userId, summary)
        console.log("[Save Chat API] Updated user stats for:", userId)
      }
    } catch (statsError) {
      console.warn("[Save Chat API] Failed to update stats:", statsError)
      // Don't fail the save if stats update fails
    }

    console.log("[Save Chat API] Returning success response for chatId:", chatId)
    return NextResponse.json({
      success: true,
      chatId,
      title,
      messageCount: body.messages.length,
      tags: allTags,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Save Chat API] Error:", error)
    return NextResponse.json(
      { error: "Failed to save chat. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const chatId = req.nextUrl.searchParams.get("chatId")
    const userId = req.nextUrl.searchParams.get("userId") || "anonymous"

    console.log("[Get Chat API] Request - chatId:", chatId, "userId:", userId)

    // If chatId is provided, return specific chat
    if (chatId) {
      let chat: SavedChat | null = null

      // Try Vercel KV first
      try {
        chat = await getConversation(chatId, userId)
        console.log("[Get Chat API] Found chat in Vercel KV:", chatId)
      } catch (kvError) {
        console.warn("[Get Chat API] Vercel KV unavailable, checking fallback:", kvError)
        // Check fallback storage
        try {
          const userDir = path.join(FALLBACK_STORAGE_DIR, userId)
          const filePath = path.join(userDir, `${chatId}.json`)
          const content = await fs.readFile(filePath, "utf-8")
          let fallbackChat = JSON.parse(content)

          // Decrypt if encrypted
          if (fallbackChat.encrypted && isEncrypted(fallbackChat.messages)) {
            try {
              fallbackChat = decryptChatObject(fallbackChat)
              console.log("[Get Chat API] Decrypted chat from fallback:", chatId)
            } catch (decryptError) {
              console.error("[Get Chat API] Error decrypting fallback chat:", decryptError)
              return NextResponse.json({ error: "Failed to decrypt chat" }, { status: 500 })
            }
          }

          chat = fallbackChat as SavedChat
          console.log("[Get Chat API] Retrieved chat from fallback storage:", chatId)
        } catch (fallbackError) {
          console.warn("[Get Chat API] Fallback storage also unavailable:", fallbackError)
        }
      }

      if (!chat) {
        console.warn("[Get Chat API] Chat not found:", chatId)
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
      }

      // Decrypt if encrypted (only needed for Vercel KV chats, fallback chats are already decrypted)
      if ((chat as any).encrypted && isEncrypted((chat as any).messages)) {
        try {
          const decrypted = decryptChatObject(chat as any)
          chat = decrypted as SavedChat
          console.log("[Get Chat API] Decrypted chat from Vercel KV:", chatId)
        } catch (decryptError) {
          console.error("[Get Chat API] Error decrypting chat:", decryptError)
          return NextResponse.json({ error: "Failed to decrypt chat" }, { status: 500 })
        }
      }

      console.log("[Get Chat API] Retrieved chat successfully:", chatId, "with", chat.messages?.length || 0, "messages")

      return NextResponse.json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          messages: chat.messages,
          tags: chat.tags,
          createdAt: chat.createdAt,
        },
      })
    }

    // Otherwise, return list of chats for user
    console.log("[Get Chats API] Fetching all chats for user:", userId)
    let chats: SavedChat[] = []

    // Try Vercel KV first
    try {
      chats = await getUserConversations(userId)
      console.log("[Get Chats API] Retrieved", chats.length, "chats from Vercel KV for user:", userId)
    } catch (kvError) {
      console.warn("[Get Chats API] Vercel KV unavailable, using file-based fallback:", kvError)
      // Use file-based fallback storage
      chats = await loadFromFallback(userId)
      console.log("[Get Chats API] Retrieved", chats.length, "chats from file storage for user:", userId)
    }

    return NextResponse.json({
      success: true,
      chats: chats || [],
      count: chats?.length || 0,
    })
  } catch (error) {
    console.error("[Get Chats API] Error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve chats. Please try again." },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const chatId = req.nextUrl.searchParams.get("chatId")
    const userId = req.nextUrl.searchParams.get("userId") || "anonymous"

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    // Try to delete from Vercel KV first
    try {
      await deleteConversation(chatId, userId)
      console.log("[Delete Chat API] Deleted from Vercel KV:", chatId)
    } catch (kvError) {
      console.warn("[Delete Chat API] Vercel KV unavailable, using file-based fallback:", kvError)
      // Delete from file-based fallback storage
      await deleteFromFallback(chatId, userId)
    }

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    })
  } catch (error) {
    console.error("[Delete Chat API] Error:", error)
    return NextResponse.json(
      { error: "Failed to delete chat. Please try again." },
      { status: 500 }
    )
  }
}

// Helper function to extract tags from messages
function extractTags(messages: ChatMessage[]): string[] {
  const tags: Set<string> = new Set()

  messages.forEach((msg) => {
    const content = msg.content.toLowerCase()

    // Emotion tags
    if (content.includes("anxious") || content.includes("anxiety") || content.includes("worried")) {
      tags.add("anxiety")
    }
    if (content.includes("sad") || content.includes("depression") || content.includes("depressed")) {
      tags.add("depression")
    }
    if (content.includes("angry") || content.includes("anger") || content.includes("furious")) {
      tags.add("anger")
    }
    if (content.includes("grief") || content.includes("loss") || content.includes("died")) {
      tags.add("grief")
    }
    if (content.includes("panic") || content.includes("panic attack")) {
      tags.add("panic")
    }
    if (content.includes("sleep") || content.includes("insomnia") || content.includes("tired")) {
      tags.add("sleep")
    }
    if (content.includes("stress") || content.includes("stressed")) {
      tags.add("stress")
    }
    if (content.includes("lonely") || content.includes("loneliness")) {
      tags.add("loneliness")
    }

    // Coping tags
    if (content.includes("breathing") || content.includes("breath")) {
      tags.add("breathing_exercise")
    }
    if (content.includes("grounding") || content.includes("5-4-3-2-1")) {
      tags.add("grounding")
    }
    if (content.includes("celebrate") || content.includes("happy") || content.includes("great")) {
      tags.add("celebration")
    }

    // Emotion from emotion field
    if (msg.emotion) {
      tags.add(msg.emotion)
    }
  })

  return Array.from(tags)
}

