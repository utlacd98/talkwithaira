/**
 * GET /api/test-kv
 * Test Vercel KV connection and provide setup guidance
 */

import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(req: NextRequest) {
  // Check environment variables
  const hasKvUrl = !!process.env.KV_REST_API_URL
  const hasKvToken = !!process.env.KV_REST_API_TOKEN
  const hasUpstashUrl = !!process.env.UPSTASH_REDIS_REST_URL
  const hasUpstashToken = !!process.env.UPSTASH_REDIS_REST_TOKEN

  console.log("[Test KV] Environment check:")
  console.log("  KV_REST_API_URL:", hasKvUrl ? "✅ Set" : "❌ Missing")
  console.log("  KV_REST_API_TOKEN:", hasKvToken ? "✅ Set" : "❌ Missing")
  console.log("  UPSTASH_REDIS_REST_URL:", hasUpstashUrl ? "✅ Set" : "❌ Missing")
  console.log("  UPSTASH_REDIS_REST_TOKEN:", hasUpstashToken ? "✅ Set" : "❌ Missing")

  if (!hasKvUrl && !hasUpstashUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "No Redis configuration found",
        message: "Please set up Vercel KV or Upstash Redis",
        setup: {
          option1: "Vercel KV: Set KV_REST_API_URL and KV_REST_API_TOKEN",
          option2: "Upstash: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
          guide: "See VERCEL_KV_SETUP.md for detailed instructions",
        },
        envCheck: {
          KV_REST_API_URL: hasKvUrl,
          KV_REST_API_TOKEN: hasKvToken,
          UPSTASH_REDIS_REST_URL: hasUpstashUrl,
          UPSTASH_REDIS_REST_TOKEN: hasUpstashToken,
        },
      },
      { status: 500 }
    )
  }

  try {
    console.log("[Test KV] Testing Vercel KV connection...")

    // Test 1: Set a value
    const testKey = "test:connection"
    const testValue = { timestamp: new Date().toISOString(), test: "Hello from Vercel KV!" }

    await kv.set(testKey, JSON.stringify(testValue))
    console.log("[Test KV] ✅ Set test value")

    // Test 2: Get the value
    const retrieved = await kv.get(testKey)
    console.log("[Test KV] ✅ Retrieved test value:", retrieved)

    // Test 3: Delete the value
    await kv.del(testKey)
    console.log("[Test KV] ✅ Deleted test value")

    // Test 4: Verify deletion
    const shouldBeNull = await kv.get(testKey)
    console.log("[Test KV] ✅ Verified deletion:", shouldBeNull === null)

    return NextResponse.json({
      success: true,
      message: "✅ Vercel KV connection successful!",
      tests: {
        set: "✅ Passed",
        get: "✅ Passed",
        delete: "✅ Passed",
        verify: shouldBeNull === null ? "✅ Passed" : "❌ Failed",
      },
      config: {
        usingVercelKV: hasKvUrl,
        usingUpstash: hasUpstashUrl,
      },
      data: {
        testValue,
        retrieved,
      },
    })
  } catch (error) {
    console.error("[Test KV] ❌ Error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "❌ Vercel KV connection failed",
        troubleshooting: {
          step1: "Check that environment variables are set correctly",
          step2: "Restart the dev server: npm run dev",
          step3: "Verify your Upstash database is active",
          step4: "See VERCEL_KV_SETUP.md for detailed setup",
        },
        envCheck: {
          KV_REST_API_URL: hasKvUrl,
          KV_REST_API_TOKEN: hasKvToken,
          UPSTASH_REDIS_REST_URL: hasUpstashUrl,
          UPSTASH_REDIS_REST_TOKEN: hasUpstashToken,
        },
      },
      { status: 500 }
    )
  }
}

