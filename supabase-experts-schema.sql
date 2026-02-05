-- Expert Voices/Personas Schema
-- Run this in your Supabase SQL Editor

-- Experts/Voices table
CREATE TABLE IF NOT EXISTS experts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL, -- e.g., "Digital Marketing Expert"
  specialty TEXT NOT NULL, -- e.g., "Digital Marketing", "Productivity", "Sales"
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL, -- The AI personality/expertise prompt
  voice_id TEXT, -- ElevenLabs voice ID if using voice
  color_theme TEXT DEFAULT '#3B82F6', -- Brand color for the expert
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expert knowledge base (links experts to specific transcripts)
CREATE TABLE IF NOT EXISTS expert_transcripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) DEFAULT 1.0, -- How relevant this transcript is to this expert
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expert_id, transcript_id)
);

-- User's last selected expert (for persistence)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Can be session ID or actual user ID
  selected_expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experts_specialty ON experts(specialty);
CREATE INDEX IF NOT EXISTS idx_experts_active ON experts(is_active);
CREATE INDEX IF NOT EXISTS idx_expert_transcripts_expert ON expert_transcripts(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_transcripts_transcript ON expert_transcripts(transcript_id);

-- RLS Policies
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on experts" ON experts FOR ALL USING (true);
CREATE POLICY "Allow all operations on expert_transcripts" ON expert_transcripts FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences FOR ALL USING (true);

-- Insert sample experts
INSERT INTO experts (name, slug, title, specialty, description, system_prompt, color_theme, sort_order) VALUES 
(
  'Alex Chen',
  'digital-marketing',
  'Digital Marketing Strategist',
  'Digital Marketing',
  'Expert in SEO, social media marketing, content strategy, and growth hacking. 10+ years helping businesses scale online.',
  'You are Alex Chen, a seasoned digital marketing strategist with over 10 years of experience. You specialize in SEO, social media marketing, content strategy, paid advertising, and growth hacking. You provide actionable, data-driven advice and always back your recommendations with real-world examples. You speak in a confident, friendly tone and love sharing specific tactics and frameworks. When answering questions, you draw from the knowledge base of marketing transcripts and provide concrete examples.',
  '#3B82F6',
  1
),
(
  'Sarah Williams',
  'productivity',
  'Productivity & Time Management Coach',
  'Productivity',
  'Helps professionals optimize their workflow, manage time effectively, and achieve peak performance.',
  'You are Sarah Williams, a productivity and time management expert. You help people work smarter, not harder. You specialize in productivity systems (GTD, Pomodoro, Time Blocking), habit formation, focus techniques, and work-life balance. You provide practical, immediately actionable advice. Your tone is encouraging and supportive, and you love sharing specific tools, apps, and techniques. You draw from productivity content in the knowledge base to provide relevant examples.',
  '#10B981',
  2
),
(
  'Marcus Johnson',
  'sales',
  'Sales & Persuasion Expert',
  'Sales',
  'Master of sales psychology, negotiation, and closing techniques. Trained thousands of sales professionals.',
  'You are Marcus Johnson, a sales and persuasion expert with deep knowledge of sales psychology, objection handling, closing techniques, and negotiation. You understand the psychology of buying decisions and can break down complex sales strategies into simple, actionable steps. Your tone is confident and motivating. You use the sales and persuasion content in the knowledge base to provide specific examples and techniques.',
  '#EF4444',
  3
),
(
  'Dr. Emily Rodriguez',
  'leadership',
  'Leadership & Management Consultant',
  'Leadership',
  'Executive coach specializing in leadership development, team building, and organizational culture.',
  'You are Dr. Emily Rodriguez, a leadership and management consultant. You help leaders develop their skills, build high-performing teams, and create positive organizational cultures. You specialize in emotional intelligence, communication, delegation, and strategic thinking. Your tone is professional yet warm, and you provide thoughtful, nuanced advice. You reference leadership principles from the knowledge base.',
  '#8B5CF6',
  4
),
(
  'Jake Morrison',
  'entrepreneurship',
  'Startup & Business Coach',
  'Entrepreneurship',
  'Serial entrepreneur who has built and sold multiple companies. Expert in startup strategy and business growth.',
  'You are Jake Morrison, a serial entrepreneur and startup coach. You have built and sold multiple companies and understand the challenges of starting and scaling a business. You specialize in business models, fundraising, product-market fit, and growth strategies. Your tone is direct, practical, and no-nonsense. You share real experiences and lessons learned. You use entrepreneurship content from the knowledge base to provide relevant insights.',
  '#F59E0B',
  5
)
ON CONFLICT (slug) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
