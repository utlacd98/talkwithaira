/**
 * GET /api/test/load
 * Load test endpoint for mock mode
 * Returns status of mock load test environment
 */

import { NextRequest, NextResponse } from "next/server"
import {
  isMockMode,
  getMockLoadTestStatus,
  getLoadTestUserCount,
  getActiveMockSessions,
  simulateVariableDelay,
} from "@/lib/mock-services"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    // Check if mock mode is enabled
    if (!isMockMode()) {
      return NextResponse.json(
        {
          status: "disabled",
          message: "Mock load test mode is not enabled. Set USE_MOCK_SERVICES=true to enable.",
          mock: false,
        },
        { status: 200 }
      )
    }

    // Simulate variable network delay
    await simulateVariableDelay()

    // Get load test status
    const status = getMockLoadTestStatus()
    const activeSessions = getActiveMockSessions()

    return NextResponse.json(
      {
        status: "active",
        loadUsers: getLoadTestUserCount(),
        activeSessions: activeSessions.length,
        sessionDetails: activeSessions.map((session) => ({
          userId: session.userId,
          sessionId: session.sessionId,
          messageCount: session.messageCount,
          lastActivity: new Date(session.lastActivity).toISOString(),
        })),
        timestamp: new Date().toISOString(),
        mock: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Load Test API] Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        mock: true,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/test/load
 * Trigger a load test simulation
 */
export async function POST(req: NextRequest) {
  try {
    if (!isMockMode()) {
      return NextResponse.json(
        {
          status: "disabled",
          message: "Mock load test mode is not enabled. Set USE_MOCK_SERVICES=true to enable.",
          mock: false,
        },
        { status: 200 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { action } = body

    if (action === "clear") {
      // Clear all mock sessions
      const { clearMockSessions } = await import("@/lib/mock-services")
      clearMockSessions()
      console.log("[Load Test API] Cleared all mock sessions")

      return NextResponse.json(
        {
          status: "cleared",
          message: "All mock sessions have been cleared",
          mock: true,
        },
        { status: 200 }
      )
    }

    // Default: return current status
    const status = getMockLoadTestStatus()
    const activeSessions = getActiveMockSessions()

    return NextResponse.json(
      {
        status: "active",
        loadUsers: getLoadTestUserCount(),
        activeSessions: activeSessions.length,
        timestamp: new Date().toISOString(),
        mock: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Load Test API] Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        mock: true,
      },
      { status: 500 }
    )
  }
}

