/**
 * Auth Stats Integration
 * Handles user stats creation on signup/login
 */

import { createUserStats, userStatsExist, incrementDaysActive } from "./redis"

/**
 * Initialize user stats on first login/signup
 * Call this right after successful authentication
 */
export async function initializeUserStats(userId: string): Promise<void> {
  try {
    // Check if user already has stats
    const exists = await userStatsExist(userId)

    if (!exists) {
      // First time user - create initial stats
      console.log("[Auth Stats] Creating initial stats for new user:", userId)
      await createUserStats(userId)
    } else {
      // Returning user - increment days active if it's a new day
      // In production, you'd check if the last login was on a different day
      console.log("[Auth Stats] User already has stats:", userId)
      // Optionally increment days_active here if needed
      // await incrementDaysActive(userId)
    }
  } catch (error) {
    console.error("[Auth Stats] Error initializing user stats:", error)
    // Don't throw - auth should succeed even if stats fail
  }
}

/**
 * Handle user logout
 * Optionally clean up stats (set to false to keep persistent stats)
 */
export async function handleUserLogout(userId: string, deleteStats: boolean = false): Promise<void> {
  try {
    if (deleteStats) {
      const { deleteUserStats } = await import("./redis")
      await deleteUserStats(userId)
      console.log("[Auth Stats] Deleted stats for logged out user:", userId)
    } else {
      console.log("[Auth Stats] User logged out (stats preserved):", userId)
    }
  } catch (error) {
    console.error("[Auth Stats] Error handling logout:", error)
  }
}

/**
 * Handle account deletion
 * Always delete stats when account is deleted
 */
export async function handleAccountDeletion(userId: string): Promise<void> {
  try {
    const { deleteUserStats } = await import("./redis")
    await deleteUserStats(userId)
    console.log("[Auth Stats] Deleted stats for deleted account:", userId)
  } catch (error) {
    console.error("[Auth Stats] Error handling account deletion:", error)
    throw error
  }
}

