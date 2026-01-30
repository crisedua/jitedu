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
  
  // Create a safe response with defaults
  const safeResponse = {
    summary: response.summary || {
      overview: 'Análisis completado',
      keyFindings: [],
      recommendations: []
    },
    techniques: Array.isArray(response.techniques) ? response.techniques : [],
    frameworksDetected: response.frameworksDetected || [],
    emotionalJourney: response.emotionalJourney || null,
    languageAnalysis: response.languageAnalysis || null,
    suggestedTitle: response.suggestedTitle || null
  };
  
  // Ensure summary has required fields
  if (!safeResponse.summary.overview) {
    safeResponse.summary.overview = 'Análisis completado';
  }
  
  // If no techniques, create a default one
  if (safeResponse.techniques.length === 0) {
    safeResponse.techniques = [{
      name: 'Análisis General',
      category: 'engagement',
      description: 'Se detectó contenido de marketing general',
      objective: 'Comunicar mensaje',
      funnelStage: 'awareness',
      evidence: [],
      confidence: 0.5
    }];
  }
  
  // Validate and sanitize each technique with error recovery
  safeResponse.techniques = safeResponse.techniques.map((technique, index) => {
    try {
      return validateAndSanitizeTechnique(technique, index);
    } catch (error) {
      console.warn(`Técnica ${index + 1} inválida, usando valores por defecto:`, error);
      return {
        id: `technique_${Date.now()}_${index}`,
        name: technique.name || `Técnica ${index + 1}`,
        category: 'engagement',
        description: technique.description || 'Técnica de marketing detectada',
        objective: technique.objective || 'Mejorar engagement',
        funnelStage: 'awareness',
        evidence: [],
        confidence: 0.5
      };
    }
  });
  
  return {
    isValid: true,
    sanitizedResponse: sanitizeAIResponse(safeResponse)
  };
};

const validateAndSanitizeTechnique = (technique, index) => {
  const validCategories = ['conversion', 'credibility', 'engagement', 'awareness', 'psychology', 'copywriting'];
  const validFunnelStages = ['awareness', 'consideration', 'conversion', 'retention'];
  
  return {
    id: technique.id || `technique_${Date.now()}_${index}`,
    name: sanitizeText(technique.name || `Técnica ${index + 1}`).substring(0, 200),
    category: validCategories.includes(technique.category) ? technique.category : 'engagement',
    subcategory: technique.subcategory ? sanitizeText(technique.subcategory).substring(0, 100) : null,
    description: sanitizeText(technique.description || 'Técnica de marketing detectada').substring(0, 1000),
    whyItWorks: technique.whyItWorks ? sanitizeText(technique.whyItWorks).substring(0, 1000) : null,
    objective: sanitizeText(technique.objective || 'Mejorar efectividad').substring(0, 200),
    funnelStage: validFunnelStages.includes(technique.funnelStage) ? technique.funnelStage : 'awareness',
    evidence: Array.isArray(technique.evidence) 
      ? technique.evidence.slice(0, 5).map(sanitizeEvidence)
      : [],
    confidence: Math.max(0.1, Math.min(1.0, technique.confidence || 0.7)),
    impact: technique.impact || 'medio'
  };
};

const validateTechnique = (technique, index) => {
  // This function is kept for backward compatibility but made more lenient
  if (!technique.name) {
    console.warn(`Técnica ${index + 1}: nombre faltante`);
  }
  
  if (!technique.category) {
    console.warn(`Técnica ${index + 1}: categoría faltante`);
  }
  
  if (typeof technique.confidence === 'number' && 
      (technique.confidence < 0 || technique.confidence > 1)) {
    console.warn(`Técnica ${index + 1}: puntuación de confianza fuera de rango`);
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
    console.warn('JSON malformado, intentando reparar...');
    
    try {
      // Try to fix common JSON issues
      let fixed = jsonString
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\t/g, '\\t') // Escape tabs
        .replace(/\r/g, '\\r'); // Escape carriage returns
      
      return JSON.parse(fixed);
    } catch (secondError) {
      console.warn('No se pudo reparar JSON, creando respuesta por defecto');
      
      // Return a default valid response structure
      return {
        summary: {
          overview: 'Error al procesar la respuesta de la IA. Se generó un análisis básico.',
          keyFindings: ['Se detectó contenido de marketing'],
          recommendations: ['Revisar el contenido manualmente']
        },
        techniques: [{
          name: 'Análisis General',
          category: 'engagement',
          description: 'Se detectó contenido de marketing general',
          objective: 'Comunicar mensaje',
          funnelStage: 'awareness',
          evidence: [],
          confidence: 0.5
        }]
      };
    }
  }
};