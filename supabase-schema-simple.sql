-- Simplified Marketing Transcript Analyzer Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transcripts table: stores transcript text and AI analysis
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

-- Chat messages table: stores Q&A conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_transcript_id ON chat_messages(transcript_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations (replace with proper auth in production)
DROP POLICY IF EXISTS "Allow all operations on transcripts" ON transcripts;
DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON chat_messages;

CREATE POLICY "Allow all operations on transcripts" ON transcripts FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);

-- Suggested Questions Table
CREATE TABLE IF NOT EXISTS suggested_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_text TEXT NOT NULL,
  label TEXT, -- Short text for button label if different from question
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for suggested_questions
ALTER TABLE suggested_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access on suggested_questions" ON suggested_questions;
CREATE POLICY "Allow read access on suggested_questions" ON suggested_questions FOR SELECT USING (true);
-- Allow write access? Maybe for admins only, but for now allow all to simplify dev
DROP POLICY IF EXISTS "Allow all on suggested_questions" ON suggested_questions;
CREATE POLICY "Allow all on suggested_questions" ON suggested_questions FOR ALL USING (true);

-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_suggested_questions_text ON suggested_questions(question_text);

-- Insert initial suggestions
INSERT INTO suggested_questions (question_text, label, category) VALUES
('¿Cuáles son las 3 técnicas más efectivas que usa?', '3 Técnicas Efectivas', 'analysis'),
('¿Cómo puedo aplicar estas técnicas en mi negocio?', 'Aplicar en mi negocio', 'application'),
('¿Qué CTA usa y por qué es efectivo?', 'Análisis de CTA', 'marketing')
ON CONFLICT (question_text) DO NOTHING;
