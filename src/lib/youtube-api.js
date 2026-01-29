// YouTube Data API v3 implementation
// Note: This API doesn't provide transcript content directly,
// only metadata about available captions

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const getVideoMetadata = async (videoId) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`
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
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      tags: video.snippet.tags || []
    };
    
  } catch (error) {
    console.error('Failed to get video metadata:', error);
    throw error;
  }
};

export const getCaptionsList = async (videoId) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/captions?videoId=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map(caption => ({
      id: caption.id,
      language: caption.snippet.language,
      name: caption.snippet.name,
      trackKind: caption.snippet.trackKind,
      isAutoSynced: caption.snippet.isAutoSynced
    }));
    
  } catch (error) {
    console.error('Failed to get captions list:', error);
    return [];
  }
};

// Note: YouTube Data API v3 doesn't allow downloading caption content
// You need to use youtube-transcript or similar libraries for actual transcript text