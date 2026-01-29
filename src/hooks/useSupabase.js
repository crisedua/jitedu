import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, handleSupabaseError, subscriptions } from '../lib/supabase';

// Projects hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: db.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => db.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error creating project:', handleSupabaseError(error));
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => db.updateProject(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
    onError: (error) => {
      console.error('Error updating project:', handleSupabaseError(error));
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error deleting project:', handleSupabaseError(error));
    }
  });
};

// Videos hooks
export const useVideo = (id) => {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => db.getVideo(id),
    enabled: !!id,
  });
};

export const useVideosByProject = (projectId) => {
  return useQuery({
    queryKey: ['videos', 'project', projectId],
    queryFn: () => db.getVideosByProject(projectId),
    enabled: !!projectId,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.createVideo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videos', 'project', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error creating video:', handleSupabaseError(error));
    }
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => db.updateVideo(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video', data.id] });
      queryClient.invalidateQueries({ queryKey: ['videos', 'project', data.project_id] });
    },
    onError: (error) => {
      console.error('Error updating video:', handleSupabaseError(error));
    }
  });
};

// Techniques hooks
export const useTechniques = (filters = {}) => {
  return useQuery({
    queryKey: ['techniques', filters],
    queryFn: () => db.getTechniques(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTechnique = (id) => {
  return useQuery({
    queryKey: ['technique', id],
    queryFn: () => db.getTechnique(id),
    enabled: !!id,
  });
};

export const useCreateTechnique = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.createTechnique,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques'] });
    },
    onError: (error) => {
      console.error('Error creating technique:', handleSupabaseError(error));
    }
  });
};

export const useUpdateTechnique = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => db.updateTechnique(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technique', data.id] });
      queryClient.invalidateQueries({ queryKey: ['techniques'] });
    },
    onError: (error) => {
      console.error('Error updating technique:', handleSupabaseError(error));
    }
  });
};

// Video Techniques hooks
export const useVideoTechniques = (videoId) => {
  return useQuery({
    queryKey: ['video-techniques', videoId],
    queryFn: () => db.getVideoTechniques(videoId),
    enabled: !!videoId,
  });
};

export const useCreateVideoTechnique = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.createVideoTechnique,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-techniques', data.video_id] });
      queryClient.invalidateQueries({ queryKey: ['video', data.video_id] });
    },
    onError: (error) => {
      console.error('Error creating video technique:', handleSupabaseError(error));
    }
  });
};

// Tags hooks
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: db.getTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: db.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      console.error('Error creating tag:', handleSupabaseError(error));
    }
  });
};

// Analytics hooks
export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: db.getAnalytics,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopTechniques = (limit = 10) => {
  return useQuery({
    queryKey: ['top-techniques', limit],
    queryFn: () => db.getTopTechniques(limit),
    staleTime: 10 * 60 * 1000,
  });
};

// Real-time hooks
export const useRealtimeProject = (projectId) => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const sub = subscriptions.subscribeToProject(projectId, (payload) => {
      console.log('Real-time update:', payload);
      queryClient.invalidateQueries({ queryKey: ['videos', 'project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    });

    setSubscription(sub);

    return () => {
      if (sub) {
        subscriptions.unsubscribe(sub);
      }
    };
  }, [projectId, queryClient]);

  return subscription;
};

export const useRealtimeVideo = (videoId) => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    const sub = subscriptions.subscribeToVideo(videoId, (payload) => {
      console.log('Real-time video update:', payload);
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    });

    setSubscription(sub);

    return () => {
      if (sub) {
        subscriptions.unsubscribe(sub);
      }
    };
  }, [videoId, queryClient]);

  return subscription;
};