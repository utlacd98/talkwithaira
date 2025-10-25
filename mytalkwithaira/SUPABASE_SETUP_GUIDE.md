# 🚀 Supabase Integration Setup Guide

## Overview

This guide will help you set up Supabase as the backend database for Aira's chat persistence system.

---

## 📋 Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js and npm installed
- Your Aira project running locally

---

## 🎯 Step 1: Create Supabase Project

### 1.1 Sign Up / Log In
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Verify your email

### 1.2 Create New Project
1. Click "New Project"
2. Enter project name: `aira-chat`
3. Enter database password (save this!)
4. Select region closest to you
5. Click "Create new project"
6. Wait for project to initialize (2-3 minutes)

### 1.3 Get Connection Details
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (public key)
   - **Service Role Key**: `eyJhbGc...` (secret key)

---

## 🔧 Step 2: Install Supabase Client

```bash
cd mytalkwithaira
npm install @supabase/supabase-js
```

---

## 📊 Step 3: Create Database Schema

### 3.1 Create Tables in Supabase

Go to Supabase Dashboard → SQL Editor → New Query

#### Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Create Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

#### Create Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  emotion VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

### 3.2 Enable Row Level Security (RLS)

```sql
-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own conversations
CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Create policy: Users can insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

---

## 🔑 Step 4: Configure Environment Variables

### 4.1 Update .env.local

Add these to your `.env.local` file:

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
- `NEXT_PUBLIC_*` variables are exposed to the browser (use anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is secret (never expose to browser)

---

## 📁 Step 5: Create Supabase Client

Create `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## 🔄 Step 6: Update API Route

Update `/app/api/chat/save/route.ts` to use Supabase:

```typescript
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save to Supabase
    const { error } = await supabaseServer
      .from('conversations')
      .insert({
        id: chatId,
        user_id: body.userId,
        title: body.title,
        message_count: body.messages.length,
        tags: body.tags || [],
      })
    
    if (error) throw error
    
    // Save messages
    const messages = body.messages.map((m: any) => ({
      id: m.id,
      conversation_id: chatId,
      role: m.role,
      content: m.content,
      emotion: m.emotion,
      timestamp: m.timestamp,
    }))
    
    const { error: msgError } = await supabaseServer
      .from('messages')
      .insert(messages)
    
    if (msgError) throw msgError
    
    return NextResponse.json({
      success: true,
      chatId,
      title: body.title,
      messageCount: body.messages.length,
      tags: body.tags || [],
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Save Chat API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save chat' },
      { status: 500 }
    )
  }
}
```

---

## 🧪 Step 7: Test Integration

### 7.1 Test Save Chat
```bash
curl -X POST http://localhost:3000/api/chat/save \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Chat",
    "messages": [
      {"id": "1", "role": "user", "content": "Hello", "timestamp": "2025-10-24T14:00:00Z"},
      {"id": "2", "role": "assistant", "content": "Hi there", "timestamp": "2025-10-24T14:01:00Z"}
    ],
    "userId": "user123"
  }'
```

### 7.2 Test in Browser
1. Go to http://localhost:3000/chat
2. Have a conversation
3. Click "Save"
4. Check Supabase dashboard → conversations table
5. Verify data is saved

---

## 📈 Database Schema Diagram

```
users
├── id (UUID)
├── email (VARCHAR)
├── name (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

conversations
├── id (VARCHAR) - PRIMARY KEY
├── user_id (UUID) - FOREIGN KEY → users.id
├── title (VARCHAR)
├── message_count (INT)
├── tags (TEXT[])
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

messages
├── id (VARCHAR) - PRIMARY KEY
├── conversation_id (VARCHAR) - FOREIGN KEY → conversations.id
├── role (VARCHAR)
├── content (TEXT)
├── emotion (VARCHAR)
└── timestamp (TIMESTAMP)
```

---

## 🔐 Security Best Practices

1. **Row Level Security (RLS)**
   - ✅ Enabled on all tables
   - ✅ Users can only access their own data
   - ✅ Policies enforce authorization

2. **API Keys**
   - ✅ Anon key for client-side operations
   - ✅ Service role key for server-side operations
   - ✅ Never expose service role key to browser

3. **Environment Variables**
   - ✅ Store in .env.local (not in code)
   - ✅ Add .env.local to .gitignore
   - ✅ Use NEXT_PUBLIC_ prefix for browser-safe variables

---

## 🚀 Next Steps

1. Create Supabase project
2. Set up database schema
3. Configure environment variables
4. Update API routes
5. Test integration
6. Deploy to production

---

## 📞 Troubleshooting

### Connection Error
- Verify Supabase URL and keys
- Check .env.local file
- Restart dev server

### RLS Policy Error
- Check user authentication
- Verify user_id matches
- Check policy syntax

### Table Not Found
- Verify tables created in SQL editor
- Check table names match exactly
- Verify schema is public

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

**Status**: Ready to implement
**Difficulty**: Medium
**Time**: 30-45 minutes

