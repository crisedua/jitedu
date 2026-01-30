// Simplified Supabase integration for transcript + chat
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Using localStorage fallback.');
}

// Helper to generate UUIDs for localStorage items
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// ============ TRANSCRIPTS ============

export const saveTranscript = async (title, transcriptText, aiAnalysis = null) => {
  const newTranscript = {
    id: generateUUID(),
    title: title || 'Sin título',
    transcript_text: transcriptText,
    ai_analysis: aiAnalysis,
    status: aiAnalysis ? 'completed' : 'pending',
    created_at: new Date().toISOString()
  };

  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('transcripts')
      .insert([{
        id: newTranscript.id, // Use generated ID or let DB generate it (if we omitted it)
        title: newTranscript.title,
        transcript_text: newTranscript.transcript_text,
        ai_analysis: newTranscript.ai_analysis,
        status: newTranscript.status
      }])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.warn('Database error, falling back to localStorage:', error);

    // LocalStorage Fallback
    const stored = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
    stored.unshift(newTranscript);
    localStorage.setItem('local_transcripts', JSON.stringify(stored));

    return newTranscript;
  }
};

export const updateTranscriptAnalysis = async (transcriptId, aiAnalysis, status = 'completed') => {
  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('transcripts')
      .update({
        ai_analysis: aiAnalysis,
        status: status
      })
      .eq('id', transcriptId)
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.warn('Database update error, falling back to localStorage:', error);

    // LocalStorage Fallback
    const stored = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
    const index = stored.findIndex(t => t.id === transcriptId);

    if (index !== -1) {
      stored[index].ai_analysis = aiAnalysis;
      stored[index].status = status;
      localStorage.setItem('local_transcripts', JSON.stringify(stored));
      return stored[index];
    }

    throw new Error('Transcript not found in local storage');
  }
};

export const updateTranscriptError = async (transcriptId, errorMessage) => {
  // Not critical to fallback specific error updates to localstorage, but we can try
  try {
    if (supabase) {
      await supabase.from('transcripts')
        .update({ status: 'error', error_message: errorMessage })
        .eq('id', transcriptId);
    }
  } catch (e) { console.warn('Failed to update error status'); }
};

export const getTranscript = async (transcriptId) => {
  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.log('Database fetch error (or offline), checking localStorage');

    const stored = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
    const found = stored.find(t => t.id === transcriptId);

    if (found) return found;
    throw error;
  }
};

export const getRecentTranscripts = async (limit = 20) => {
  let dbTranscripts = [];
  let localTranscripts = [];

  // Get LocalStorage items
  try {
    localTranscripts = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
  } catch (e) { }

  // Get DB items if possible
  if (supabase) {
    try {
      const { data } = await supabase
        .from('transcripts')
        .select('id, title, status, created_at, transcript_text, ai_analysis')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (data) dbTranscripts = data;
    } catch (e) {
      console.warn('Could not fetch from DB, showing local only');
    }
  }

  // Merge and sort (simple merge, might have duplicates if ID logic wasn't perfect, but UUIDs help)
  // We prioritize local ones if we only want "offline" access, or we can just show what we found.
  // For simplicity, let's just return the one that worked, or merge them.
  // If DB failed, dbTranscripts is empty.

  if (dbTranscripts.length === 0) return localTranscripts.slice(0, limit);

  return dbTranscripts;
};

// Get transcripts that have no AI analysis
export const getUnanalyzedTranscripts = async (limit = 20) => {
  if (supabase) {
    try {
      const { data } = await supabase
        .from('transcripts')
        .select('*')
        .is('ai_analysis', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    } catch (e) {
      console.warn('Error fetching unanalyzed:', e);
      return [];
    }
  }
  return [];
};

export const deleteTranscript = async (transcriptId) => {
  try {
    if (supabase) {
      await supabase.from('transcripts').delete().eq('id', transcriptId);
    }
  } catch (e) { }

  // Always delete from local too/fallback
  const stored = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
  const filtered = stored.filter(t => t.id !== transcriptId);
  localStorage.setItem('local_transcripts', JSON.stringify(filtered));
};

// ============ CHAT MESSAGES ============

export const saveChatMessage = async (transcriptId, role, content) => {
  const newMessage = {
    id: generateUUID(),
    transcript_id: transcriptId,
    role: role,
    content: content,
    created_at: new Date().toISOString()
  };

  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        transcript_id: transcriptId,
        role: role,
        content: content
      }])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    // LocalStorage Fallback for chats
    const allChats = JSON.parse(localStorage.getItem('local_chats') || '{}');
    if (!allChats[transcriptId]) allChats[transcriptId] = [];

    allChats[transcriptId].push(newMessage);
    localStorage.setItem('local_chats', JSON.stringify(allChats));

    return newMessage;
  }
};

export const getChatMessages = async (transcriptId) => {
  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('transcript_id', transcriptId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];

  } catch (error) {
    // LocalStorage Fallback
    const allChats = JSON.parse(localStorage.getItem('local_chats') || '{}');
    return allChats[transcriptId] || [];
  }
};

export const clearChatMessages = async (transcriptId) => {
  try {
    if (supabase) {
      await supabase.from('chat_messages').delete().eq('transcript_id', transcriptId);
    }
  } catch (e) { }

  const allChats = JSON.parse(localStorage.getItem('local_chats') || '{}');
  delete allChats[transcriptId];
  localStorage.setItem('local_chats', JSON.stringify(allChats));
};

export const updateTranscriptFields = async (transcriptId, fields) => {
  try {
    if (!supabase) throw new Error('No Supabase client');

    const { data, error } = await supabase
      .from('transcripts')
      .update(fields)
      .eq('id', transcriptId)
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.warn('Database update error, falling back to localStorage:', error);

    // LocalStorage Fallback
    const stored = JSON.parse(localStorage.getItem('local_transcripts') || '[]');
    const index = stored.findIndex(t => t.id === transcriptId);

    if (index !== -1) {
      stored[index] = { ...stored[index], ...fields };
      localStorage.setItem('local_transcripts', JSON.stringify(stored));
      return stored[index];
    }

    throw new Error('Transcript not found in local storage');
  }
};

export { supabase };
