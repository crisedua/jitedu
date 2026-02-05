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
    
    // Simple keyword matching for auto-assignment
    const keywords = {
      'digital-marketing': ['marketing', 'seo', 'social media', 'advertising', 'content', 'growth'],
      'productivity': ['productivity', 'time management', 'focus', 'habits', 'workflow', 'efficiency'],
      'sales': ['sales', 'closing', 'negotiation', 'objection', 'persuasion', 'conversion'],
      'leadership': ['leadership', 'management', 'team', 'culture', 'delegation', 'coaching'],
      'entrepreneurship': ['startup', 'business', 'entrepreneur', 'funding', 'growth', 'scale']
    };

    const text = (transcriptText + ' ' + JSON.stringify(analysis)).toLowerCase();

    for (const expert of experts) {
      const expertKeywords = keywords[expert.slug] || [];
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
    id: 'default-marketing',
    name: 'Alex Chen',
    slug: 'digital-marketing',
    title: 'Digital Marketing Strategist',
    specialty: 'Digital Marketing',
    description: 'Expert in SEO, social media marketing, content strategy, and growth hacking.',
    system_prompt: 'You are Alex Chen, a seasoned digital marketing strategist with over 10 years of experience. You specialize in SEO, social media marketing, content strategy, paid advertising, and growth hacking. You provide actionable, data-driven advice.',
    color_theme: '#3B82F6',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'default-productivity',
    name: 'Sarah Williams',
    slug: 'productivity',
    title: 'Productivity & Time Management Coach',
    specialty: 'Productivity',
    description: 'Helps professionals optimize their workflow and achieve peak performance.',
    system_prompt: 'You are Sarah Williams, a productivity and time management expert. You help people work smarter, not harder. You specialize in productivity systems, habit formation, and focus techniques.',
    color_theme: '#10B981',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'default-sales',
    name: 'Marcus Johnson',
    slug: 'sales',
    title: 'Sales & Persuasion Expert',
    specialty: 'Sales',
    description: 'Master of sales psychology, negotiation, and closing techniques.',
    system_prompt: 'You are Marcus Johnson, a sales and persuasion expert with deep knowledge of sales psychology, objection handling, and closing techniques.',
    color_theme: '#EF4444',
    is_active: true,
    sort_order: 3
  },
  {
    id: 'default-leadership',
    name: 'Dr. Emily Rodriguez',
    slug: 'leadership',
    title: 'Leadership & Management Consultant',
    specialty: 'Leadership',
    description: 'Executive coach specializing in leadership development and team building.',
    system_prompt: 'You are Dr. Emily Rodriguez, a leadership and management consultant. You help leaders develop their skills and build high-performing teams.',
    color_theme: '#8B5CF6',
    is_active: true,
    sort_order: 4
  },
  {
    id: 'default-entrepreneurship',
    name: 'Jake Morrison',
    slug: 'entrepreneurship',
    title: 'Startup & Business Coach',
    specialty: 'Entrepreneurship',
    description: 'Serial entrepreneur expert in startup strategy and business growth.',
    system_prompt: 'You are Jake Morrison, a serial entrepreneur and startup coach. You have built and sold multiple companies and understand the challenges of starting and scaling a business.',
    color_theme: '#F59E0B',
    is_active: true,
    sort_order: 5
  }
];
