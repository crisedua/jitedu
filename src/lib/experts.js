// Expert/Voice management utilities
import { supabase } from './supabase-simple';

// Get all active experts
export const getExperts = async () => {
  try {
    if (!supabase) {
      // Fallback to default experts if no database
      return getDefaultExperts();
    }

    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || getDefaultExperts();
  } catch (error) {
    console.warn('Error loading experts, using defaults:', error);
    return getDefaultExperts();
  }
};

// Get a specific expert by slug
export const getExpertBySlug = async (slug) => {
  try {
    if (!supabase) {
      return getDefaultExperts().find(e => e.slug === slug);
    }

    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Error loading expert, using default:', error);
    return getDefaultExperts().find(e => e.slug === slug);
  }
};

// Get transcripts relevant to a specific expert
export const getExpertTranscripts = async (expertId) => {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('expert_transcripts')
      .select(`
        transcript_id,
        relevance_score,
        transcripts (*)
      `)
      .eq('expert_id', expertId)
      .order('relevance_score', { ascending: false });

    if (error) throw error;
    return data?.map(et => et.transcripts) || [];
  } catch (error) {
    console.warn('Error loading expert transcripts:', error);
    return [];
  }
};

// Save user's selected expert
export const saveSelectedExpert = async (userId, expertId) => {
  try {
    if (!supabase) {
      localStorage.setItem('selected_expert_id', expertId);
      return;
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        selected_expert_id: expertId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    localStorage.setItem('selected_expert_id', expertId);
  } catch (error) {
    console.warn('Error saving selected expert:', error);
    localStorage.setItem('selected_expert_id', expertId);
  }
};

// Get user's selected expert
export const getSelectedExpert = async (userId) => {
  try {
    // Try localStorage first
    const localExpertId = localStorage.getItem('selected_expert_id');
    
    if (!supabase) {
      return localExpertId;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('selected_expert_id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.selected_expert_id || localExpertId;
  } catch (error) {
    return localStorage.getItem('selected_expert_id');
  }
};

// Link a transcript to an expert
export const linkTranscriptToExpert = async (expertId, transcriptId, relevanceScore = 1.0) => {
  try {
    if (!supabase) return;

    const { error } = await supabase
      .from('expert_transcripts')
      .upsert({
        expert_id: expertId,
        transcript_id: transcriptId,
        relevance_score: relevanceScore
      });

    if (error) throw error;
  } catch (error) {
    console.warn('Error linking transcript to expert:', error);
  }
};

// Auto-assign transcripts to experts based on content
export const autoAssignTranscriptToExperts = async (transcriptId, transcriptText, analysis) => {
  try {
    const experts = await getExperts();
    
    // Keywords for DESPEGUE (web app validation and promotion)
    const keywords = {
      'despegue': [
        'validación', 'mvp', 'producto mínimo viable', 'product-market fit',
        'usuarios', 'clientes', 'demanda', 'mercado', 'landing page',
        'conversión', 'adquisición', 'crecimiento', 'growth', 'startup',
        'app web', 'aplicación', 'lanzamiento', 'promoción', 'marketing',
        'posicionamiento', 'propuesta de valor', 'go-to-market', 'gtm',
        'experimento', 'test', 'métrica', 'tracción', 'lean startup'
      ]
    };

    const text = (transcriptText + ' ' + JSON.stringify(analysis)).toLowerCase();

    for (const expert of experts) {
      const expertKeywords = keywords[expert.slug] || keywords['despegue'];
      const matchCount = expertKeywords.filter(keyword => text.includes(keyword)).length;
      
      if (matchCount > 0) {
        const relevanceScore = Math.min(1.0, matchCount / expertKeywords.length);
        await linkTranscriptToExpert(expert.id, transcriptId, relevanceScore);
      }
    }
  } catch (error) {
    console.warn('Error auto-assigning transcript:', error);
  }
};

// Default experts (fallback when database is not available)
const getDefaultExperts = () => [
  {
    id: 'default-despegue',
    name: 'DESPEGUE',
    slug: 'despegue',
    title: 'Sistema de Validación y Promoción',
    specialty: 'Validación y Promoción de Apps Web',
    description: 'Sistema estratégico especializado en validar y promover aplicaciones web desde la idea hasta la tracción inicial.',
    system_prompt: `# Identidad
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
Respondes SIEMPRE en ESPAÑOL.`,
    color_theme: '#FF6B35',
    is_active: true,
    sort_order: 1
  }
];
