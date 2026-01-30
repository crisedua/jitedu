// Transcript validation and cleaning utilities
export class TranscriptValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'TranscriptValidationError';
    this.code = code;
  }
}

export const validateTranscript = (text) => {
  if (!text || typeof text !== 'string') {
    throw new TranscriptValidationError('El transcript es requerido', 'MISSING_TEXT');
  }
  
  const cleanText = text.trim();
  
  if (cleanText.length === 0) {
    throw new TranscriptValidationError('El transcript no puede estar vacío', 'EMPTY_TEXT');
  }
  
  const wordCount = countWords(cleanText);
  
  if (wordCount < 20) {
    throw new TranscriptValidationError(
      `El transcript debe tener al menos 20 palabras (actual: ${wordCount})`,
      'TOO_SHORT'
    );
  }
  
  if (wordCount > 50000) {
    throw new TranscriptValidationError(
      `El transcript es demasiado largo (máximo: 50,000 palabras, actual: ${wordCount})`,
      'TOO_LONG'
    );
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{50,}/g, // Repeated characters
    /^[^a-zA-Z0-9\s]{100,}/g, // Too many special characters
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(cleanText)) {
      throw new TranscriptValidationError(
        'El transcript contiene patrones sospechosos. Verifica el formato',
        'SUSPICIOUS_CONTENT'
      );
    }
  }
  
  return {
    isValid: true,
    wordCount,
    cleanText: cleanTranscript(cleanText)
  };
};

export const cleanTranscript = (text) => {
  return text
    // Remove common transcript artifacts
    .replace(/\[MUSIC\]/gi, '')
    .replace(/\[APPLAUSE\]/gi, '')
    .replace(/\[LAUGHTER\]/gi, '')
    .replace(/\[INAUDIBLE\]/gi, '')
    .replace(/\[CROSSTALK\]/gi, '')
    
    // Remove timestamp patterns
    .replace(/\d{1,2}:\d{2}:\d{2}/g, '') // HH:MM:SS
    .replace(/\d{1,2}:\d{2}/g, '') // MM:SS
    .replace(/\[\d+:\d+\]/g, '') // [MM:SS]
    
    // Remove speaker labels
    .replace(/^[A-Z\s]+:/gm, '') // SPEAKER NAME:
    .replace(/^Speaker \d+:/gm, '') // Speaker 1:
    
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

export const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const detectLanguage = (text) => {
  const sample = text.substring(0, 1000).toLowerCase();
  
  // Simple language detection based on common words
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al'];
  const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
  
  const spanishCount = spanishWords.filter(word => sample.includes(` ${word} `)).length;
  const englishCount = englishWords.filter(word => sample.includes(` ${word} `)).length;
  
  if (spanishCount > englishCount) {
    return 'es';
  } else if (englishCount > spanishCount) {
    return 'en';
  }
  
  return 'unknown';
};

export const estimateReadingTime = (text) => {
  const wordCount = countWords(text);
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
};

export const getTranscriptStats = (text) => {
  const cleanText = cleanTranscript(text);
  const wordCount = countWords(cleanText);
  const charCount = cleanText.length;
  const language = detectLanguage(cleanText);
  const readingTime = estimateReadingTime(cleanText);
  
  return {
    wordCount,
    charCount,
    language,
    readingTime,
    estimatedTokens: Math.ceil(wordCount * 1.3) // Rough token estimation
  };
};