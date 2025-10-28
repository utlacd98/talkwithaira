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
import { supabaseServer, supabase } from "@/lib/supabase"

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

    // Try to save to Vercel KV first
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

    // Also save to Supabase for persistent storage across deployments
    try {
      const supabaseClient = supabaseServer || supabase
      console.log("[Save Chat API] Attempting to save to Supabase for chatId:", chatId, "using", supabaseServer ? "server" : "client")

      // Save conversation to Supabase
      const { error: convError } = await supabaseClient
        .from("conversations")
        .upsert({
          id: chatId,
          user_id: userId,
          title,
          message_count: body.messages.length,
          tags: allTags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" })

      if (convError) {
        console.warn("[Save Chat API] Error saving conversation to Supabase:", convError)
      } else {
        console.log("[Save Chat API] Successfully saved conversation to Supabase:", chatId)

        // Save messages to Supabase
        const messagesToInsert = body.messages.map((msg) => ({
          id: msg.id,
          conversation_id: chatId,
          role: msg.role,
          content: msg.content,
          emotion: msg.emotion || null,
          timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString(),
        }))

        // Delete old messages first to avoid duplicates
        await supabaseClient
          .from("messages")
          .delete()
          .eq("conversation_id", chatId)

        const { error: msgError } = await supabaseClient
          .from("messages")
          .insert(messagesToInsert)

        if (msgError) {
          console.warn("[Save Chat API] Error saving messages to Supabase:", msgError)
        } else {
          console.log("[Save Chat API] Successfully saved", body.messages.length, "messages to Supabase")
        }
      }
    } catch (supabaseError) {
      console.warn("[Save Chat API] Supabase save failed (non-critical):", supabaseError)
      // Don't fail the entire save if Supabase fails - KV storage is primary
    }

    // Update user stats in Redis with timeout
    try {
      if (userId !== "anonymous") {
        // Check if Redis is configured
        const redisConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

        if (redisConfigured) {
          // Increment conversations count with timeout
          const incrementPromise = incrementConversations(userId)
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          await Promise.race([incrementPromise, timeoutPromise])

          // Add to recent conversations with timeout
          const summary = title || `Chat with ${body.messages.length} messages`
          const addRecentPromise = addRecentConversation(userId, summary)
          const timeoutPromise2 = new Promise((resolve) => setTimeout(() => resolve(null), 2000))
          await Promise.race([addRecentPromise, timeoutPromise2])

          console.log("[Save Chat API] Updated user stats for:", userId)
        } else {
          console.log("[Save Chat API] Redis not configured, skipping stats update")
        }
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

        // Check in-memory storage first
        const memoryKey = `${userId}:${chatId}`
        if (IN_MEMORY_STORAGE.has(memoryKey)) {
          chat = IN_MEMORY_STORAGE.get(memoryKey) || null
          console.log("[Get Chat API] Retrieved chat from in-memory storage:", memoryKey)
        } else {
          // Check file-based fallback storage
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
            console.log("[Get Chat API] Retrieved chat from file-based fallback storage:", chatId)
          } catch (fallbackError) {
            console.warn("[Get Chat API] File-based fallback storage also unavailable:", fallbackError)
          }
        }
      }

      // If not found in KV or fallback, try Supabase
      if (!chat) {
        try {
          const supabaseClient = supabaseServer || supabase
          console.log("[Get Chat API] Checking Supabase for chat:", chatId)

          // Get conversation from Supabase
          const { data: convData, error: convError } = await supabaseClient
            .from("conversations")
            .select("*")
            .eq("id", chatId)
            .eq("user_id", userId)
            .single()

          if (!convError && convData) {
            // Get messages from Supabase
            const { data: messagesData, error: msgError } = await supabaseClient
              .from("messages")
              .select("*")
              .eq("conversation_id", chatId)
              .order("timestamp", { ascending: true })

            if (!msgError && messagesData) {
              chat = {
                id: convData.id,
                title: convData.title,
                messages: messagesData.map((msg: any) => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  emotion: msg.emotion,
                  timestamp: msg.timestamp,
                })),
                tags: convData.tags || [],
                createdAt: convData.created_at,
                updatedAt: convData.updated_at,
                messageCount: convData.message_count,
              }
              console.log("[Get Chat API] Retrieved chat from Supabase:", chatId)
            }
          }
        } catch (supabaseError) {
          console.warn("[Get Chat API] Supabase lookup failed:", supabaseError)
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
      console.warn("[Get Chats API] Vercel KV unavailable, checking fallback:", kvError)

      // Try Supabase next
      try {
        const supabaseClient = supabaseServer || supabase
        const { data: conversations, error } = await supabaseClient
          .from("conversations")
          .select("id, title, message_count, tags, created_at, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })

        if (!error && conversations) {
          chats = conversations.map((conv: any) => ({
            id: conv.id,
            title: conv.title,
            messageCount: conv.message_count,
            tags: conv.tags || [],
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
          }))
          console.log("[Get Chats API] Retrieved", chats.length, "chats from Supabase for user:", userId)
        }
      } catch (supabaseError) {
        console.warn("[Get Chats API] Supabase lookup failed:", supabaseError)
        // Fall back to file-based storage
        chats = await loadFromFallback(userId)
        console.log("[Get Chats API] Retrieved", chats.length, "chats from file storage for user:", userId)
      }
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

    // Also delete from Supabase
    try {
      const supabaseClient = supabaseServer || supabase
      // Delete messages first (due to foreign key constraint)
      const { error: msgError } = await supabaseClient
        .from("messages")
        .delete()
        .eq("conversation_id", chatId)

      if (msgError) {
        console.warn("[Delete Chat API] Error deleting messages from Supabase:", msgError)
      } else {
        console.log("[Delete Chat API] Deleted messages from Supabase:", chatId)
      }

      // Delete conversation
      const { error: convError } = await supabaseClient
        .from("conversations")
        .delete()
        .eq("id", chatId)
        .eq("user_id", userId)

      if (convError) {
        console.warn("[Delete Chat API] Error deleting conversation from Supabase:", convError)
      } else {
        console.log("[Delete Chat API] Deleted conversation from Supabase:", chatId)
      }
    } catch (supabaseError) {
      console.warn("[Delete Chat API] Supabase delete failed (non-critical):", supabaseError)
      // Don't fail the delete if Supabase fails - KV storage is primary
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

