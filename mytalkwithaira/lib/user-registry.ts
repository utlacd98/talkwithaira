/**
 * User Registry - Maps email addresses to user IDs
 * Used for webhook handlers to look up users by email
 */

import { promises as fs } from "fs"
import path from "path"

const REGISTRY_FILE = path.join(process.cwd(), ".data", "user-registry.json")

interface UserRegistry {
  [email: string]: {
    id: string
    name: string
    plan: "free" | "plus" | "premium"
  }
}

// Ensure directory exists
async function ensureDir() {
  try {
    await fs.mkdir(path.dirname(REGISTRY_FILE), { recursive: true })
  } catch (err) {
    // Directory might already exist
  }
}

// Load registry from file
async function loadRegistry(): Promise<UserRegistry> {
  try {
    await ensureDir()
    const data = await fs.readFile(REGISTRY_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    // File doesn't exist yet, return empty registry
    return {}
  }
}

// Save registry to file
async function saveRegistry(registry: UserRegistry): Promise<void> {
  await ensureDir()
  await fs.writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2))
}

// Register a user (called during signup/login)
export async function registerUser(
  email: string,
  userId: string,
  name: string,
  plan: "free" | "plus" | "premium" = "free"
): Promise<void> {
  const registry = await loadRegistry()
  registry[email.toLowerCase()] = { id: userId, name, plan }
  await saveRegistry(registry)
  console.log("[User Registry] Registered user:", email, "ID:", userId)
}

// Get user by email
export async function getUserByEmail(email: string): Promise<{ id: string; name: string; plan: "free" | "plus" | "premium" } | null> {
  const registry = await loadRegistry()
  const user = registry[email.toLowerCase()]
  return user || null
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

