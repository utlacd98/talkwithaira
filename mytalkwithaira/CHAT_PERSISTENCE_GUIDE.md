# Chat Persistence & Deletion Guide

## Overview

Users' chats are now **permanently persisted** across deployments and can be **safely deleted**. This ensures no data loss when the application is updated.

## How It Works

### 1. **Multi-Layer Storage Strategy**

Chats are saved to multiple storage backends for maximum reliability:

```
┌─────────────────────────────────────────┐
│         User Saves a Chat               │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌──────────────┐
│ Vercel KV   │  │  Supabase    │
│ (Redis)     │  │  (Database)  │
└─────────────┘  └──────────────┘
    Primary         Persistent
    Cache           Storage
```

### 2. **Save Flow**

When a user saves a chat:

1. **Vercel KV (Primary)**: Chat is saved to Redis for fast access
2. **Supabase (Backup)**: Chat is also saved to the database for permanent storage
3. **Fallback**: If both fail, chat is saved to in-memory storage

**Code Location**: `/app/api/chat/save/route.ts` (POST handler)

### 3. **Load Flow**

When a user loads their chats:

1. **Try Vercel KV first** (fastest)
2. **If KV fails, try Supabase** (persistent backup)
3. **If Supabase fails, try file-based fallback**

**Code Location**: `/app/api/chat/save/route.ts` (GET handler)

### 4. **Delete Flow**

When a user deletes a chat:

1. **Delete from Vercel KV** (primary)
2. **Delete from Supabase** (persistent)
3. **Delete from fallback storage** (if applicable)

**Code Location**: `/app/api/chat/save/route.ts` (DELETE handler)

## Key Features

### ✅ Chat Persistence

- Chats are saved to **Supabase database** for permanent storage
- Survives application deployments and restarts
- Accessible across all devices and sessions

### ✅ Chat Deletion

- Users can delete chats using the **trash icon** in the sidebar
- Deletion is confirmed with a confirmation dialog
- Chats are removed from all storage backends

### ✅ Fallback Mechanisms

- If Vercel KV is unavailable, chats load from Supabase
- If Supabase is unavailable, chats load from file-based storage
- Multiple layers ensure data is never lost

### ✅ User Isolation

- Each user can only access their own chats (enforced by Supabase RLS)
- User ID is required for all operations
- Data is completely isolated between users

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  message_count INT,
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role VARCHAR(50),
  content TEXT,
  emotion VARCHAR(50),
  timestamp TIMESTAMP
);
```

## API Endpoints

### Save Chat
```
POST /api/chat/save
Body: {
  title: string,
  messages: ChatMessage[],
  userId: string,
  tags: string[]
}
```

### Load Chats
```
GET /api/chat/save?userId={userId}
GET /api/chat/save?chatId={chatId}&userId={userId}
```

### Delete Chat
```
DELETE /api/chat/save?chatId={chatId}&userId={userId}
```

## Testing

### Test Chat Persistence
1. Save a chat
2. Refresh the page
3. Chat should still appear in sidebar
4. Deploy the app
5. Chat should still be accessible

### Test Chat Deletion
1. Save a chat
2. Hover over chat in sidebar
3. Click trash icon
4. Confirm deletion
5. Chat should disappear from sidebar
6. Refresh page - chat should not reappear

## Troubleshooting

### Chats Not Appearing
- Check Supabase connection in `.env.local`
- Verify user ID is being passed correctly
- Check browser console for errors

### Delete Not Working
- Ensure user ID is passed to delete endpoint
- Check Supabase RLS policies allow deletion
- Verify chat belongs to current user

### Performance Issues
- Vercel KV should be fast (< 100ms)
- Supabase queries may take 200-500ms
- Consider caching frequently accessed chats

## Files Modified

- `/app/api/chat/save/route.ts` - Added Supabase persistence
- `/lib/chat-utils.ts` - Updated delete function to accept userId
- `/components/chat/chat-sidebar.tsx` - Pass userId to delete function

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
KV_REST_API_URL=https://xxxxx.kv.vercel.sh
KV_REST_API_TOKEN=xxxxx
```

## Status

✅ **COMPLETE** - Chat persistence and deletion fully implemented and tested

