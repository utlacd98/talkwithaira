/**
 * User Registry - Redis-based user profile storage
 * Maps email addresses to user IDs and stores user profiles
 * Replaces local .data/user-registry.json with Redis for Vercel compatibility
 */

import { kv } from "@vercel/kv"

interface UserProfile {
  id: string
  email: string
  name: string
  plan: "free" | "plus" | "premium"
  joinedAt: string
}

/**
 * Register a user in Redis
 * Stores user profile under key: user:{id}:profile
 * Also creates reverse lookup: email:{email}:userId
 */
export async function registerUser(
  email: string,
  userId: string,
  name: string,
  plan: "free" | "plus" | "premium" = "free"
): Promise<void> {
  try {
    const normalizedEmail = email.toLowerCase()
    const now = new Date().toISOString()

    // Store user profile
    const profileKey = `user:${userId}:profile`
    const profile: UserProfile = {
      id: userId,
      email: normalizedEmail,
      name,
      plan,
      joinedAt: now,
    }

    await kv.hset(profileKey, profile)

    // Create reverse lookup for email -> userId
    const emailKey = `email:${normalizedEmail}:userId`
    await kv.set(emailKey, userId)

    console.log("[User Registry] Registered user:", normalizedEmail, "ID:", userId)
  } catch (error) {
    console.error("[User Registry] Error registering user:", error)
    throw error
  }
}

/**
 * Get user by email
 * Looks up userId from email, then retrieves full profile
 */
export async function getUserByEmail(
  email: string
): Promise<{ id: string; name: string; plan: "free" | "plus" | "premium" } | null> {
  try {
    const normalizedEmail = email.toLowerCase()
    const emailKey = `email:${normalizedEmail}:userId`

    // Get userId from email lookup
    const userId = await kv.get(emailKey)

    if (!userId) {
      console.log("[User Registry] No user found for email:", normalizedEmail)
      return null
    }

    // Get full profile
    const profileKey = `user:${userId}:profile`
    const profile = await kv.hgetall(profileKey)

    if (!profile || Object.keys(profile).length === 0) {
      console.log("[User Registry] Profile not found for user:", userId)
      return null
    }

    return {
      id: profile.id as string,
      name: profile.name as string,
      plan: (profile.plan as "free" | "plus" | "premium") || "free",
    }
  } catch (error) {
    console.error("[User Registry] Error getting user by email:", error)
    return null
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileKey = `user:${userId}:profile`
    const profile = await kv.hgetall(profileKey)

    if (!profile || Object.keys(profile).length === 0) {
      console.log("[User Registry] Profile not found for user:", userId)
      return null
    }

    return {
      id: profile.id as string,
      email: profile.email as string,
      name: profile.name as string,
      plan: (profile.plan as "free" | "plus" | "premium") || "free",
      joinedAt: profile.joinedAt as string,
    }
  } catch (error) {
    console.error("[User Registry] Error getting user profile:", error)
    return null
  }
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: string,
  plan: "free" | "plus" | "premium"
): Promise<void> {
  try {
    const profileKey = `user:${userId}:profile`
    await kv.hset(profileKey, { plan })
    console.log("[User Registry] Updated plan for user:", userId, "Plan:", plan)
  } catch (error) {
    console.error("[User Registry] Error updating user plan:", error)
    throw error
  }
}

// Update user plan
export async function updateUserPlanByEmail(email: string, plan: "free" | "plus" | "premium"): Promise<boolean> {
  const registry = await loadRegistry()
  const user = registry[email.toLowerCase()]

  if (!user) {
    console.warn("[User Registry] User not found:", email)
    return false
  }

  user.plan = plan
  await saveRegistry(registry)
  console.log("[User Registry] Updated plan for", email, "to", plan)
  return true
}

// Get all users
export async function getAllUsers(): Promise<UserRegistry> {
  return loadRegistry()
}

