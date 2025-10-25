# Auth Integration Guide - Redis Stats

This guide shows how to integrate the Redis stats system with your existing auth system.

## Current Auth System

Your app uses a client-side auth context stored in localStorage:
- File: `lib/auth-context.tsx`
- Provider: `<AuthProvider>` wraps the app
- Hook: `useAuth()` provides `user`, `login()`, `signup()`, `logout()`

## Integration Points

### 1. Signup Handler

Find your signup function and add stats initialization:

```typescript
// In your signup handler (likely in auth-context.tsx or a signup page)

import { initializeUserStats } from "@/lib/auth-stats"

async function handleSignup(email: string, password: string) {
  try {
    // Your existing signup logic
    const user = await createUser(email, password)
    
    // NEW: Initialize Redis stats for new user
    await initializeUserStats(user.id)
    
    // Your existing auth setup
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
    
    return user
  } catch (error) {
    console.error("Signup failed:", error)
    throw error
  }
}
```

### 2. Login Handler

Find your login function and add daily check:

```typescript
// In your login handler

import { initializeUserStats } from "@/lib/auth-stats"
import { handleDailyLogin } from "@/lib/daily-check"

async function handleLogin(email: string, password: string) {
  try {
    // Your existing login logic
    const user = await authenticateUser(email, password)
    
    // NEW: Initialize stats if first time (won't duplicate)
    await initializeUserStats(user.id)
    
    // NEW: Handle daily login (increments days_active if first login today)
    await handleDailyLogin(user.id)
    
    // Your existing auth setup
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
    
    return user
  } catch (error) {
    console.error("Login failed:", error)
    throw error
  }
}
```

### 3. Logout Handler

Find your logout function and optionally clean up:

```typescript
// In your logout handler

import { handleUserLogout } from "@/lib/auth-stats"

async function handleLogout() {
  try {
    const user = getCurrentUser()
    
    // NEW: Optional - keep stats persistent (recommended)
    // Set deleteStats to false to keep user's historical data
    await handleUserLogout(user.id, false)
    
    // Your existing logout logic
    localStorage.removeItem("user")
    setUser(null)
  } catch (error) {
    console.error("Logout failed:", error)
  }
}
```

### 4. Account Deletion

Find your account deletion handler:

```typescript
// In your account deletion handler

import { handleAccountDeletion } from "@/lib/auth-stats"

async function handleDeleteAccount(userId: string) {
  try {
    // NEW: Delete all user stats
    await handleAccountDeletion(userId)
    
    // Your existing deletion logic
    await deleteUserFromDatabase(userId)
    localStorage.removeItem("user")
    setUser(null)
  } catch (error) {
    console.error("Account deletion failed:", error)
    throw error
  }
}
```

## Dashboard Integration

### Update Your Dashboard Component

```typescript
"use client"

import { useAuth } from "@/lib/auth-context"
import { useDashboardStats } from "@/lib/hooks/useDashboardStats"

export function Dashboard() {
  const { user } = useAuth()
  const { stats, loading, error, refetch } = useDashboardStats(user?.id)

  if (!user) {
    return <div>Please log in</div>
  }

  if (loading) {
    return <div>Loading your stats...</div>
  }

  if (error) {
    return <div>Error loading stats: {error}</div>
  }

  if (!stats) {
    return <div>No stats found</div>
  }

  return (
    <div className="p-6">
      <h1>Welcome, {user.email}!</h1>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Conversations Card */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Conversations</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.conversations}</p>
        </div>

        {/* Mood Score Card */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Mood Score</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.mood_score}/10</p>
        </div>

        {/* Days Active Card */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Days Active</h3>
          <p className="text-3xl font-bold text-green-600">{stats.days_active}</p>
        </div>

        {/* Plan Card */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Current Plan</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.plan}</p>
        </div>
      </div>

      {/* Recent Conversations */}
      {stats.recent_conversations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Conversations</h2>
          <div className="space-y-3">
            {stats.recent_conversations.map((conv, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{conv.summary}</p>
                <p className="text-sm text-gray-500">
                  {new Date(conv.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Tracker */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Update Your Mood</h2>
        <MoodSlider userId={user.id} onUpdate={refetch} />
      </div>
    </div>
  )
}

// Mood Slider Component
function MoodSlider({ userId, onUpdate }: { userId: string; onUpdate: () => void }) {
  const [score, setScore] = useState(5)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/mood?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      })

      if (response.ok) {
        alert("Mood updated!")
        onUpdate()
      }
    } catch (error) {
      alert("Failed to update mood")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="range"
        min="0"
        max="10"
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="w-full"
      />
      <p className="text-center text-lg font-bold">{score}/10</p>
      <button
        onClick={handleUpdate}
        disabled={updating}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {updating ? "Updating..." : "Update Mood"}
      </button>
    </div>
  )
}
```

## Testing the Integration

### 1. Test Signup
1. Go to signup page
2. Create new account
3. Check browser console for "[Auth Stats] Creating initial stats..."
4. Visit `/api/dashboard?userId={newUserId}` to verify stats created

### 2. Test Login
1. Log out
2. Log back in
3. Check console for "[Daily Check] Incremented days_active..."
4. Dashboard should show updated stats

### 3. Test Chat Save
1. Have a conversation
2. Click "Save Chat"
3. Check `/api/dashboard?userId={userId}` - conversations count should increase
4. Recent conversations should show the saved chat

### 4. Test Mood Update
1. On dashboard, update mood slider
2. Click "Update Mood"
3. Check `/api/dashboard?userId={userId}` - mood_score should update

## File Locations

Your auth system is likely in:
- `lib/auth-context.tsx` - Auth provider and context
- `app/auth/signup/page.tsx` - Signup page
- `app/auth/login/page.tsx` - Login page
- `app/dashboard/page.tsx` - Dashboard page

Add the imports and function calls to these files.

## Environment Variables

Already configured in `.env.local`:
```env
KV_REST_API_URL=https://redis-11465.crce204.eu-west-2-3.ec2.redns.redis-cloud.com
KV_REST_API_TOKEN=HRMXBiC0047dBKYXDlgY7jtmhVfrb2bg
```

## Troubleshooting

**Stats not creating?**
- Check console for errors
- Verify `initializeUserStats()` is called
- Check Redis connection

**Dashboard not showing stats?**
- Verify `useDashboardStats` hook is used
- Check browser console for API errors
- Ensure userId is passed correctly

**Mood/Plan updates not working?**
- Check API response in Network tab
- Verify userId is correct
- Check Redis connection

## Next Steps

1. ✅ Redis backend created
2. ⏭️ Integrate with auth system (this guide)
3. ⏭️ Update dashboard component
4. ⏭️ Test complete flow
5. ⏭️ Deploy to Vercel

