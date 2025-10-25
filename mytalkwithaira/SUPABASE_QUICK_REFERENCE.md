# 🚀 Supabase Quick Reference

## 5-Minute Setup

### 1. Create Project
- Go to https://supabase.com
- Click "Start your project"
- Create project named `aira-chat`
- Wait for initialization

### 2. Get Keys
- Project Settings → API
- Copy: Project URL, Anon Key, Service Role Key

### 3. Create Schema
- SQL Editor → New Query
- Paste SQL from SUPABASE_IMPLEMENTATION_GUIDE.md
- Click "Run"

### 4. Configure .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 5. Restart Server
```bash
npm run dev
```

### 6. Test
- Go to http://localhost:3000/chat
- Save a chat
- Check Supabase dashboard
- Load the chat

---

## Environment Variables

```env
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Secret (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## Database Tables

### conversations
```
id (VARCHAR) - Primary key
user_id (UUID) - Foreign key
title (VARCHAR)
message_count (INT)
tags (TEXT[])
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### messages
```
id (VARCHAR) - Primary key
conversation_id (VARCHAR) - Foreign key
role (VARCHAR)
content (TEXT)
emotion (VARCHAR)
timestamp (TIMESTAMP)
```

### users
```
id (UUID) - Primary key
email (VARCHAR)
name (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

## API Endpoints

### Save Chat
```bash
POST /api/chat/save
{
  "title": "My Chat",
  "messages": [...],
  "userId": "user123",
  "tags": ["anxiety"]
}
```

### Get Chats
```bash
GET /api/chat/save?userId=user123
```

### Get Specific Chat
```bash
GET /api/chat/save?chatId=chat_xxx&userId=user123
```

### Delete Chat
```bash
DELETE /api/chat/save?chatId=chat_xxx&userId=user123
```

---

## Helper Functions

### From `/lib/supabase.ts`

```typescript
// Get current user
const user = await getCurrentUser()

// Get user ID
const userId = await getUserId()

// Check authentication
const isAuth = await isAuthenticated()

// Get user profile
const profile = await getUserProfile(userId)

// Get user's conversations
const chats = await getUserConversations(userId)

// Get specific conversation
const chat = await getConversation(chatId)

// Get conversation messages
const messages = await getConversationMessages(chatId)

// Save conversation
await saveConversation(chatId, userId, title, messages, tags)

// Delete conversation
await deleteConversation(chatId)

// Update conversation
await updateConversation(chatId, updates)
```

---

## Common Tasks

### Save a Chat
```typescript
import { saveConversation } from '@/lib/supabase'

await saveConversation(
  chatId,
  userId,
  "My Chat",
  messages,
  ["anxiety", "coping"]
)
```

### Load a Chat
```typescript
import { getConversation, getConversationMessages } from '@/lib/supabase'

const chat = await getConversation(chatId)
const messages = await getConversationMessages(chatId)
```

### Delete a Chat
```typescript
import { deleteConversation } from '@/lib/supabase'

await deleteConversation(chatId)
```

### Get User's Chats
```typescript
import { getUserConversations } from '@/lib/supabase'

const chats = await getUserConversations(userId)
```

---

## Troubleshooting

### Missing Environment Variables
```
Error: Missing Supabase environment variables
```
**Solution**: Add all three variables to `.env.local` and restart server

### Connection Error
```
Error: Failed to connect to Supabase
```
**Solution**: 
- Verify URL is correct
- Check internet connection
- Verify project is active

### Unauthorized Error
```
Error: Unauthorized
```
**Solution**:
- Check user_id is correct
- Verify RLS policies are enabled
- Check user owns the chat

### Chat Not Found
```
Error: Chat not found
```
**Solution**:
- Verify chat was saved
- Check Supabase dashboard
- Verify user_id matches

---

## SQL Queries

### Get User's Chats
```sql
SELECT * FROM conversations 
WHERE user_id = 'user_id'
ORDER BY created_at DESC;
```

### Get Chat with Messages
```sql
SELECT c.*, m.* FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.id = 'chat_id'
ORDER BY m.timestamp ASC;
```

### Delete Chat and Messages
```sql
DELETE FROM conversations WHERE id = 'chat_id';
-- Messages cascade delete automatically
```

### Count User's Chats
```sql
SELECT COUNT(*) FROM conversations 
WHERE user_id = 'user_id';
```

---

## Files

### Created
- `/lib/supabase.ts` - Supabase client and helpers
- `/SUPABASE_SETUP_GUIDE.md` - Detailed setup guide
- `/SUPABASE_IMPLEMENTATION_GUIDE.md` - Implementation steps
- `/SUPABASE_QUICK_REFERENCE.md` - This file

### Modified
- `/app/api/chat/save/route.ts` - Added Supabase integration
- `.env.local` - Added Supabase variables

---

## Status

✅ Code implemented
✅ Package installed
✅ Supabase client created
✅ API routes updated
✅ Fallback storage ready
⏳ Awaiting your Supabase setup

---

## Next Steps

1. Create Supabase project
2. Set up database schema
3. Configure environment variables
4. Restart dev server
5. Test integration

---

## Resources

- Supabase: https://supabase.com
- Docs: https://supabase.com/docs
- JS Client: https://supabase.com/docs/reference/javascript

---

**Time to Setup**: 20-30 minutes
**Difficulty**: Easy
**Status**: Ready to implement

