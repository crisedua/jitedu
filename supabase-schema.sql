-- Marketing Analyzer IA Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel TEXT,
  url TEXT,
  transcript TEXT,
  summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  duration INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Techniques table
CREATE TABLE IF NOT EXISTS techniques (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('conversion', 'credibility', 'engagement', 'awareness')),
  description TEXT,
  objective TEXT,
  funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'consideration', 'conversion', 'retention')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video techniques relationship table
CREATE TABLE IF NOT EXISTS video_techniques (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES techniques(id) ON DELETE CASCADE,
  evidence TEXT,
  timestamp_start INTEGER,
  timestamp_end INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, technique_id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technique tags relationship table
CREATE TABLE IF NOT EXISTS technique_tags (
  technique_id UUID REFERENCES techniques(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (technique_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_project_id ON videos(project_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_video_techniques_video_id ON video_techniques(video_id);
CREATE INDEX IF NOT EXISTS idx_video_techniques_technique_id ON video_techniques(technique_id);
CREATE INDEX IF NOT EXISTS idx_techniques_category ON techniques(category);
CREATE INDEX IF NOT EXISTS idx_techniques_funnel_stage ON techniques(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_techniques_created_at ON techniques(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_techniques_updated_at BEFORE UPDATE ON techniques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- For now, we'll allow all operations. In production, you'd want proper user authentication

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_tags ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (replace with proper auth policies in production)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on videos" ON videos FOR ALL USING (true);
CREATE POLICY "Allow all operations on techniques" ON techniques FOR ALL USING (true);
CREATE POLICY "Allow all operations on video_techniques" ON video_techniques FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on technique_tags" ON technique_tags FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO projects (name, description) VALUES 
('Proyecto de Prueba', 'Un proyecto de ejemplo para probar la aplicación')
ON CONFLICT DO NOTHING;

INSERT INTO tags (name) VALUES 
('urgencia'), ('social-proof'), ('storytelling'), ('hooks'), ('conversion'), ('engagement')
ON CONFLICT (name) DO NOTHING;

-- Create a view for technique statistics
CREATE OR REPLACE VIEW technique_stats AS
SELECT 
  t.id,
  t.name,
  t.category,
  t.funnel_stage,
  COUNT(vt.id) as usage_count,
  AVG(vt.confidence_score) as avg_confidence,
  MAX(vt.created_at) as last_used
FROM techniques t
LEFT JOIN video_techniques vt ON t.id = vt.technique_id
GROUP BY t.id, t.name, t.category, t.funnel_stage;

-- Create a view for project statistics
CREATE OR REPLACE VIEW project_stats AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT v.id) as video_count,
  COUNT(DISTINCT vt.technique_id) as unique_techniques,
  COUNT(vt.id) as total_technique_instances,
  AVG(vt.confidence_score) as avg_confidence,
  MAX(v.updated_at) as last_activity
FROM projects p
LEFT JOIN videos v ON p.id = v.project_id
LEFT JOIN video_techniques vt ON v.id = vt.video_id
GROUP BY p.id, p.name;