// YouTube API utilities
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const validateYouTubeUrl = (url) => {
  const videoId = extractVideoId(url);
  return {
    isValid: !!videoId,
    videoId,
    cleanUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
  };
};

export const parseUrlBatch = (text) => {
  const lines = text.split(/[\n,\s]+/).filter(line => line.trim());
  const results = {
    valid: [],
    invalid: [],
    duplicates: []
  };
  
  const seenIds = new Set();
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const validation = validateYouTubeUrl(trimmed);
    
    if (!validation.isValid) {
      results.invalid.push({ url: trimmed, reason: 'Invalid YouTube URL format' });
      return;
    }
    
    if (seenIds.has(validation.videoId)) {
      results.duplicates.push({ url: trimmed, videoId: validation.videoId });
      return;
    }
    
    seenIds.add(validation.videoId);
    results.valid.push({
      originalUrl: trimmed,
      cleanUrl: validation.cleanUrl,
      videoId: validation.videoId
    });
  });
  
  return results;
};

// Mock YouTube API functions (replace with real API calls)
export const getVideoMetadata = async (videoId) => {
  // Real implementation using YouTube Data API v3
  try {
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('YouTube API key not configured, using mock data');
      return getMockVideoMetadata(videoId);
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or not accessible');
    }
    
    const video = data.items[0];
    
    return {
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId
    };
    
  } catch (error) {
    console.error('Failed to get video metadata:', error);
    
    // Fallback to mock data for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock video metadata for development');
      return getMockVideoMetadata(videoId);
    }
    
    throw error;
  }
};

const getMockVideoMetadata = async (videoId) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    id: videoId,
    title: `10 Estrategias de Marketing que Funcionan en 2024 - ${videoId}`,
    channelTitle: 'Marketing Pro',
    channelId: 'UC' + videoId.substring(0, 22),
    publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 'PT10M30S', // ISO 8601 duration format
    description: 'En este video aprenderás las estrategias de marketing más efectivas para hacer crecer tu negocio en 2024...',
    thumbnails: {
      default: { url: `https://img.youtube.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
      medium: { url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180 },
      high: { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 }
    },
    viewCount: Math.floor(Math.random() * 100000) + 1000,
    likeCount: Math.floor(Math.random() * 5000) + 100,
    tags: ['marketing', 'estrategias', 'negocios', 'ventas', 'crecimiento'],
    categoryId: '22' // People & Blogs
  };
};

export const getVideoTranscript = async (videoId, preferredLanguage = 'es') => {
  // Real implementation - calls your backend service
  try {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiBaseUrl}/api/transcript/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: preferredLanguage,
        fallbackLanguages: ['en', 'auto']
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No transcript available for this video');
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to extract transcript');
    }
    
    return {
      transcript: data.transcript,
      language: data.language,
      extractedAt: data.extractedAt,
      method: data.method
    };
    
  } catch (error) {
    console.error('Transcript extraction failed:', error);
    
    // Fallback to mock data for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock transcript data for development');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate some videos not having transcripts
      if (Math.random() < 0.2) {
        throw new Error('No transcript available for this video');
      }
      
      return {
        transcript: [
          {
            text: "Bienvenidos a este video donde vamos a hablar de estrategias de marketing que realmente funcionan.",
            start: 0,
            duration: 4.5
          },
          {
            text: "Primero, hablemos de la importancia de crear urgencia en tus ofertas.",
            start: 4.5,
            duration: 3.8
          },
          {
            text: "Necesitas dar a las personas una razón para actuar ahora, no después.",
            start: 8.3,
            duration: 3.2
          },
          {
            text: "Una técnica que uso son los bonos por tiempo limitado que expiran a medianoche.",
            start: 11.5,
            duration: 4.1
          },
          {
            text: "Esto crea escasez genuina y impulsa la acción inmediata.",
            start: 15.6,
            duration: 3.4
          }
        ],
        language: preferredLanguage,
        extractedAt: new Date().toISOString(),
        method: 'mock'
      };
    }
    
    throw error;
  }
};

export const parseDuration = (duration) => {
  // Parse ISO 8601 duration (PT10M30S) to seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};