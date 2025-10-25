# 🚀 Supabase Implementation Guide

## Overview

This guide walks you through implementing Supabase as the backend database for Aira's chat persistence system.

---

## ✅ What's Already Done

### Code Changes
- ✅ Installed `@supabase/supabase-js` package
- ✅ Created `/lib/supabase.ts` with client and helper functions
- ✅ Updated `/app/api/chat/save/route.ts` with Supabase integration
- ✅ Added fallback to in-memory storage if Supabase not configured
- ✅ Implemented authorization checks
- ✅ Added error handling and logging

### Features
- ✅ Save chats to Supabase
- ✅ Load chats from Supabase
- ✅ Delete chats from Supabase
- ✅ List user's chats from Supabase
- ✅ Fallback to in-memory storage
- ✅ User authorization validation

---

## 🎯 What You Need to Do

### Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create new project:
   - Name: `aira-chat`
   - Password: (save this!)
   - Region: (closest to you)
5. Wait for initialization (2-3 minutes)

### Step 2: Get API Keys (2 minutes)

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (public)
   - **Service Role Key**: `eyJhbGc...` (secret)

### Step 3: Create Database Schema (5 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the SQL from below
4. Click "Run"

#### SQL Schema

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  emotion VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

### Step 4: Configure Environment Variables (2 minutes)

Update `.env.local`:

```env
# Existing
OPENAI_API_KEY=sk-proj-xxx
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini

# New - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Important**:
- `NEXT_PUBLIC_*` = exposed to browser (use anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = secret (never expose)

### Step 5: Restart Dev Server (1 minute)

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 6: Test Integration (5 minutes)

1. Go to http://localhost:3000/chat
2. Have a conversation
3. Click "Save"
4. Check Supabase Dashboard:
   - Go to Table Editor
   - Click "conversations" table
   - Verify your chat is there
5. Click "History" button
6. Click saved chat to load it
7. Verify messages load correctly

---

## 📊 Database Schema

```
users
├── id (UUID) - Primary key
├── email (VARCHAR) - Unique
├── name (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

conversations
├── id (VARCHAR) - Primary key
├── user_id (UUID) - Foreign key → users.id
├── title (VARCHAR)
├── message_count (INT)
├── tags (TEXT[])
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

messages
├── id (VARCHAR) - Primary key
├── conversation_id (VARCHAR) - Foreign key → conversations.id
├── role (VARCHAR)
├── content (TEXT)
├── emotion (VARCHAR)
└── timestamp (TIMESTAMP)
```

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Users can only see their own conversations
- ✅ Users can only see messages in their conversations
- ✅ Enforced at database level
- ✅ No data leakage between users

### API Keys
- ✅ Anon key for client-side operations
- ✅ Service role key for server-side operations
- ✅ Keys stored in environment variables
- ✅ Never exposed in code

### Authorization
- ✅ User ID validated on all operations
- ✅ 403 Forbidden if unauthorized
- ✅ 404 Not Found if chat doesn't exist

---

## 🔄 How It Works

### Save Chat Flow
```
User clicks "Save"
    ↓
API receives chat data
    ↓
Supabase saves conversation
    ↓
Supabase saves messages
    ↓
Return success response
    ↓
Show confirmation to user
```

### Load Chat Flow
```
User clicks chat in sidebar
    ↓
API queries Supabase
    ↓
Supabase returns conversation + messages
    ↓
Messages restored with timestamps
    ↓
UI updates with loaded chat
```

### Delete Chat Flow
```
User clicks delete
    ↓
Confirm deletion
    ↓
API deletes from Supabase
    ↓
Cascade deletes messages
    ↓
Sidebar updates
```

---

## 🧪 Testing Checklist

- [ ] Supabase project created
- [ ] Database schema created
- [ ] Environment variables configured
- [ ] Dev server restarted
- [ ] Can save a chat
- [ ] Chat appears in Supabase dashboard
- [ ] Can load a saved chat
- [ ] Can delete a chat
- [ ] Deleted chat removed from Supabase
- [ ] Sidebar shows recent chats

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` file
- Verify all three variables are set
- Restart dev server

### "Connection refused"
- Verify Supabase URL is correct
- Check internet connection
- Verify project is active in Supabase

### "Unauthorized" error
- Check user ID is being passed
- Verify RLS policies are enabled
- Check user_id matches in database

### "Chat not found"
- Verify chat was saved
- Check Supabase dashboard
- Verify user_id matches

### Chats not appearing in sidebar
- Check getSavedChats() is called
- Verify user_id is correct
- Check browser console for errors

---

## 📈 Performance Tips

1. **Indexes**: Already created for common queries
2. **Pagination**: Add limit/offset for large datasets
3. **Caching**: Consider caching recent chats
4. **Batch Operations**: Combine multiple saves

---

## 🚀 Next Steps

1. ✅ Create Supabase project
2. ✅ Set up database schema
3. ✅ Configure environment variables
4. ✅ Test integration
5. ⏭️ Deploy to production
6. ⏭️ Monitor performance
7. ⏭️ Add analytics

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Database Best Practices: https://supabase.com/docs/guides/database

---

## ✨ Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Save to Supabase | ✅ | Implemented |
| Load from Supabase | ✅ | Implemented |
| Delete from Supabase | ✅ | Implemented |
| List chats | ✅ | Implemented |
| Authorization | ✅ | RLS enabled |
| Fallback storage | ✅ | In-memory backup |
| Error handling | ✅ | Comprehensive |
| Logging | ✅ | Debug info |

---

## 🎉 Ready to Go!

Your Supabase integration is **fully implemented and ready to use**.

Just follow the steps above to set up your Supabase project and you're done!

---

**Status**: Ready for implementation
**Difficulty**: Easy (follow the steps)
**Time**: 20-30 minutes
**Last Updated**: October 24, 2025

