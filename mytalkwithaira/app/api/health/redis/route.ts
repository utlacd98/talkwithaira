/**
 * Redis Health Check API
 * Tests Redis connectivity and environment variables
 */

import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET() {
  try {
    console.log("[Redis Health] Starting health check...")
    console.log("[Redis Health] Environment variables present:", {
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      KV_URL: !!process.env.KV_URL,
    })

    // Log the URL (first 50 chars only for security)
    if (process.env.KV_REST_API_URL) {
      console.log("[Redis Health] KV_REST_API_URL starts with:", process.env.KV_REST_API_URL.substring(0, 50))
    }

    // Test 1: Simple SET operation
    const testKey = `health-check:${Date.now()}`
    const testValue = "ok"
    
    console.log("[Redis Health] Test 1: Setting key:", testKey)
    await kv.set(testKey, testValue, { ex: 10 })
    
    // Test 2: GET operation
    console.log("[Redis Health] Test 2: Getting key:", testKey)
    const result = await kv.get(testKey)
    
    // Test 3: DELETE operation
    console.log("[Redis Health] Test 3: Deleting key:", testKey)
    await kv.del(testKey)

    console.log("[Redis Health] ✅ All tests passed!")

    return NextResponse.json({
      success: true,
      message: "Redis connection healthy",
      tests: {
        set: true,
        get: result === testValue,
        delete: true,
      },
      environment: {
        KV_REST_API_URL: process.env.KV_REST_API_URL?.substring(0, 50) + "...",
        hasToken: !!process.env.KV_REST_API_TOKEN,
      },
    })
  } catch (error: any) {
    console.error("[Redis Health] ❌ Health check failed:", error)
    console.error("[Redis Health] Error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          message: error.message,
          cause: error.cause?.toString(),
        },
        environment: {
          KV_REST_API_URL: !!process.env.KV_REST_API_URL,
          KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        },
      },
      { status: 500 }
    )
  }
}

