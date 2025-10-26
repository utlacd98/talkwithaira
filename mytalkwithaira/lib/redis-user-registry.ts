/**
 * Redis-based User Registry with Fallbacks
 * Replaces file-based storage (.data/user-registry.json)
 * Uses Vercel KV (Upstash Redis) with graceful fallbacks
 */

import { kv } from "@vercel/kv"

export interface UserData {
  id: string
  email?: string
  name?: string
  plan?: "free" | "pro" | "premium"
  createdAt: number
  updatedAt?: number
}

/**
 * In-memory fallback storage for when Redis is unavailable
 */
const IN_MEMORY_REGISTRY = new Map<string, UserData>()

/**
 * Register a user in Redis with fallback
 */
export async function registerUser(userId: string, data: Partial<UserData>): Promise<{ ok: boolean; fallback?: boolean; user: UserData }> {
  const userData: UserData = {
    id: userId,
    createdAt: Date.now(),
    ...data,
  }

  try {
    // Try to save to Redis
    const key = `user:${userId}:registry`
    await kv.hset(key, userData)
    console.log(`[User Registry] Registered user in Redis: ${userId}`)

    return {
      ok: true,
      user: userData,
    }
  } catch (error) {
    console.error(`[User Registry] Redis failed, using fallback:`, error instanceof Error ? error.message : error)

    // Fallback: save to in-memory storage
    IN_MEMORY_REGISTRY.set(userId, userData)
    console.log(`[User Registry] Registered user in memory (fallback): ${userId}`)

    return {
      ok: true,
      fallback: true,
      user: userData,
    }
  }
}

/**
 * Get user from Redis with fallback
 */
export async function getUser(userId: string): Promise<UserData | null> {
  try {
    // Try to get from Redis
    const key = `user:${userId}:registry`
    const user = await kv.hgetall(key)

    if (user && Object.keys(user).length > 0) {
      console.log(`[User Registry] Retrieved user from Redis: ${userId}`)
      return user as UserData
    }

    // Not found in Redis, try memory
    const memoryUser = IN_MEMORY_REGISTRY.get(userId)
    if (memoryUser) {
      console.log(`[User Registry] Retrieved user from memory: ${userId}`)
      return memoryUser
    }

    return null
  } catch (error) {
    console.error(`[User Registry] Redis failed, checking memory:`, error instanceof Error ? error.message : error)

    // Fallback: get from in-memory storage
    const memoryUser = IN_MEMORY_REGISTRY.get(userId)
    if (memoryUser) {
      console.log(`[User Registry] Retrieved user from memory (fallback): ${userId}`)
      return memoryUser
    }

    return null
  }
}

/**
 * Update user in Redis with fallback
 */
export async function updateUser(userId: string, data: Partial<UserData>): Promise<{ ok: boolean; fallback?: boolean }> {
  try {
    // Try to update in Redis
    const key = `user:${userId}:registry`
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    await kv.hset(key, updateData)
    console.log(`[User Registry] Updated user in Redis: ${userId}`)

    return { ok: true }
  } catch (error) {
    console.error(`[User Registry] Redis failed, using fallback:`, error instanceof Error ? error.message : error)

    // Fallback: update in-memory storage
    const user = IN_MEMORY_REGISTRY.get(userId)
    if (user) {
      IN_MEMORY_REGISTRY.set(userId, {
        ...user,
        ...data,
        updatedAt: Date.now(),
      })
      console.log(`[User Registry] Updated user in memory (fallback): ${userId}`)
      return { ok: true, fallback: true }
    }

    return { ok: false }
  }
}

/**
 * Delete user from Redis with fallback
 */
export async function deleteUser(userId: string): Promise<{ ok: boolean; fallback?: boolean }> {
  try {
    // Try to delete from Redis
    const key = `user:${userId}:registry`
    await kv.del(key)
    console.log(`[User Registry] Deleted user from Redis: ${userId}`)

    return { ok: true }
  } catch (error) {
    console.error(`[User Registry] Redis failed, using fallback:`, error instanceof Error ? error.message : error)

    // Fallback: delete from in-memory storage
    if (IN_MEMORY_REGISTRY.has(userId)) {
      IN_MEMORY_REGISTRY.delete(userId)
      console.log(`[User Registry] Deleted user from memory (fallback): ${userId}`)
      return { ok: true, fallback: true }
    }

    return { ok: false }
  }
}

/**
 * Get all users (for admin purposes)
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    // Try to get from Redis (scan all user:*:registry keys)
    // Note: This is a simplified version - in production, you'd want to use SCAN
    const users: UserData[] = []

    // For now, return memory users as fallback
    return Array.from(IN_MEMORY_REGISTRY.values())
  } catch (error) {
    console.error(`[User Registry] Failed to get all users:`, error)
    return Array.from(IN_MEMORY_REGISTRY.values())
  }
}

/**
 * Check if user exists
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await getUser(userId)
    return user !== null
  } catch (error) {
    console.error(`[User Registry] Error checking user existence:`, error)
    return false
  }
}

/**
 * Get registry stats
 */
export async function getRegistryStats(): Promise<{ redisUsers: number; memoryUsers: number; total: number }> {
  return {
    redisUsers: 0, // Would need SCAN to count
    memoryUsers: IN_MEMORY_REGISTRY.size,
    total: IN_MEMORY_REGISTRY.size,
  }
}

/**
 * Clear all in-memory data (for testing)
 */
export function clearMemoryRegistry(): void {
  IN_MEMORY_REGISTRY.clear()
  console.log("[User Registry] Cleared in-memory registry")
}

