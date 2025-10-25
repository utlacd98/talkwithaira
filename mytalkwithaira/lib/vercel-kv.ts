import { kv } from "@vercel/kv";

/**
 * Vercel KV Helper Functions for Aira Chat
 * Simple Redis-based storage for conversations and messages
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  emotion?: string;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/**
 * Save a conversation to Vercel KV
 */
export async function saveConversation(
  chatId: string,
  userId: string,
  title: string,
  messages: ChatMessage[],
  tags: string[] = []
): Promise<SavedChat> {
  try {
    const now = new Date().toISOString();

    const chatData: SavedChat = {
      id: chatId,
      title,
      messages,
      tags,
      createdAt: now,
      updatedAt: now,
      messageCount: messages.length,
    };

    // Save to KV with key: chat:{userId}:{chatId}
    const key = `chat:${userId}:${chatId}`;
    await kv.set(key, JSON.stringify(chatData));

    // Also add to user's chat list for quick retrieval
    await kv.sadd(`chats:${userId}`, chatId);

    console.log("[Vercel KV] Saved chat:", key);
    return chatData;
  } catch (error) {
    console.error("[Vercel KV] Error saving conversation:", error);
    throw error;
  }
}

/**
 * Get a specific conversation
 */
export async function getConversation(
  chatId: string,
  userId: string
): Promise<SavedChat | null> {
  try {
    const key = `chat:${userId}:${chatId}`;
    const data = await kv.get(key);

    if (!data) {
      console.log("[Vercel KV] Chat not found:", key);
      return null;
    }

    const chat = typeof data === "string" ? JSON.parse(data) : data;
    console.log("[Vercel KV] Retrieved chat:", key);
    return chat;
  } catch (error) {
    console.error("[Vercel KV] Error getting conversation:", error);
    throw error;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<SavedChat[]> {
  try {
    // Get all chat IDs for this user
    const chatIds = await kv.smembers(`chats:${userId}`);

    if (!chatIds || chatIds.length === 0) {
      console.log("[Vercel KV] No chats found for user:", userId);
      return [];
    }

    // Fetch all chats
    const chats: SavedChat[] = [];
    for (const chatId of chatIds) {
      const key = `chat:${userId}:${chatId}`;
      const data = await kv.get(key);

      if (data) {
        const chat = typeof data === "string" ? JSON.parse(data) : data;
        chats.push(chat);
      }
    }

    // Sort by creation date (newest first)
    chats.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log("[Vercel KV] Retrieved", chats.length, "chats for user:", userId);
    return chats;
  } catch (error) {
    console.error("[Vercel KV] Error getting user conversations:", error);
    throw error;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const key = `chat:${userId}:${chatId}`;

    // Delete the chat
    await kv.del(key);

    // Remove from user's chat list
    await kv.srem(`chats:${userId}`, chatId);

    console.log("[Vercel KV] Deleted chat:", key);
    return true;
  } catch (error) {
    console.error("[Vercel KV] Error deleting conversation:", error);
    throw error;
  }
}

/**
 * Update a conversation
 */
export async function updateConversation(
  chatId: string,
  userId: string,
  updates: Partial<SavedChat>
): Promise<SavedChat> {
  try {
    const key = `chat:${userId}:${chatId}`;

    // Get existing chat
    const existing = await getConversation(chatId, userId);
    if (!existing) {
      throw new Error("Chat not found");
    }

    // Merge updates
    const updated: SavedChat = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Save updated chat
    await kv.set(key, JSON.stringify(updated));

    console.log("[Vercel KV] Updated chat:", key);
    return updated;
  } catch (error) {
    console.error("[Vercel KV] Error updating conversation:", error);
    throw error;
  }
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(
  chatId: string,
  userId: string
): Promise<ChatMessage[]> {
  try {
    const chat = await getConversation(chatId, userId);
    return chat?.messages || [];
  } catch (error) {
    console.error("[Vercel KV] Error getting messages:", error);
    throw error;
  }
}

/**
 * Add a message to a conversation
 */
export async function addMessageToConversation(
  chatId: string,
  userId: string,
  message: ChatMessage
): Promise<SavedChat> {
  try {
    const chat = await getConversation(chatId, userId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Add message
    chat.messages.push(message);
    chat.messageCount = chat.messages.length;
    chat.updatedAt = new Date().toISOString();

    // Save updated chat
    const key = `chat:${userId}:${chatId}`;
    await kv.set(key, JSON.stringify(chat));

    console.log("[Vercel KV] Added message to chat:", key);
    return chat;
  } catch (error) {
    console.error("[Vercel KV] Error adding message:", error);
    throw error;
  }
}

/**
 * Clear all chats for a user (use with caution!)
 */
export async function clearUserChats(userId: string): Promise<boolean> {
  try {
    const chatIds = await kv.smembers(`chats:${userId}`);

    if (chatIds && chatIds.length > 0) {
      for (const chatId of chatIds) {
        const key = `chat:${userId}:${chatId}`;
        await kv.del(key);
      }
    }

    await kv.del(`chats:${userId}`);

    console.log("[Vercel KV] Cleared all chats for user:", userId);
    return true;
  } catch (error) {
    console.error("[Vercel KV] Error clearing chats:", error);
    throw error;
  }
}

/**
 * Health check - verify KV connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await kv.set("health-check", "ok");
    const result = await kv.get("health-check");
    console.log("[Vercel KV] Health check passed");
    return result === "ok";
  } catch (error) {
    console.error("[Vercel KV] Health check failed:", error);
    return false;
  }
}

