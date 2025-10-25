# ✅ Supabase Setup Checklist

## Status: IN PROGRESS ⏳

---

## ✅ COMPLETED STEPS

### Step 1: Create Supabase Project
- ✅ Project created: `aira-chat`
- ✅ Project URL: `https://sapqfourswlsytfcibdc.supabase.co`
- ✅ Status: Active

### Step 2: Get API Keys
- ✅ Anon Key: Retrieved
- ✅ Service Role Key: Retrieved
- ✅ Status: Complete

### Step 3: Configure Environment Variables
- ✅ `.env.local` updated with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Status: Complete

### Step 4: Restart Dev Server
- ✅ Dev server restarted
- ✅ Running on: `http://localhost:3000` (or 3001 if port in use)
- ✅ Status: Running

---

## ⏳ REMAINING STEPS

### Step 5: Create Database Schema

**Status**: ⏳ PENDING

**What to do**:
1. Go to https://app.supabase.com
2. Select your `aira-chat` project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL below
6. Click "Run"

**SQL to run**:

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
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

**After running SQL**:
- ✅ Check that no errors appear
- ✅ You should see "Success" message
- ✅ Go to "Table Editor" to verify tables were created

---

### Step 6: Test Integration

**Status**: ⏳ PENDING

**What to do**:
1. Go to http://localhost:3000/chat
2. Have a conversation with Aira
3. Click the "Save" button
4. Enter a title for your chat
5. Click "Save Chat"
6. You should see a success message

**Verify in Supabase**:
1. Go to https://app.supabase.com
2. Select your `aira-chat` project
3. Click "Table Editor"
4. Click "conversations" table
5. You should see your saved chat

**Load the chat**:
1. Go back to http://localhost:3000/chat
2. Click the "History" button (top left)
3. You should see your saved chat in the sidebar
4. Click on it to load it
5. Your messages should appear

---

## 🎯 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Your Project**: https://app.supabase.com/project/sapqfourswlsytfcibdc
- **Chat App**: http://localhost:3000/chat
- **API Docs**: https://supabase.com/docs

---

## 📊 Environment Variables

Your `.env.local` now contains:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sapqfourswlsytfcibdc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🔐 Security Notes

- ✅ Anon key is safe to use in browser (RLS enabled)
- ✅ Service role key is secret (server-side only)
- ✅ Never commit `.env.local` to git
- ✅ RLS policies protect user data

---

## 🚀 What's Ready

| Component | Status | Details |
|-----------|--------|---------|
| Supabase Project | ✅ | Created and active |
| API Keys | ✅ | Configured in .env.local |
| Dev Server | ✅ | Running on localhost:3000 |
| Code Integration | ✅ | Supabase client ready |
| Database Schema | ⏳ | Awaiting your SQL execution |
| Testing | ⏳ | Ready after schema creation |

---

## 📝 Next Action

**👉 Run the SQL in Step 5 above in your Supabase SQL Editor**

Once you do that, everything will be ready to test!

---

## ✨ After Setup Complete

Once you complete Step 5 (create database schema), you'll have:

- ✅ Real persistent database for chats
- ✅ Automatic conversation saving
- ✅ Load previous conversations
- ✅ Delete conversations
- ✅ User data isolation with RLS
- ✅ Production-ready setup

---

## 🆘 Troubleshooting

### "Connection refused" error
- Check Supabase project is active
- Verify URL in `.env.local` is correct
- Check internet connection

### "Unauthorized" error
- RLS policies not yet created (run SQL in Step 5)
- Check user_id is correct

### "Table not found" error
- Database schema not created yet
- Run SQL in Step 5

### Dev server not starting
- Check port 3000 is available
- Try port 3001 instead
- Check `.env.local` is valid

---

## 📞 Support

See these files for more help:
- `SUPABASE_QUICK_REFERENCE.md` - Quick answers
- `SUPABASE_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `SUPABASE_SETUP_GUIDE.md` - Complete setup

---

**Status**: ✅ 80% Complete - Just need to run the SQL!
**Time Remaining**: 5 minutes
**Difficulty**: Very Easy (just copy-paste SQL)

