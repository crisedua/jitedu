// Backend service example (Node.js/Express)
// This would be your server-side implementation

const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');

const app = express();
app.use(express.json());

// Primary transcript extraction endpoint
app.post('/api/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const { language = 'es', fallbackLanguages = ['en', 'auto'] } = req.body;
  
  try {
    // Method 1: Try youtube-transcript library
    const transcript = await extractWithYoutubeTranscript(videoId, language, fallbackLanguages);
    
    res.json({
      success: true,
      transcript: transcript.transcript,
      language: transcript.language,
      method: 'youtube-transcript',
      extractedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('All transcript extraction methods failed:', error);
    
    res.status(404).json({
      success: false,
      error: 'No transcript available for this video',
      details: error.message
    });
  }
});

async function extractWithYoutubeTranscript(videoId, primaryLang, fallbackLangs) {
  // Try primary language first
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: primaryLang,
      country: primaryLang === 'es' ? 'ES' : 'US'
    });
    
    return {
      transcript: formatTranscript(transcript),
      language: primaryLang
    };
  } catch (error) {
    console.log(`Primary language ${primaryLang} failed, trying fallbacks...`);
  }
  
  // Try fallback languages
  for (const lang of fallbackLangs) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: lang
      });
      
      return {
        transcript: formatTranscript(transcript),
        language: lang
      };
    } catch (error) {
      console.log(`Fallback language ${lang} failed`);
      continue;
    }
  }
  
  throw new Error('No transcript available in any supported language');
}

function formatTranscript(rawTranscript) {
  return rawTranscript.map(item => ({
    text: item.text.replace(/\n/g, ' ').trim(),
    start: Math.round(item.offset / 1000 * 100) / 100, // Convert to seconds, 2 decimal places
    duration: Math.round(item.duration / 1000 * 100) / 100
  }));
}

// Batch processing endpoint
app.post('/api/transcript/batch', async (req, res) => {
  const { videoIds, language = 'es' } = req.body;
  
  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'videoIds must be a non-empty array'
    });
  }
  
  if (videoIds.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 50 videos per batch'
    });
  }
  
  const results = [];
  
  for (const videoId of videoIds) {
    try {
      const transcript = await extractWithYoutubeTranscript(videoId, language, ['en', 'auto']);
      
      results.push({
        videoId,
        success: true,
        transcript: transcript.transcript,
        language: transcript.language
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({
        videoId,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    results,
    processedAt: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'transcript-extractor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Transcript service running on port ${PORT}`);
});

module.exports = app;