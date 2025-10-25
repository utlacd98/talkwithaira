/**
 * Chat Utility Functions
 * Handles saving, loading, and managing chat conversations
 */

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: "calm" | "empathetic" | "supportive" | "reflective"
  timestamp: Date
}

export interface SavedChat {
  id: string
  title: string
  messageCount: number
  tags: string[]
  savedAt: string
}

/**
 * Save a chat conversation
 * @param messages - Array of chat messages
 * @param title - Optional custom title for the chat
 * @param userId - Optional user ID for tracking
 * @param tags - Optional custom tags
 * @returns Promise with saved chat info
 */
export async function saveChat(
  messages: ChatMessage[],
  title?: string,
  userId?: string,
  tags?: string[]
): Promise<SavedChat> {
  try {
    const response = await fetch("/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || `Chat - ${new Date().toLocaleDateString()}`,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          emotion: m.emotion,
          timestamp: m.timestamp.toISOString(),
        })),
        userId: userId || "anonymous",
        tags: tags || [],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save chat")
    }

    const data = await response.json()
    return {
      id: data.chatId,
      title: data.title,
      messageCount: data.messageCount,
      tags: data.tags,
      savedAt: data.savedAt,
    }
  } catch (error) {
    console.error("[Save Chat] Error:", error)
    throw error
  }
}

/**
 * Get all saved chats for a user
 * @param userId - User ID to retrieve chats for
 * @returns Promise with array of saved chats
 */
export async function getSavedChats(userId?: string): Promise<SavedChat[]> {
  try {
    const params = new URLSearchParams()
    if (userId) {
      params.append("userId", userId)
    }

    const response = await fetch(`/api/chat/save?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to retrieve chats")
    }

    const data = await response.json()
    return data.chats || []
  } catch (error) {
    console.error("[Get Saved Chats] Error:", error)
    throw error
  }
}

/**
 * Load a specific chat by ID
 * @param chatId - ID of the chat to load
 * @param userId - User ID for authorization
 * @returns Promise with chat data including messages
 */
export async function loadChat(
  chatId: string,
  userId?: string
): Promise<{ id: string; title: string; messages: ChatMessage[]; tags: string[]; createdAt: string }> {
  try {
    const params = new URLSearchParams()
    params.append("chatId", chatId)
    if (userId) {
      params.append("userId", userId)
    }

    const response = await fetch(`/api/chat/save?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to load chat")
    }

    const data = await response.json()
    return data.chat
  } catch (error) {
    console.error("[Load Chat] Error:", error)
    throw error
  }
}

/**
 * Delete a saved chat
 * @param chatId - ID of the chat to delete
 * @returns Promise with success status
 */
export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/chat/save?chatId=${chatId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete chat")
    }

    return true
  } catch (error) {
    console.error("[Delete Chat] Error:", error)
    throw error
  }
}

/**
 * Export chat as JSON
 * @param messages - Array of chat messages
 * @param title - Title for the export
 */
export function exportChatAsJSON(messages: ChatMessage[], title: string = "Aira Chat"): void {
  try {
    const data = {
      title,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        emotion: m.emotion,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      })),
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "_")}_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()

    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error("[Export JSON] Error:", error)
    alert("Failed to export chat as JSON. Please try again.")
  }
}

/**
 * Export chat as text
 * @param messages - Array of chat messages
 * @param title - Title for the export
 */
export function exportChatAsText(messages: ChatMessage[], title: string = "Aira Chat"): void {
  try {
    let text = `${title}\n`
    text += `Exported: ${new Date().toLocaleString()}\n`
    text += `Messages: ${messages.length}\n`
    text += "=".repeat(50) + "\n\n"

    messages.forEach((msg) => {
      const role = msg.role === "user" ? "You" : "Aira"
      const timestamp = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      const time = timestamp.toLocaleTimeString()
      text += `[${time}] ${role}:\n${msg.content}\n\n`
    })

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "_")}_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()

    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error("[Export Text] Error:", error)
    alert("Failed to export chat as text. Please try again.")
  }
}

/**
 * Generate a summary of the chat
 * @param messages - Array of chat messages
 * @returns Summary string
 */
export function generateChatSummary(messages: ChatMessage[]): string {
  if (messages.length === 0) return "Empty chat"

  const userMessages = messages.filter((m) => m.role === "user")
  const assistantMessages = messages.filter((m) => m.role === "assistant")

  const firstUserMessage = userMessages[0]?.content || ""
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || ""

  let summary = `Chat with ${messages.length} messages. `
  summary += `Started with: "${firstUserMessage.substring(0, 50)}...". `
  summary += `Ended with: "${lastUserMessage.substring(0, 50)}..."`

  return summary
}

/**
 * Get emotion statistics from chat
 * @param messages - Array of chat messages
 * @returns Object with emotion counts
 */
export function getEmotionStats(messages: ChatMessage[]): Record<string, number> {
  const stats: Record<string, number> = {
    calm: 0,
    empathetic: 0,
    supportive: 0,
    reflective: 0,
  }

  messages.forEach((msg) => {
    if (msg.emotion && msg.emotion in stats) {
      stats[msg.emotion]++
    }
  })

  return stats
}

/**
 * Format timestamp for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

