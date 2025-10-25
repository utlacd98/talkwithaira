import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

/**
 * Client-side Supabase client
 * Uses anon key for browser-safe operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase client
 * Uses service role key for privileged operations
 * Only use on server-side (API routes, server components)
 */
export const supabaseServer = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

/**
 * Database Types
 */
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  message_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  emotion?: string
  timestamp: string
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Helper function to get user ID
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Helper function to get user profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data as User
}

/**
 * Helper function to update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

/**
 * Helper function to get user's conversations
 */
export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Conversation[]
}

/**
 * Helper function to get specific conversation
 */
export async function getConversation(conversationId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single()

  if (error) throw error
  return data as Conversation
}

/**
 * Helper function to get conversation messages
 */
export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("timestamp", { ascending: true })

  if (error) throw error
  return data as Message[]
}

/**
 * Helper function to save conversation
 */
export async function saveConversation(
  conversationId: string,
  userId: string,
  title: string,
  messages: Message[],
  tags: string[] = []
) {
  if (!supabaseServer) {
    throw new Error("Supabase server client not initialized")
  }

  // Save conversation
  const { error: convError } = await supabaseServer
    .from("conversations")
    .insert({
      id: conversationId,
      user_id: userId,
      title,
      message_count: messages.length,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (convError) throw convError

  // Save messages
  const messagesToInsert = messages.map((msg) => ({
    id: msg.id,
    conversation_id: conversationId,
    role: msg.role,
    content: msg.content,
    emotion: msg.emotion,
    timestamp: msg.timestamp,
  }))

  const { error: msgError } = await supabaseServer
    .from("messages")
    .insert(messagesToInsert)

  if (msgError) throw msgError
}

/**
 * Helper function to delete conversation
 */
export async function deleteConversation(conversationId: string) {
  if (!supabaseServer) {
    throw new Error("Supabase server client not initialized")
  }

  const { error } = await supabaseServer
    .from("conversations")
    .delete()
    .eq("id", conversationId)

  if (error) throw error
}

/**
 * Helper function to update conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
) {
  if (!supabaseServer) {
    throw new Error("Supabase server client not initialized")
  }

  const { data, error } = await supabaseServer
    .from("conversations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .select()
    .single()

  if (error) throw error
  return data as Conversation
}

