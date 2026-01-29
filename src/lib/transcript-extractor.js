// Real transcript extraction using youtube-transcript library
// This would run on your backend/server, not in the browser

// Backend implementation (Node.js)
/*
npm install youtube-transcript

const { YoutubeTranscript } = require('youtube-transcript');

export const extractTranscriptServer = async (videoId) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'es', // Language preference
      country: 'ES' // Country preference
    });
    
    return {
      transcript: transcript.map(item => ({
        text: item.text,
        start: item.offset / 1000, // Convert to seconds
        duration: item.duration / 1000 // Convert to seconds
      })),
      language: 'es',
      success: true
    };
  } catch (error) {
    console.error('Transcript extraction failed:', error);
    
    // Try different languages if primary fails
    const fallbackLanguages = ['en', 'auto'];
    
    for (const lang of fallbackLanguages) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: lang
        });
        
        return {
          transcript: transcript.map(item => ({
            text: item.text,
            start: item.offset / 1000,
            duration: item.duration / 1000
          })),
          language: lang,
          success: true
        };
      } catch (fallbackError) {
        continue;
      }
    }
    
    throw new Error('No transcript available in any supported language');
  }
};
*/

// Frontend API call to your backend
export const getVideoTranscript = async (videoId, preferredLanguage = 'es') => {
  try {
    const response = await fetch(`/api/transcript/${videoId}`, {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to extract transcript');
    }
    
    return {
      transcript: data.transcript,
      language: data.language,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Transcript extraction failed:', error);
    throw new Error(`No transcript available: ${error.message}`);
  }
};

// Alternative: Browser-based extraction (limited and unreliable)
export const getTranscriptBrowser = async (videoId) => {
  // WARNING: This method is unreliable and may break
  // YouTube frequently changes their internal APIs
  
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Look for transcript data in the page HTML
    const transcriptMatch = html.match(/"captions":\s*({.+?}),/);
    
    if (!transcriptMatch) {
      throw new Error('No captions found in video page');
    }
    
    const captionsData = JSON.parse(transcriptMatch[1]);
    const captionTracks = captionsData.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No caption tracks available');
    }
    
    // Get the first available caption track
    const captionTrack = captionTracks[0];
    const captionUrl = captionTrack.baseUrl;
    
    // Fetch the actual transcript
    const transcriptResponse = await fetch(captionUrl);
    const transcriptXml = await transcriptResponse.text();
    
    // Parse XML transcript
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(transcriptXml, 'text/xml');
    const textElements = xmlDoc.getElementsByTagName('text');
    
    const transcript = Array.from(textElements).map(element => ({
      text: element.textContent.replace(/\n/g, ' ').trim(),
      start: parseFloat(element.getAttribute('start') || 0),
      duration: parseFloat(element.getAttribute('dur') || 0)
    }));
    
    return {
      transcript,
      language: captionTrack.languageCode,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Browser transcript extraction failed:', error);
    throw new Error('Failed to extract transcript from browser');
  }
};