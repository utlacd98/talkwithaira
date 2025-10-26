#!/usr/bin/env node

/**
 * Load Test Simulator for Aira
 * Simulates concurrent users making requests to the API
 * 
 * Usage:
 *   USE_MOCK_SERVICES=true LOAD_TEST_USERS=100 node scripts/simulate-load.js
 *   
 * Or with custom base URL:
 *   BASE_URL=http://localhost:3000 USE_MOCK_SERVICES=true LOAD_TEST_USERS=50 node scripts/simulate-load.js
 */

const BASE_URL = process.env.BASE_URL || "https://v0-aira-web-app.vercel.app"
const LOAD_TEST_USERS = parseInt(process.env.LOAD_TEST_USERS || "100", 10)
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || "10", 10)
const DELAY_BETWEEN_REQUESTS = parseInt(process.env.DELAY_BETWEEN_REQUESTS || "500", 10)

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  startTime: Date.now(),
  errors: [],
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Make a request to an endpoint
 */
async function makeRequest(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Aira-Load-Test/1.0",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    if (response.ok) {
      stats.successfulRequests++
      return { success: true, status: response.status, data }
    } else {
      stats.failedRequests++
      return { success: false, status: response.status, error: data.error }
    }
  } catch (error) {
    stats.failedRequests++
    stats.errors.push(`${endpoint}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

/**
 * Simulate a single user making requests
 */
async function simulateUser(userId) {
  const endpoints = [
    { path: "/api/test/load", method: "GET" },
    { path: "/api/dashboard", method: "GET", params: `?userId=${userId}` },
    { path: "/api/chat", method: "POST", body: { messages: [{ role: "user", content: "Hello Aira" }], userId } },
    { path: "/api/chat/save", method: "POST", body: { messages: [{ role: "user", content: "Test" }], userId } },
  ]

  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const fullPath = endpoint.path + (endpoint.params || "")

    stats.totalRequests++

    try {
      await makeRequest(fullPath, endpoint.method, endpoint.body)
      process.stdout.write(".")
    } catch (error) {
      process.stdout.write("E")
    }

    // Random delay between requests
    await sleep(Math.random() * DELAY_BETWEEN_REQUESTS)
  }

  console.log(`\n✅ User ${userId} completed ${REQUESTS_PER_USER} requests`)
}

/**
 * Print statistics
 */
function printStats() {
  const duration = Date.now() - stats.startTime
  const successRate = ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)
  const requestsPerSecond = (stats.totalRequests / (duration / 1000)).toFixed(2)

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  📊 LOAD TEST RESULTS                                      ║
╠════════════════════════════════════════════════════════════╣
║  Total Requests:        ${stats.totalRequests.toString().padEnd(40)} ║
║  Successful:            ${stats.successfulRequests.toString().padEnd(40)} ║
║  Failed:                ${stats.failedRequests.toString().padEnd(40)} ║
║  Success Rate:          ${successRate}%${" ".repeat(35 - successRate.length)} ║
║  Duration:              ${(duration / 1000).toFixed(2)}s${" ".repeat(38 - (duration / 1000).toFixed(2).length)} ║
║  Requests/Second:       ${requestsPerSecond}${" ".repeat(38 - requestsPerSecond.length)} ║
║  Simulated Users:       ${LOAD_TEST_USERS.toString().padEnd(40)} ║
║  Requests per User:     ${REQUESTS_PER_USER.toString().padEnd(40)} ║
╚════════════════════════════════════════════════════════════╝
  `)

  if (stats.errors.length > 0) {
    console.log("⚠️  Errors encountered:")
    stats.errors.slice(0, 5).forEach((error) => console.log(`   - ${error}`))
    if (stats.errors.length > 5) {
      console.log(`   ... and ${stats.errors.length - 5} more errors`)
    }
  }
}

/**
 * Main load test function
 */
async function runLoadTest() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧪 AIRA LOAD TEST SIMULATOR                              ║
╠════════════════════════════════════════════════════════════╣
║  Base URL:              ${BASE_URL.padEnd(40)} ║
║  Simulated Users:       ${LOAD_TEST_USERS.toString().padEnd(40)} ║
║  Requests per User:     ${REQUESTS_PER_USER.toString().padEnd(40)} ║
║  Total Requests:        ${(LOAD_TEST_USERS * REQUESTS_PER_USER).toString().padEnd(40)} ║
║  Delay Between Req:     ${DELAY_BETWEEN_REQUESTS}ms${" ".repeat(35 - DELAY_BETWEEN_REQUESTS.toString().length)} ║
╚════════════════════════════════════════════════════════════╝
  `)

  // Create user simulation promises
  const userPromises = []
  for (let i = 0; i < LOAD_TEST_USERS; i++) {
    userPromises.push(simulateUser(`user-${i}`))
    // Stagger user starts slightly
    await sleep(10)
  }

  // Wait for all users to complete
  console.log("\n🚀 Starting load test...\n")
  await Promise.all(userPromises)

  // Print final statistics
  console.log("\n")
  printStats()

  // Exit with appropriate code
  process.exit(stats.failedRequests > 0 ? 1 : 0)
}

// Run the load test
runLoadTest().catch((error) => {
  console.error("❌ Load test failed:", error)
  process.exit(1)
})

