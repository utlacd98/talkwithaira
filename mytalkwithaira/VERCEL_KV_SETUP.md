# 🚀 Vercel KV Setup Guide

## Quick Setup (5 minutes)

Vercel KV uses **Upstash Redis** under the hood. You have two options:

### Option 1: Use Vercel KV (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "KV (Redis)"

2. **Get Your Credentials**
   After creating, you'll see:
   ```
   KV_URL=redis://...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```

3. **Update `.env.local`**
   Copy those values into your `.env.local` file

4. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Option 2: Use Upstash Directly (Free Tier)

1. **Sign Up for Upstash**
   - Visit: https://upstash.com
   - Click "Sign Up" (free tier available)
   - Verify your email

2. **Create a Redis Database**
   - Click "Create Database"
   - Name: `aira-chat-storage`
   - Region: Choose closest to you
   - Type: Regional (free)
   - Click "Create"

3. **Get REST API Credentials**
   - Click on your database
   - Scroll to "REST API" section
   - Copy:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Update `.env.local`**
   ```env
   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Testing Your Setup

### Test 1: Check KV Connection
```bash
curl http://localhost:3000/api/test-kv
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vercel KV connection successful!",
  "tests": {
    "set": "✅ Passed",
    "get": "✅ Passed",
    "delete": "✅ Passed",
    "verify": "✅ Passed"
  }
}
```

### Test 2: Save a Chat
1. Go to http://localhost:3000/chat
2. Have a conversation with Aira
3. Click the "Save" button (💾 icon)
4. You should see: "✅ Chat saved!"

### Test 3: Load a Chat
1. Click the "History" button (📜 icon)
2. You should see your saved chat in the sidebar
3. Click on it to load

## Troubleshooting

### Error: "Vercel KV connection failed"

**Solution 1: Check Environment Variables**
```bash
# Make sure these are set in .env.local
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**Solution 2: Restart Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Solution 3: Use Upstash Instead**
Follow "Option 2" above to use Upstash directly.

### Error: "Chat saved to in-memory fallback"

This means KV isn't working, but chats are still saved temporarily.
- Chats will be lost when server restarts
- Follow setup steps above to enable persistent storage

### Error: "Failed to save chat"

**Check:**
1. Is dev server running?
2. Are environment variables set?
3. Is Upstash database active?

**Fix:**
```bash
# Restart server
npm run dev

# Test connection
curl http://localhost:3000/api/test-kv
```

## Current Status

✅ **What's Working:**
- Password validation (fixed!)
- Login/Signup with proper API routes
- Chat interface
- In-memory fallback storage

⚠️ **Needs Setup:**
- Vercel KV / Upstash Redis for persistent chat storage

## Next Steps

1. ✅ Set up Upstash Redis (5 minutes)
2. ✅ Update `.env.local` with credentials
3. ✅ Restart dev server
4. ✅ Test chat saving
5. ✅ Deploy to Vercel

## Free Tier Limits

**Upstash Free Tier:**
- 10,000 commands/day
- 256 MB storage
- Perfect for development and small apps

**Vercel KV Free Tier:**
- 30,000 commands/month
- 256 MB storage
- Integrated with Vercel deployments

Both are more than enough for testing and small-scale use!

