/**
 * Mock Services for Load Testing
 * Provides mock implementations of AI, Redis, and database services
 * Used when USE_MOCK_SERVICES=true environment variable is set
 */

export interface MockUserSession {
  userId: string
  sessionId: string
  messageCount: number
  lastActivity: number
}

export interface MockChatResponse {
  message: string
  userSimulated: number
  mock: true
  timestamp: number
}

export interface MockStats {
  conversations: number
  mood_score: number
  days_active: number
  recent_conversations: string[]
  plan: string
  mock: true
}

// Mock AI responses - varied and realistic
const MOCK_RESPONSES = [
  "I'm here to listen and support you. What's on your mind today?",
  "That sounds challenging. Let's explore what you're feeling.",
  "I appreciate you sharing that with me. How does that make you feel?",
  "It's great that you're reflecting on this. What would help you most right now?",
  "I hear you. Remember, you're not alone in this journey.",
  "That's an interesting perspective. Have you considered...?",
  "Your feelings are valid. Let's work through this together.",
  "I'm noticing a pattern here. What do you think about that?",
  "You're doing great by reaching out. What's your next step?",
  "Let's take a moment to breathe and refocus. What matters most to you?",
  "I'm proud of you for taking this step. How can I support you further?",
  "That's a powerful realization. What will you do with this insight?",
  "You have more strength than you realize. Let's build on that.",
  "I'm here for you, no matter what. What do you need right now?",
  "Your wellbeing is important. Let's create a plan together.",
]

// Mock user names for simulation
const MOCK_USER_NAMES = [
  "Alex", "Jordan", "Casey", "Morgan", "Riley", "Taylor", "Avery", "Quinn",
  "Sam", "Jamie", "Drew", "Blake", "Cameron", "Dakota", "Skylar", "River",
]

// In-memory storage for mock sessions
const mockSessions = new Map<string, MockUserSession>()

/**
 * Check if mock services are enabled
 */
export function isMockMode(): boolean {
  return process.env.USE_MOCK_SERVICES === "true"
}

/**
 * Get configured number of load test users
 */
export function getLoadTestUserCount(): number {
  return parseInt(process.env.LOAD_TEST_USERS || "100", 10)
}

/**
 * Generate a mock AI response
 */
export function generateMockAIResponse(userId: string): MockChatResponse {
  const userSimulated = Math.floor(Math.random() * getLoadTestUserCount())
  const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]

  return {
    message: response,
    userSimulated,
    mock: true,
    timestamp: Date.now(),
  }
}

/**
 * Simulate network delay (50-150ms)
 */
export async function simulateNetworkDelay(): Promise<void> {
  const delay = Math.random() * 100 + 50
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulate variable network delay (20-300ms)
 */
export async function simulateVariableDelay(): Promise<void> {
  const delay = Math.random() * 280 + 20
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Get or create a mock user session
 */
export function getOrCreateMockSession(userId: string): MockUserSession {
  if (!mockSessions.has(userId)) {
    mockSessions.set(userId, {
      userId,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messageCount: 0,
      lastActivity: Date.now(),
    })
  }

  const session = mockSessions.get(userId)!
  session.lastActivity = Date.now()
  session.messageCount++

  return session
}

/**
 * Generate mock user stats
 */
export function generateMockStats(userId: string): MockStats {
  const session = getOrCreateMockSession(userId)

  return {
    conversations: Math.floor(Math.random() * 50) + 1,
    mood_score: Math.floor(Math.random() * 100),
    days_active: Math.floor(Math.random() * 30) + 1,
    recent_conversations: [
      `Chat ${session.messageCount}`,
      `Chat ${session.messageCount - 1}`,
      `Chat ${session.messageCount - 2}`,
    ].filter((_, i) => i < 3),
    plan: ["Free", "Pro", "Premium"][Math.floor(Math.random() * 3)],
    mock: true,
  }
}

/**
 * Generate mock chat save response
 */
export function generateMockSaveResponse(userId: string) {
  const session = getOrCreateMockSession(userId)

  return {
    ok: true,
    message: "Mock save complete",
    simulatedUser: Math.floor(Math.random() * getLoadTestUserCount()),
    sessionId: session.sessionId,
    timestamp: Date.now(),
    mock: true,
  }
}

/**
 * Get mock load test status
 */
export function getMockLoadTestStatus() {
  return {
    status: "active",
    loadUsers: getLoadTestUserCount(),
    activeSessions: mockSessions.size,
    time: Date.now(),
    mock: true,
  }
}

/**
 * Get mock user info
 */
export function getMockUserInfo(userId: string) {
  const session = getOrCreateMockSession(userId)
  const randomName = MOCK_USER_NAMES[Math.floor(Math.random() * MOCK_USER_NAMES.length)]

  return {
    id: userId,
    name: `${randomName} (Mock User)`,
    email: `mock-${userId}@aira.test`,
    plan: ["free", "pro", "premium"][Math.floor(Math.random() * 3)],
    joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionId: session.sessionId,
    messageCount: session.messageCount,
    mock: true,
  }
}

/**
 * Clear all mock sessions (for testing)
 */
export function clearMockSessions(): void {
  mockSessions.clear()
}

/**
 * Get all active mock sessions
 */
export function getActiveMockSessions(): MockUserSession[] {
  return Array.from(mockSessions.values())
}

/**
 * Log mock mode startup
 */
export function logMockModeStartup(): void {
  if (isMockMode()) {
    const userCount = getLoadTestUserCount()
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 MOCK LOAD TEST MODE ACTIVE                            ║
╠════════════════════════════════════════════════════════════╣
║  Simulated Users: ${userCount.toString().padEnd(40)} ║
║  AI Calls: MOCKED (no token cost)                          ║
║  Redis: MOCKED (in-memory)                                 ║
║  Database: MOCKED (in-memory)                              ║
║                                                            ║
║  ⚠️  This is for testing only. Do not use in production.   ║
╚════════════════════════════════════════════════════════════╝
    `)
  }
}

