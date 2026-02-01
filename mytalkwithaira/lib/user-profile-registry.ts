/**
 * User Profile Registry - Redis-based user profile storage
 * Maps email addresses to user IDs and stores user profiles
 * Uses Vercel KV (Redis) for serverless compatibility
 * Created: 2025-10-27 - Clean implementation without file-based code
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
    console.log("[User Profile Registry] Starting registration for:", email)

    // Check if KV is available
    if (!kv) {
      throw new Error("Redis KV is not initialized. Check KV_REST_API_URL and KV_REST_API_TOKEN environment variables.")
    }

    const normalizedEmail = email.toLowerCase()
    const now = new Date().toISOString()
    const profileKey = `user:${userId}:profile`

    console.log("[User Profile Registry] Checking if user exists with key:", profileKey)

    // Check if user already exists
    let existingProfile: any = null
    try {
      existingProfile = await kv.hgetall(profileKey)
      console.log("[User Profile Registry] Existing profile check result:", existingProfile)
    } catch (checkError) {
      console.error("[User Profile Registry] Error checking existing profile:", checkError)
      // Continue with registration even if check fails
    }

    if (existingProfile && Object.keys(existingProfile).length > 0) {
      // User exists - preserve their plan and joinedAt, but update name if needed
      console.log("[User Profile Registry] User already exists:", normalizedEmail, "Preserving plan:", existingProfile.plan)
      await kv.hset(profileKey, { name }) // Only update name
      return
    }

    // New user - create full profile
    console.log("[User Profile Registry] Creating new user profile...")
    const profile: UserProfile = {
      id: userId,
      email: normalizedEmail,
      name,
      plan,
      joinedAt: now,
    }

    console.log("[User Profile Registry] Writing profile to Redis:", profile)
    await kv.hset(profileKey, profile)
    console.log("[User Profile Registry] ✅ Profile written successfully")

    // Create reverse lookup for email -> userId
    const emailKey = `email:${normalizedEmail}:userId`
    console.log("[User Profile Registry] Creating email lookup:", emailKey, "->", userId)
    await kv.set(emailKey, userId)
    console.log("[User Profile Registry] ✅ Email lookup created successfully")

    console.log("[User Profile Registry] ✅ Registered new user:", normalizedEmail, "ID:", userId, "Plan:", plan)
  } catch (error: any) {
    console.error("[User Profile Registry] ❌ Error registering user:", error)
    console.error("[User Profile Registry] Error message:", error.message)
    console.error("[User Profile Registry] Error stack:", error.stack)
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
      console.log("[User Profile Registry] No user found for email:", normalizedEmail)
      return null
    }

    // Get full profile
    const profileKey = `user:${userId}:profile`
    const profile = await kv.hgetall(profileKey)

    if (!profile || Object.keys(profile).length === 0) {
      console.log("[User Profile Registry] Profile not found for user:", userId)
      return null
    }

    return {
      id: profile.id as string,
      name: profile.name as string,
      plan: (profile.plan as "free" | "plus" | "premium") || "free",
    }
  } catch (error) {
    console.error("[User Profile Registry] Error getting user by email:", error)
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
      console.log("[User Profile Registry] Profile not found for user:", userId)
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
    console.error("[User Profile Registry] Error getting user profile:", error)
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
    console.log("[User Profile Registry] Updated plan for user:", userId, "Plan:", plan)
  } catch (error) {
    console.error("[User Profile Registry] Error updating user plan:", error)
    throw error
  }
}

/**
 * Update user plan by email
 * Looks up user by email, then updates their plan
 */
export async function updateUserPlanByEmail(
  email: string,
  plan: "free" | "plus" | "premium"
): Promise<boolean> {
  try {
    console.log("[User Profile Registry] ========================================")
    console.log("[User Profile Registry] Updating plan for email:", email)
    console.log("[User Profile Registry] New plan:", plan)

    const normalizedEmail = email.toLowerCase()
    const emailKey = `email:${normalizedEmail}:userId`
    console.log("[User Profile Registry] Looking up userId with key:", emailKey)

    // Get userId from email lookup
    const userId = await kv.get(emailKey)
    console.log("[User Profile Registry] Found userId:", userId)

    if (!userId) {
      console.warn("[User Profile Registry] ❌ User not found for email:", normalizedEmail)
      console.warn("[User Profile Registry] This means the user was never registered in Redis!")
      return false
    }

    // Update plan in user profile
    const profileKey = `user:${userId}:profile`
    console.log("[User Profile Registry] Updating profile with key:", profileKey)

    await kv.hset(profileKey, { plan })

    // Verify the update
    const updatedProfile = await kv.hgetall(profileKey)
    console.log("[User Profile Registry] Updated profile:", updatedProfile)
    console.log("[User Profile Registry] ✅ Successfully updated plan for", normalizedEmail, "to", plan)
    console.log("[User Profile Registry] ========================================")
    return true
  } catch (error) {
    console.error("[User Profile Registry] ❌ Error updating user plan by email:", error)
    console.log("[User Profile Registry] ========================================")
    return false
  }
}

/**
 * Get all users (for admin purposes)
 * Note: This is a simplified version - in production, you'd want to use SCAN
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    // This is a placeholder - Redis doesn't have a simple "get all" operation
    // In production, you'd want to:
    // 1. Use SCAN to iterate through user:*:profile keys
    // 2. Or maintain a separate set of all user IDs
    console.warn("[User Profile Registry] getAllUsers() is not fully implemented for Redis")
    return []
  } catch (error) {
    console.error("[User Profile Registry] Error getting all users:", error)
    return []
  }
}

