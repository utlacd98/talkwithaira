# Redis-Based Backend Module for Aira

Complete setup guide for the Redis stats tracking system.

## Architecture Overview

```
User Authentication
    ↓
initializeUserStats(userId)
    ↓
Redis Hash: user:{userId}:stats
    ├── conversations: 0
    ├── mood_score: 0
    ├── days_active: 1
    ├── recent_conversations: []
    └── plan: "Free"
    ↓
Dashboard API pulls live values
```

## Files Created

### Core Redis Module
- **`lib/redis.ts`** - Redis client and all stat functions
- **`lib/auth-stats.ts`** - Auth integration helpers

### API Routes (Vercel Edge Functions)
- **`app/api/dashboard/route.ts`** - GET user stats
- **`app/api/mood/route.ts`** - PATCH mood score
- **`app/api/plan/route.ts`** - PATCH subscription plan
- **`app/api/webhooks/stripe/route.ts`** - Stripe webhook handler
- **`app/api/chat/save/route.ts`** - Updated to track conversations

### Client Hooks
- **`lib/hooks/useDashboardStats.ts`** - React hook for dashboard

## Environment Variables

Add to `.env.local`:

```env
# Already configured
KV_REST_API_URL=https://redis-11465.crce204.eu-west-2-3.ec2.redns.redis-cloud.com
KV_REST_API_TOKEN=HRMXBiC0047dBKYXDlgY7jtmhVfrb2bg

# For Stripe webhook (optional, add when ready)
STRIPE_PRODUCT_PLUS=prod_xxxxx
STRIPE_PRODUCT_PREMIUM=prod_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Integration Steps

### 1. Auth Integration (Signup/Login)

In your auth handler (e.g., `app/api/auth/route.ts` or wherever you handle login):

```typescript
import { initializeUserStats } from "@/lib/auth-stats"

// After successful login/signup
await initializeUserStats(user.id)
```

### 2. Dashboard Component

Use the hook in your dashboard:

```typescript
"use client"

import { useDashboardStats } from "@/lib/hooks/useDashboardStats"
import { useAuth } from "@/lib/auth-context"

export function Dashboard() {
  const { user } = useAuth()
  const { stats, loading, error, refetch } = useDashboardStats(user?.id)

  if (loading) return <div>Loading stats...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Your Stats</h2>
      <p>Conversations: {stats?.conversations}</p>
      <p>Mood Score: {stats?.mood_score}/10</p>
      <p>Days Active: {stats?.days_active}</p>
      <p>Plan: {stats?.plan}</p>
      
      <h3>Recent Conversations</h3>
      {stats?.recent_conversations.map((conv) => (
        <div key={conv.timestamp}>
          <p>{conv.summary}</p>
          <small>{new Date(conv.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
```

### 3. Mood Update (Optional UI Component)

```typescript
async function updateMood(userId: string, score: number) {
  const response = await fetch(`/api/mood?userId=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  })
  
  const data = await response.json()
  console.log("Updated mood:", data.data)
}
```

### 4. Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

When creating Stripe subscriptions, include user ID in metadata:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  metadata: {
    user_id: userId,
  },
})
```

## API Endpoints

### GET /api/dashboard
Returns user stats

**Query Params:**
- `userId` (required) - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": 5,
    "mood_score": 7.5,
    "days_active": 12,
    "recent_conversations": [
      {
        "timestamp": "2024-10-24T10:30:00Z",
        "summary": "Chat about anxiety"
      }
    ],
    "plan": "Plus"
  }
}
```

### PATCH /api/mood
Updates mood score

**Query Params:**
- `userId` (required)

**Body:**
```json
{
  "score": 8.5
}
```

### PATCH /api/plan
Updates subscription plan

**Query Params:**
- `userId` (required)

**Body:**
```json
{
  "plan": "Plus"
}
```

Valid plans: `"Free"`, `"Plus"`, `"Premium"`

## Data Flow

### On Chat Save
1. User saves a conversation
2. `POST /api/chat/save` is called
3. Chat is saved to storage
4. `incrementConversations(userId)` increments count
5. `addRecentConversation(userId, summary)` adds to recent list
6. Dashboard automatically shows updated stats

### On Mood Update
1. User rates their mood (0-10)
2. `PATCH /api/mood` is called
3. `updateMoodScore(userId, score)` updates Redis
4. Dashboard refreshes and shows new score

### On Subscription Change
1. Stripe webhook fires
2. `POST /api/webhooks/stripe` processes event
3. `updatePlan(userId, plan)` updates Redis
4. Dashboard shows new plan

## Redis Key Structure

All keys are prefixed by user ID for isolation:

```
user:{userId}:stats (Hash)
  ├── conversations (Integer)
  ├── mood_score (Float)
  ├── days_active (Integer)
  ├── recent_conversations (JSON String)
  └── plan (String)
```

**TTL:** 0 (never expires)

## Testing

### Test Stats Creation
```bash
curl "http://localhost:3000/api/dashboard?userId=test-user-123"
```

### Test Mood Update
```bash
curl -X PATCH "http://localhost:3000/api/mood?userId=test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"score": 7.5}'
```

### Test Plan Update
```bash
curl -X PATCH "http://localhost:3000/api/plan?userId=test-user-123" \
  -H "Content-Type: application/json" \
  -d '{"plan": "Plus"}'
```

## Troubleshooting

### Stats not appearing
1. Check Redis connection: `KV_REST_API_URL` and `KV_REST_API_TOKEN`
2. Verify `initializeUserStats()` is called after login
3. Check browser console for API errors

### Mood/Plan updates not working
1. Ensure `userId` is passed correctly
2. Check API response for validation errors
3. Verify Redis connection

### Stripe webhook not firing
1. Check webhook URL is publicly accessible
2. Verify webhook secret in environment
3. Check Stripe dashboard for failed deliveries

## Production Checklist

- [ ] Redis connection tested and working
- [ ] Auth integration complete (initializeUserStats called)
- [ ] Dashboard component using useDashboardStats hook
- [ ] Stripe webhook configured (if using subscriptions)
- [ ] Environment variables set on Vercel
- [ ] Error handling tested
- [ ] Rate limiting considered for API endpoints

