-- Marketing AI Chat Database Schema
-- Compatible with PostgreSQL 12+
-- Works with: Supabase, Neon, Railway, Render, etc.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing

-- ============================================
-- USERS TABLE
-- Only needed if NOT using Supabase Auth
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Store hashed passwords only
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- TRANSCRIPTS TABLE
-- Stores all transcript text and AI analysis
-- ============================================
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  transcript_text TEXT NOT NULL,
  ai_analysis JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHAT MESSAGES TABLE
-- Stores Q&A conversation history
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_transcript_id ON chat_messages(transcript_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
CREATE TRIGGER update_transcripts_updated_at 
    BEFORE UPDATE ON transcripts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - for Supabase)
-- Comment out if using a different database
-- ============================================
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations (replace with proper auth policies in production)
DROP POLICY IF EXISTS "Allow all operations on transcripts" ON transcripts;
DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON chat_messages;

CREATE POLICY "Allow all operations on transcripts" 
    ON transcripts 
    FOR ALL 
    USING (true);

CREATE POLICY "Allow all operations on chat_messages" 
    ON chat_messages 
    FOR ALL 
    USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- Run these after creating tables to verify
-- ============================================

-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transcripts', 'chat_messages');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('transcripts', 'chat_messages');

-- Sample insert to test (optional)
-- INSERT INTO transcripts (title, transcript_text, status) 
-- VALUES ('Test Transcript', 'This is a test transcript text.', 'completed');
