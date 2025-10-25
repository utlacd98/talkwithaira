# Redis Backend - Quick Reference

## 📦 What's Included

✅ Redis client configuration  
✅ User stats creation & management  
✅ 4 API endpoints (Dashboard, Mood, Plan, Stripe)  
✅ React hook for dashboard  
✅ Auth integration helpers  
✅ Daily login tracking  
✅ Complete documentation  

## 🚀 Quick Start (3 Steps)

### Step 1: Add to Auth Signup
```typescript
import { initializeUserStats } from "@/lib/auth-stats"

// After successful signup
await initializeUserStats(user.id)
```

### Step 2: Add to Auth Login
```typescript
import { initializeUserStats } from "@/lib/auth-stats"
import { handleDailyLogin } from "@/lib/daily-check"

// After successful login
await initializeUserStats(user.id)
await handleDailyLogin(user.id)
```

### Step 3: Use in Dashboard
```typescript
import { useDashboardStats } from "@/lib/hooks/useDashboardStats"

const { stats, loading, error } = useDashboardStats(user?.id)

return (
  <div>
    <p>Conversations: {stats?.conversations}</p>
    <p>Mood: {stats?.mood_score}/10</p>
    <p>Days Active: {stats?.days_active}</p>
    <p>Plan: {stats?.plan}</p>
  </div>
)
```

## 📁 File Structure

```
lib/
├── redis.ts                    # Core Redis functions
├── auth-stats.ts               # Auth integration
├── daily-check.ts              # Daily login tracking
└── hooks/
    └── useDashboardStats.ts    # React hook

app/api/
├── dashboard/route.ts          # GET stats
├── mood/route.ts               # PATCH mood
├── plan/route.ts               # PATCH plan
├── webhooks/stripe/route.ts    # Stripe webhook
└── chat/save/route.ts          # Updated to track stats
```

## 🔌 API Endpoints

### GET /api/dashboard?userId={id}
Returns all user stats

### PATCH /api/mood?userId={id}
```json
{ "score": 8.5 }
```

### PATCH /api/plan?userId={id}
```json
{ "plan": "Plus" }
```

### POST /api/webhooks/stripe
Automatic (Stripe webhook)

## 📊 Redis Data Structure

```
user:{userId}:stats (Hash)
├── conversations: 0
├── mood_score: 0
├── days_active: 1
├── recent_conversations: "[]"
└── plan: "Free"

user:{userId}:last_login (String)
└── "2024-10-24"
```

## 🎯 Key Functions

### Create Stats
```typescript
import { createUserStats } from "@/lib/redis"
await createUserStats(userId)
```

### Get Stats
```typescript
import { getUserStats } from "@/lib/redis"
const stats = await getUserStats(userId)
```

### Increment Conversations
```typescript
import { incrementConversations } from "@/lib/redis"
await incrementConversations(userId)
```

### Update Mood
```typescript
import { updateMoodScore } from "@/lib/redis"
await updateMoodScore(userId, 8.5)
```

### Add Recent Conversation
```typescript
import { addRecentConversation } from "@/lib/redis"
await addRecentConversation(userId, "Chat summary")
```

### Update Plan
```typescript
import { updatePlan } from "@/lib/redis"
await updatePlan(userId, "Plus")
```

### Check Daily Login
```typescript
import { handleDailyLogin } from "@/lib/daily-check"
await handleDailyLogin(userId)
```

## 🔐 Environment Variables

Already set in `.env.local`:
```env
KV_REST_API_URL=https://redis-11465.crce204.eu-west-2-3.ec2.redns.redis-cloud.com
KV_REST_API_TOKEN=HRMXBiC0047dBKYXDlgY7jtmhVfrb2bg
```

## 📋 Integration Checklist

- [ ] Auth signup calls `initializeUserStats()`
- [ ] Auth login calls `initializeUserStats()` + `handleDailyLogin()`
- [ ] Dashboard uses `useDashboardStats` hook
- [ ] Chat save endpoint working (already updated)
- [ ] Test complete flow
- [ ] Deploy to Vercel

## 🧪 Test Commands

```bash
# Get stats
curl "http://localhost:3000/api/dashboard?userId=test-123"

# Update mood
curl -X PATCH "http://localhost:3000/api/mood?userId=test-123" \
  -H "Content-Type: application/json" \
  -d '{"score": 8}'

# Update plan
curl -X PATCH "http://localhost:3000/api/plan?userId=test-123" \
  -H "Content-Type: application/json" \
  -d '{"plan": "Plus"}'
```

## 🎨 Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| Free | £0 | 10 msgs/day, basic emotion |
| Plus | £4.99/mo | Unlimited, advanced analytics |
| Premium | £8.99/mo | Everything + voice, priority |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `REDIS_SETUP.md` | Detailed setup guide |
| `REDIS_BACKEND_SUMMARY.md` | Complete overview |
| `AUTH_INTEGRATION_GUIDE.md` | Auth integration steps |
| `REDIS_ARCHITECTURE.md` | Visual diagrams |
| `QUICK_REFERENCE.md` | This file |

## ❓ Common Issues

**Stats not showing?**
- Check `initializeUserStats()` is called
- Verify Redis connection
- Check browser console for errors

**Mood/Plan not updating?**
- Verify userId is correct
- Check API response in Network tab
- Ensure Redis is connected

**Daily login not incrementing?**
- Check `handleDailyLogin()` is called
- Verify date format in Redis

## 🚀 Next Steps

1. ✅ Redis backend created
2. ⏭️ Integrate with auth (see AUTH_INTEGRATION_GUIDE.md)
3. ⏭️ Update dashboard component
4. ⏭️ Test complete flow
5. ⏭️ Deploy to Vercel

## 💡 Tips

- Stats auto-refresh every 30 seconds in dashboard
- Recent conversations limited to last 3 (to save space)
- Mood score is 0-10 float
- Days active increments once per day
- Plan updates via Stripe webhook
- All data persists forever (TTL = 0)

## 📞 Support

Check the documentation files for:
- Detailed setup: `REDIS_SETUP.md`
- Architecture: `REDIS_ARCHITECTURE.md`
- Auth integration: `AUTH_INTEGRATION_GUIDE.md`
- Complete overview: `REDIS_BACKEND_SUMMARY.md`

---

**Status:** ✅ Ready to integrate with auth system

