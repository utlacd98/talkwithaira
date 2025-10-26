# 🧪 Aira Mock Load Testing Guide

## Overview

Aira now includes a comprehensive mock load-testing mode that allows you to safely simulate 100+ concurrent users without calling real AI APIs or production databases. This is perfect for:

- ✅ Performance testing
- ✅ Stress testing
- ✅ Load capacity planning
- ✅ CI/CD pipeline testing
- ✅ Development and debugging

---

## Quick Start

### 1. Enable Mock Mode Locally

```bash
# Terminal 1: Start the dev server with mock mode
USE_MOCK_SERVICES=true LOAD_TEST_USERS=100 npm run dev
```

### 2. Run Load Simulation

```bash
# Terminal 2: Run the load test simulator
USE_MOCK_SERVICES=true LOAD_TEST_USERS=100 node scripts/simulate-load.js
```

### 3. View Results

The simulator will output:
- ✅ Total requests made
- ✅ Success/failure rates
- ✅ Requests per second
- ✅ Duration
- ✅ Any errors encountered

---

## Environment Variables

### Required

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_MOCK_SERVICES` | `false` | Set to `true` to enable mock mode |
| `LOAD_TEST_USERS` | `100` | Number of concurrent users to simulate |

### Optional (for simulator script)

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://v0-aira-web-app.vercel.app` | API base URL |
| `REQUESTS_PER_USER` | `10` | Requests each user makes |
| `DELAY_BETWEEN_REQUESTS` | `500` | Delay between requests (ms) |

---

## Usage Examples

### Example 1: Local Development (50 users)

```bash
USE_MOCK_SERVICES=true LOAD_TEST_USERS=50 npm run dev
```

Then in another terminal:

```bash
USE_MOCK_SERVICES=true LOAD_TEST_USERS=50 node scripts/simulate-load.js
```

### Example 2: Production Simulation (100 users)

```bash
BASE_URL=https://v0-aira-web-app.vercel.app \
USE_MOCK_SERVICES=true \
LOAD_TEST_USERS=100 \
node scripts/simulate-load.js
```

### Example 3: Heavy Load Test (500 users, 20 requests each)

```bash
USE_MOCK_SERVICES=true \
LOAD_TEST_USERS=500 \
REQUESTS_PER_USER=20 \
DELAY_BETWEEN_REQUESTS=100 \
node scripts/simulate-load.js
```

### Example 4: Stress Test (1000 users, rapid requests)

```bash
USE_MOCK_SERVICES=true \
LOAD_TEST_USERS=1000 \
REQUESTS_PER_USER=5 \
DELAY_BETWEEN_REQUESTS=50 \
node scripts/simulate-load.js
```

---

## What Gets Mocked

### ✅ AI Responses
- No OpenAI API calls
- No token usage
- Realistic response times (50-150ms)
- Varied mock responses

### ✅ Redis/Database
- In-memory storage
- No external connections
- Instant operations
- Realistic delays (20-300ms)

### ✅ Chat Saves
- Mock Vercel KV responses
- In-memory fallback
- No file system writes

### ✅ User Stats
- Mock dashboard data
- Realistic stat generation
- Session tracking

---

## API Endpoints

### GET /api/test/load

Returns current load test status:

```bash
curl http://localhost:3000/api/test/load
```

Response:
```json
{
  "status": "active",
  "loadUsers": 100,
  "activeSessions": 42,
  "sessionDetails": [
    {
      "userId": "user-0",
      "sessionId": "session-1729...",
      "messageCount": 5,
      "lastActivity": "2025-10-26T18:00:00.000Z"
    }
  ],
  "timestamp": "2025-10-26T18:00:00.000Z",
  "mock": true
}
```

### POST /api/test/load

Clear all mock sessions:

```bash
curl -X POST http://localhost:3000/api/test/load \
  -H "Content-Type: application/json" \
  -d '{"action":"clear"}'
```

---

## Mock Endpoints

When `USE_MOCK_SERVICES=true`, these endpoints return mock data:

| Endpoint | Mock Behavior |
|----------|---------------|
| `POST /api/chat` | Returns mock AI response (50-150ms) |
| `GET /api/dashboard` | Returns mock user stats |
| `POST /api/chat/save` | Returns mock save confirmation |
| `GET /api/test/load` | Returns load test status |

---

## Console Output

### Startup Message

```
╔════════════════════════════════════════════════════════════╗
║  🧪 MOCK LOAD TEST MODE ACTIVE                            ║
╠════════════════════════════════════════════════════════════╣
║  Simulated Users: 100                                      ║
║  AI Calls: MOCKED (no token cost)                          ║
║  Redis: MOCKED (in-memory)                                 ║
║  Database: MOCKED (in-memory)                              ║
║                                                            ║
║  ⚠️  This is for testing only. Do not use in production.   ║
╚════════════════════════════════════════════════════════════╝
```

### Simulator Output

```
╔════════════════════════════════════════════════════════════╗
║  📊 LOAD TEST RESULTS                                      ║
╠════════════════════════════════════════════════════════════╣
║  Total Requests:        1000                               ║
║  Successful:            998                                ║
║  Failed:                2                                  ║
║  Success Rate:          99.80%                             ║
║  Duration:              45.23s                             ║
║  Requests/Second:       22.11                              ║
║  Simulated Users:       100                                ║
║  Requests per User:     10                                 ║
╚════════════════════════════════════════════════════════════╝
```

---

## Performance Metrics

### Expected Performance (Local)

- **100 users**: ~20-30 req/s
- **500 users**: ~50-80 req/s
- **1000 users**: ~100-150 req/s

### Expected Performance (Vercel)

- **100 users**: ~15-25 req/s
- **500 users**: ~40-60 req/s
- **1000 users**: ~80-120 req/s

---

## Troubleshooting

### Issue: "Mock mode is not enabled"

**Solution**: Make sure `USE_MOCK_SERVICES=true` is set:

```bash
USE_MOCK_SERVICES=true node scripts/simulate-load.js
```

### Issue: Connection refused

**Solution**: Make sure the dev server is running:

```bash
# Terminal 1
npm run dev

# Terminal 2
node scripts/simulate-load.js
```

### Issue: High failure rate

**Solution**: Reduce concurrent users or increase delays:

```bash
USE_MOCK_SERVICES=true \
LOAD_TEST_USERS=50 \
DELAY_BETWEEN_REQUESTS=1000 \
node scripts/simulate-load.js
```

---

## Best Practices

1. **Start Small**: Begin with 50 users, then increase
2. **Monitor Logs**: Watch console output for errors
3. **Test Locally First**: Run on localhost before Vercel
4. **Vary Requests**: Mix different endpoints
5. **Realistic Delays**: Use realistic request intervals
6. **Clear Sessions**: Use POST /api/test/load to reset

---

## Files Added

- ✅ `/lib/mock-services.ts` - Mock service implementations
- ✅ `/app/api/test/load/route.ts` - Load test endpoint
- ✅ `/scripts/simulate-load.js` - Load simulator script
- ✅ `/LOAD_TEST_SETUP.md` - This documentation

---

## Next Steps

1. ✅ Enable mock mode: `USE_MOCK_SERVICES=true`
2. ✅ Run simulator: `node scripts/simulate-load.js`
3. ✅ Monitor performance
4. ✅ Adjust load as needed
5. ✅ Analyze results

---

**Status**: ✅ Ready for Load Testing
**Last Updated**: October 26, 2025

