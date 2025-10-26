/**
 * In-Memory Authentication Database
 * 
 * This is a simple in-memory user database for development/testing.
 * In production, replace this with a real database (Supabase, Firebase, etc.)
 * 
 * Users are stored in memory and reset on server restart.
 * Passwords are stored in plain text for simplicity (use bcrypt in production).
 */

export interface AuthUser {
  email: string
  password: string
  name: string
  plan: "free" | "plus" | "premium"
  role: "user" | "admin" | "owner"
  createdAt: number
}

/**
 * In-memory user database
 * Add more test users as needed
 */
const USERS_DB: Record<string, AuthUser> = {
  // Admin/Owner accounts
  "owner@aira.ai": {
    email: "owner@aira.ai",
    password: "owner123", // Change this to something secure
    name: "Owner",
    plan: "premium",
    role: "owner",
    createdAt: Date.now(),
  },
  "admin1@aira.ai": {
    email: "admin1@aira.ai",
    password: "admin123",
    name: "Admin One",
    plan: "premium",
    role: "admin",
    createdAt: Date.now(),
  },
  "admin2@aira.ai": {
    email: "admin2@aira.ai",
    password: "admin123",
    name: "Admin Two",
    plan: "premium",
    role: "admin",
    createdAt: Date.now(),
  },

  // Test users
  "test@example.com": {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    plan: "premium",
    role: "user",
    createdAt: Date.now(),
  },
  "demo@aira.ai": {
    email: "demo@aira.ai",
    password: "demo123",
    name: "Demo User",
    plan: "free",
    role: "user",
    createdAt: Date.now(),
  },
}

/**
 * Validate user credentials
 * @param email User email
 * @param password User password
 * @returns User object if valid, null if invalid
 */
export function validateCredentials(email: string, password: string): AuthUser | null {
  const user = USERS_DB[email.toLowerCase()]

  if (!user) {
    console.log(`[Auth DB] Login failed: User not found - ${email}`)
    return null
  }

  if (user.password !== password) {
    console.log(`[Auth DB] Login failed: Invalid password for ${email}`)
    return null
  }

  console.log(`[Auth DB] Login successful: ${email}`)
  return user
}

/**
 * Register a new user
 * @param email User email
 * @param password User password
 * @param name User name
 * @returns User object if successful, null if email already exists
 */
export function registerNewUser(
  email: string,
  password: string,
  name: string
): AuthUser | null {
  const lowerEmail = email.toLowerCase()

  if (USERS_DB[lowerEmail]) {
    console.log(`[Auth DB] Registration failed: Email already exists - ${email}`)
    return null
  }

  if (password.length < 8) {
    console.log(`[Auth DB] Registration failed: Password too short - ${email}`)
    return null
  }

  const newUser: AuthUser = {
    email: lowerEmail,
    password, // In production, hash this with bcrypt
    name,
    plan: "free",
    role: "user",
    createdAt: Date.now(),
  }

  USERS_DB[lowerEmail] = newUser
  console.log(`[Auth DB] User registered successfully: ${email}`)
  return newUser
}

/**
 * Get user by email (for verification)
 * @param email User email
 * @returns User object without password, or null if not found
 */
export function getUserByEmail(email: string): Omit<AuthUser, "password"> | null {
  const user = USERS_DB[email.toLowerCase()]

  if (!user) {
    return null
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Check if email exists
 * @param email User email
 * @returns true if email exists, false otherwise
 */
export function emailExists(email: string): boolean {
  return !!USERS_DB[email.toLowerCase()]
}

/**
 * Update user plan
 * @param email User email
 * @param plan New plan
 * @returns Updated user object, or null if not found
 */
export function updateUserPlan(
  email: string,
  plan: "free" | "plus" | "premium"
): AuthUser | null {
  const user = USERS_DB[email.toLowerCase()]

  if (!user) {
    return null
  }

  user.plan = plan
  console.log(`[Auth DB] Updated plan for ${email}: ${plan}`)
  return user
}

/**
 * Get all users (for admin purposes)
 * @returns Array of all users without passwords
 */
export function getAllUsers(): Array<Omit<AuthUser, "password">> {
  return Object.values(USERS_DB).map(({ password, ...user }) => user)
}

/**
 * Delete user (for testing)
 * @param email User email
 * @returns true if deleted, false if not found
 */
export function deleteUser(email: string): boolean {
  const lowerEmail = email.toLowerCase()

  if (!USERS_DB[lowerEmail]) {
    return false
  }

  delete USERS_DB[lowerEmail]
  console.log(`[Auth DB] User deleted: ${email}`)
  return true
}

/**
 * Reset database to initial state (for testing)
 */
export function resetDatabase(): void {
  // Reset to initial users only
  const initialEmails = [
    "owner@aira.ai",
    "admin1@aira.ai",
    "admin2@aira.ai",
    "test@example.com",
    "demo@aira.ai",
  ]

  Object.keys(USERS_DB).forEach((email) => {
    if (!initialEmails.includes(email)) {
      delete USERS_DB[email]
    }
  })

  console.log("[Auth DB] Database reset to initial state")
}

/**
 * Get database stats (for debugging)
 */
export function getDbStats() {
  return {
    totalUsers: Object.keys(USERS_DB).length,
    users: getAllUsers(),
  }
}

/**
 * Print all test credentials (for development only)
 */
export function printTestCredentials(): void {
  console.log("\n=== 🔐 Test Credentials ===")
  console.log("Owner Account:")
  console.log("  Email: owner@aira.ai")
  console.log("  Password: owner123")
  console.log("\nAdmin Accounts:")
  console.log("  Email: admin1@aira.ai")
  console.log("  Password: admin123")
  console.log("  Email: admin2@aira.ai")
  console.log("  Password: admin123")
  console.log("\nTest Users:")
  console.log("  Email: test@example.com")
  console.log("  Password: password123")
  console.log("  Email: demo@aira.ai")
  console.log("  Password: demo123")
  console.log("============================\n")
}

