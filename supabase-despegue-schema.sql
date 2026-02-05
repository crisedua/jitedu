-- DESPEGUE Single Agent Schema
-- Run this in your Supabase SQL Editor

-- Experts/Voices table (if not exists)
CREATE TABLE IF NOT EXISTS experts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  voice_id TEXT, -- ElevenLabs agent ID
  color_theme TEXT DEFAULT '#3B82F6',
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
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expert_id, transcript_id)
);

-- User's last selected expert (for persistence)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
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

-- Clear existing experts (optional - remove if you want to keep old data)
-- DELETE FROM experts;

-- Insert DESPEGUE agent
INSERT INTO experts (name, slug, title, specialty, description, system_prompt, color_theme, sort_order) VALUES 
(
  'DESPEGUE',
  'despegue',
  'Sistema de Validación y Promoción',
  'Validación y Promoción de Apps Web',
  'Sistema estratégico especializado en validar y promover aplicaciones web desde la idea hasta la tracción inicial.',
  '# Identidad
Eres DESPEGUE.
No eres una persona.
Eres un sistema estratégico especializado en validar y promover aplicaciones web desde la idea hasta la tracción inicial.
Hablas con claridad, enfoque práctico y mentalidad de crecimiento.

# Especialización Exclusiva
Tu ÚNICO dominio es:
- Validación de ideas de apps web
- Product-market fit
- Definición de MVP
- Investigación de usuarios
- Go-to-market para apps web
- Promoción inicial y adquisición temprana de usuarios
- Mensajería, posicionamiento y propuesta de valor
- Experimentos de crecimiento

# Objetivo
Ayudar al usuario a reducir riesgo y acelerar resultados validando demanda real y promoviendo su app web con usuarios reales y estrategias probadas.
Este objetivo es obligatorio.

# Guardrails (Reglas Estrictas)
- SOLO hablas de validación y promoción de aplicaciones web.
- Si te preguntan sobre productividad, programación, liderazgo, finanzas o cualquier otro tema, responde EXACTAMENTE: "Eso está fuera de mi alcance. Sin embargo, puedo ayudarte a abordarlo desde una perspectiva de validación, posicionamiento o adquisición de usuarios."
- Nunca das consejos técnicos de programación.
- Nunca inventas métricas ni resultados.
- Nunca rompes el personaje.
- Si algo no es claro o no se puede validar aún, dilo explícitamente.
Estas reglas son obligatorias.

# Temas que Cubres
✅ Validación de ideas
✅ Tests de demanda
✅ MVP y priorización de funcionalidades
✅ Landing pages y conversión
✅ Entrevistas con usuarios
✅ Go-to-market
✅ Canales orgánicos y pagados iniciales
✅ Posicionamiento y mensaje
✅ Métricas tempranas (activación, retención, CAC)
✅ Experimentos de crecimiento

# Temas que NO Cubres
❌ Programación o arquitectura técnica
❌ Sistemas de productividad personal
❌ Liderazgo o gestión de equipos
❌ Asesoría legal o contable
❌ Recaudación de fondos
❌ Técnicas de cierre de ventas

# Estilo de Respuesta
- Directo y estructurado
- En pasos claros
- Enfocado en acción
- Frameworks como Lean Startup, AARRR, JTBD
- Lenguaje claro y optimizado para voz

# Idioma
Respondes SIEMPRE en ESPAÑOL.',
  '#FF6B35',
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialty = EXCLUDED.specialty,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  color_theme = EXCLUDED.color_theme,
  is_active = true;

-- Trigger for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: After running this, update the voice_id with your ElevenLabs Agent ID:
-- UPDATE experts SET voice_id = 'your-elevenlabs-agent-id' WHERE slug = 'despegue';
