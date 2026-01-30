// AI response validation and sanitization
export class AIResponseError extends Error {
  constructor(message, code, rawResponse) {
    super(message);
    this.name = 'AIResponseError';
    this.code = code;
    this.rawResponse = rawResponse;
  }
}

export const validateAIResponse = (response) => {
  if (!response) {
    throw new AIResponseError('Respuesta vacía de la IA', 'EMPTY_RESPONSE');
  }
  
  // Validate required structure
  const requiredFields = ['summary', 'techniques'];
  const missingFields = requiredFields.filter(field => !response[field]);
  
  if (missingFields.length > 0) {
    throw new AIResponseError(
      `Campos requeridos faltantes: ${missingFields.join(', ')}`,
      'MISSING_FIELDS',
      response
    );
  }
  
  // Validate summary structure
  if (!response.summary.overview) {
    throw new AIResponseError('Resumen ejecutivo faltante', 'MISSING_SUMMARY');
  }
  
  // Validate techniques array
  if (!Array.isArray(response.techniques)) {
    throw new AIResponseError('Lista de técnicas inválida', 'INVALID_TECHNIQUES');
  }
  
  if (response.techniques.length === 0) {
    throw new AIResponseError('No se detectaron técnicas', 'NO_TECHNIQUES');
  }
  
  // Validate each technique
  response.techniques.forEach((technique, index) => {
    validateTechnique(technique, index);
  });
  
  return {
    isValid: true,
    sanitizedResponse: sanitizeAIResponse(response)
  };
};

const validateTechnique = (technique, index) => {
  const requiredFields = ['name', 'category', 'description', 'confidence'];
  const missingFields = requiredFields.filter(field => !technique[field]);
  
  if (missingFields.length > 0) {
    throw new AIResponseError(
      `Técnica ${index + 1}: campos faltantes - ${missingFields.join(', ')}`,
      'INVALID_TECHNIQUE'
    );
  }
  
  // Validate confidence score
  if (typeof technique.confidence !== 'number' || 
      technique.confidence < 0 || 
      technique.confidence > 1) {
    throw new AIResponseError(
      `Técnica ${index + 1}: puntuación de confianza inválida`,
      'INVALID_CONFIDENCE'
    );
  }
  
  // Validate category
  const validCategories = ['conversion', 'credibility', 'engagement', 'awareness', 'psychology', 'copywriting'];
  if (!validCategories.includes(technique.category)) {
    throw new AIResponseError(
      `Técnica ${index + 1}: categoría inválida - ${technique.category}`,
      'INVALID_CATEGORY'
    );
  }
};

export const sanitizeAIResponse = (response) => {
  return {
    summary: {
      overview: sanitizeText(response.summary.overview),
      keyFindings: Array.isArray(response.summary.keyFindings) 
        ? response.summary.keyFindings.map(sanitizeText).slice(0, 10)
        : [],
      recommendations: Array.isArray(response.summary.recommendations)
        ? response.summary.recommendations.map(sanitizeText).slice(0, 10)
        : [],
      targetAudience: response.summary.targetAudience ? sanitizeText(response.summary.targetAudience) : null,
      mainObjective: response.summary.mainObjective ? sanitizeText(response.summary.mainObjective) : null,
      sophisticationLevel: response.summary.sophisticationLevel || 'intermedio',
      overallEffectiveness: Math.max(1, Math.min(10, response.summary.overallEffectiveness || 7))
    },
    techniques: response.techniques.slice(0, 50).map(sanitizeTechnique), // Limit to 50 techniques
    analysisMetadata: {
      processedAt: new Date().toISOString(),
      model: response.analysisMetadata?.model || 'unknown',
      transcriptLength: response.analysisMetadata?.transcriptLength || 0,
      techniquesFound: response.techniques.length,
      tokensUsed: response.analysisMetadata?.tokensUsed || 0,
      confidence: calculateOverallConfidence(response.techniques)
    },
    frameworksDetected: Array.isArray(response.frameworksDetected) 
      ? response.frameworksDetected.slice(0, 10).map(sanitizeFramework)
      : [],
    emotionalJourney: response.emotionalJourney ? sanitizeEmotionalJourney(response.emotionalJourney) : null,
    languageAnalysis: response.languageAnalysis ? sanitizeLanguageAnalysis(response.languageAnalysis) : null
  };
};

const sanitizeTechnique = (technique) => {
  return {
    id: technique.id || `technique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: sanitizeText(technique.name).substring(0, 200),
    category: technique.category,
    subcategory: technique.subcategory ? sanitizeText(technique.subcategory).substring(0, 100) : null,
    description: sanitizeText(technique.description).substring(0, 1000),
    whyItWorks: technique.whyItWorks ? sanitizeText(technique.whyItWorks).substring(0, 1000) : null,
    objective: sanitizeText(technique.objective || '').substring(0, 200),
    funnelStage: technique.funnelStage || 'consideration',
    evidence: Array.isArray(technique.evidence) 
      ? technique.evidence.slice(0, 5).map(sanitizeEvidence)
      : [],
    confidence: Math.max(0.1, Math.min(1.0, technique.confidence)),
    impact: technique.impact || 'medio'
  };
};

const sanitizeEvidence = (evidence) => {
  if (typeof evidence === 'string') {
    return {
      text: sanitizeText(evidence).substring(0, 500),
      context: null
    };
  }
  
  return {
    text: sanitizeText(evidence.text || '').substring(0, 500),
    context: evidence.context ? sanitizeText(evidence.context).substring(0, 300) : null,
    timestamp: evidence.timestamp || null
  };
};

const sanitizeFramework = (framework) => {
  return {
    name: sanitizeText(framework.name || '').substring(0, 100),
    description: sanitizeText(framework.description || '').substring(0, 500),
    effectiveness: framework.effectiveness || 'media'
  };
};

const sanitizeEmotionalJourney = (journey) => {
  return {
    openingEmotion: journey.openingEmotion ? sanitizeText(journey.openingEmotion).substring(0, 100) : null,
    middleEmotion: journey.middleEmotion ? sanitizeText(journey.middleEmotion).substring(0, 100) : null,
    closingEmotion: journey.closingEmotion ? sanitizeText(journey.closingEmotion).substring(0, 100) : null,
    peakMoments: Array.isArray(journey.peakMoments) 
      ? journey.peakMoments.slice(0, 5).map(moment => sanitizeText(moment).substring(0, 200))
      : []
  };
};

const sanitizeLanguageAnalysis = (analysis) => {
  return {
    toneOfVoice: analysis.toneOfVoice ? sanitizeText(analysis.toneOfVoice).substring(0, 200) : null,
    powerWords: Array.isArray(analysis.powerWords) 
      ? analysis.powerWords.slice(0, 20).map(word => sanitizeText(word).substring(0, 50))
      : [],
    callToActionPhrases: Array.isArray(analysis.callToActionPhrases)
      ? analysis.callToActionPhrases.slice(0, 10).map(phrase => sanitizeText(phrase).substring(0, 100))
      : [],
    persuasivePatterns: Array.isArray(analysis.persuasivePatterns)
      ? analysis.persuasivePatterns.slice(0, 10).map(pattern => sanitizeText(pattern).substring(0, 200))
      : []
  };
};

const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

const calculateOverallConfidence = (techniques) => {
  if (!techniques || techniques.length === 0) return 0;
  
  const totalConfidence = techniques.reduce((sum, tech) => sum + (tech.confidence || 0), 0);
  return Math.round((totalConfidence / techniques.length) * 100) / 100;
};

export const repairMalformedJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Try to fix common JSON issues
    let fixed = jsonString
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\t/g, '\\t'); // Escape tabs
    
    try {
      return JSON.parse(fixed);
    } catch (secondError) {
      throw new AIResponseError(
        'No se pudo reparar la respuesta JSON malformada',
        'MALFORMED_JSON',
        jsonString
      );
    }
  }
};