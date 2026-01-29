import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database helper functions
export const db = {
  // Projects
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        description: projectData.description,
        settings: projectData.settings
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        videos (
          id,
          status,
          techniques_count:video_techniques(count)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProject(id) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        videos (
          *,
          video_techniques (
            *,
            techniques (*)
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Videos
  async createVideo(videoData) {
    const { data, error } = await supabase
      .from('videos')
      .insert([{
        project_id: videoData.project_id,
        title: videoData.title,
        channel: videoData.channel,
        url: videoData.url,
        transcript: videoData.transcript,
        status: videoData.status || 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getVideo(id) {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        project:projects(*),
        video_techniques (
          *,
          technique:techniques(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateVideo(id, updates) {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getVideosByProject(projectId) {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_techniques (
          technique:techniques(*)
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Techniques
  async createTechnique(techniqueData) {
    const { data, error } = await supabase
      .from('techniques')
      .insert([techniqueData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTechniques(filters = {}) {
    let query = supabase
      .from('techniques')
      .select(`
        *,
        video_techniques (
          *,
          video:videos(title, channel)
        ),
        technique_tags (
          tag:tags(name)
        )
      `);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.funnel_stage) {
      query = query.eq('funnel_stage', filters.funnel_stage);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getTechnique(id) {
    const { data, error } = await supabase
      .from('techniques')
      .select(`
        *,
        video_techniques (
          *,
          video:videos(*)
        ),
        technique_tags (
          tag:tags(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTechnique(id, updates) {
    const { data, error } = await supabase
      .from('techniques')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Video Techniques (relationships)
  async createVideoTechnique(videoTechniqueData) {
    const { data, error } = await supabase
      .from('video_techniques')
      .insert([videoTechniqueData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getVideoTechniques(videoId) {
    const { data, error } = await supabase
      .from('video_techniques')
      .select(`
        *,
        technique:techniques(*)
      `)
      .eq('video_id', videoId);
    
    if (error) throw error;
    return data;
  },

  // Tags
  async createTag(name) {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Analytics
  async getAnalytics() {
    const [projectsResult, videosResult, techniquesResult] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('videos').select('id', { count: 'exact' }),
      supabase.from('techniques').select('id', { count: 'exact' })
    ]);

    return {
      totalProjects: projectsResult.count || 0,
      totalVideos: videosResult.count || 0,
      totalTechniques: techniquesResult.count || 0
    };
  },

  async getTopTechniques(limit = 10) {
    const { data, error } = await supabase
      .from('techniques')
      .select(`
        *,
        video_techniques (count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToProject(projectId, callback) {
    return supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'videos',
          filter: `project_id=eq.${projectId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToVideo(videoId, callback) {
    return supabase
      .channel(`video-${videoId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'videos',
          filter: `id=eq.${videoId}`
        }, 
        callback
      )
      .subscribe();
  },

  unsubscribe(subscription) {
    return supabase.removeChannel(subscription);
  }
};

// Error handling helper
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error.code === '23505') {
    return 'This item already exists';
  }
  
  if (error.code === '23503') {
    return 'Cannot delete item - it is referenced by other data';
  }
  
  return error.message || 'An unexpected error occurred';
};