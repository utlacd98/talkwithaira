-- ============================================
-- AIRA DASHBOARD FEATURES - DATABASE MIGRATION
-- ============================================
-- This migration adds tables for mood tracking,
-- journaling, affirmations, and emotional journey
-- ============================================

-- Mood Entries Table
-- Stores user mood check-ins with scores from 0-10
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
  ON mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================

-- Journal Entries Table
-- Stores user journal/reflection entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  mood_score DECIMAL(3,1) CHECK (mood_score >= 0 AND mood_score <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================

-- Affirmation Views Table
-- Tracks when users view their daily affirmations
CREATE TABLE IF NOT EXISTS affirmation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affirmation_views_user_id ON affirmation_views(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmation_views_created_at ON affirmation_views(created_at DESC);

-- Enable Row Level Security
ALTER TABLE affirmation_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affirmation_views
CREATE POLICY "Users can view their own affirmation views"
  ON affirmation_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affirmation views"
  ON affirmation_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================

-- Add user_id column to messages table if it doesn't exist
-- This allows us to track chat streaks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_messages_user_id ON messages(user_id);
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
-- - mood_entries (mood tracking with scores 0-10)
-- - journal_entries (user reflections and journaling)
-- - affirmation_views (daily affirmation tracking)
--
-- All tables have:
-- - Row Level Security enabled
-- - Proper indexes for performance
-- - User isolation via RLS policies
-- ============================================

