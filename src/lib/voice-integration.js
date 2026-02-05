// ElevenLabs Voice Integration for Experts
// This module handles voice synthesis for each expert using their assigned voice_id

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY || process.env.ACT_APP_ELEVENLABS_API_KEY;

export const speakWithExpertVoice = async (text, expert) => {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  if (!expert.voice_id) {
    console.warn(`No voice_id configured for expert: ${expert.name}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${expert.voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};

export const playAudioResponse = (audioUrl) => {
  if (!audioUrl) return;

  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });

  return audio;
};

// Recommended ElevenLabs voices for each expert type
export const RECOMMENDED_VOICES = {
  'digital-marketing': {
    name: 'Josh',
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    description: 'Young, energetic, professional'
  },
  'productivity': {
    name: 'Rachel',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    description: 'Calm, clear, encouraging'
  },
  'sales': {
    name: 'Adam',
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    description: 'Confident, persuasive, dynamic'
  },
  'leadership': {
    name: 'Bella',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    description: 'Professional, warm, authoritative'
  },
  'entrepreneurship': {
    name: 'Antoni',
    voice_id: 'ErXwobaYiN019PkySvjV',
    description: 'Energetic, inspiring, direct'
  }
};

export const getRecommendedVoice = (expertSlug) => {
  return RECOMMENDED_VOICES[expertSlug] || RECOMMENDED_VOICES['digital-marketing'];
};

// Initialize ElevenLabs Conversational AI Widget
export const initializeElevenLabsWidget = (expert) => {
  if (!expert.voice_id) {
    console.warn('No voice_id for expert, skipping widget initialization');
    return;
  }

  // Check if widget script is already loaded
  if (document.getElementById('elevenlabs-widget-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'elevenlabs-widget-script';
  script.src = 'https://elevenlabs.io/convai-widget/index.js';
  script.async = true;
  
  script.onload = () => {
    console.log('ElevenLabs widget loaded for expert:', expert.name);
  };

  document.body.appendChild(script);
};

// Configure widget with expert's voice and personality
export const configureWidgetForExpert = (expert) => {
  // Build enhanced system prompt that restricts responses to expert's domain
  const enhancedPrompt = `${expert.system_prompt}

CRITICAL INSTRUCTIONS:
- You MUST stay in character as ${expert.name} at all times
- Your specialty is ONLY: ${expert.specialty}
- If asked about topics outside ${expert.specialty}, politely redirect: "That's outside my area of expertise in ${expert.specialty}. Let me help you with [related topic in your domain] instead."
- Always provide specific, actionable advice related to ${expert.specialty}
- Reference your experience and knowledge in ${expert.specialty}
- Never break character or discuss topics unrelated to ${expert.specialty}

Remember: You are ${expert.name}, ${expert.title}, specializing exclusively in ${expert.specialty}.`;

  const widgetConfig = {
    agentId: expert.voice_id || 'default',
    overrides: {
      agent: {
        firstMessage: `Hola, soy ${expert.name}, ${expert.title}. Mi especialidad es ${expert.specialty}. ¿En qué puedo ayudarte hoy?`,
        prompt: enhancedPrompt
      }
    }
  };

  // Apply configuration to widget if it exists
  const widget = document.querySelector('elevenlabs-convai');
  if (widget) {
    // Update widget attributes
    if (expert.voice_id) {
      widget.setAttribute('agent-id', expert.voice_id);
    }
    
    // Store expert context in widget data attribute for reference
    widget.setAttribute('data-expert-slug', expert.slug);
    widget.setAttribute('data-expert-name', expert.name);
    
    console.log(`Widget configured for ${expert.name} (${expert.specialty})`);
  }

  // Apply configuration via API if available
  if (window.ElevenLabsConvAI) {
    window.ElevenLabsConvAI.configure(widgetConfig);
  }

  return widgetConfig;
};

const voiceIntegration = {
  speakWithExpertVoice,
  playAudioResponse,
  getRecommendedVoice,
  initializeElevenLabsWidget,
  configureWidgetForExpert
};

export default voiceIntegration;
