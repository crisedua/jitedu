// Advanced search and filtering utilities
export const searchTranscripts = (transcripts, query, filters = {}) => {
  if (!query && Object.keys(filters).length === 0) {
    return transcripts;
  }

  let results = [...transcripts];

  // Text search
  if (query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    results = results.filter(transcript => {
      const searchableText = [
        transcript.title || '',
        transcript.transcript_text || '',
        transcript.ai_analysis?.summary?.overview || '',
        ...(transcript.ai_analysis?.techniques || []).map(t => `${t.name} ${t.description}`),
        ...(transcript.ai_analysis?.summary?.keyFindings || [])
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Apply filters
  if (filters.status) {
    results = results.filter(t => t.status === filters.status);
  }

  if (filters.language) {
    results = results.filter(t => t.language === filters.language);
  }

  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    results = results.filter(t => {
      const date = new Date(t.created_at);
      return date >= start && date <= end;
    });
  }

  if (filters.minWordCount) {
    results = results.filter(t => {
      const wordCount = t.transcript_text ? countWords(t.transcript_text) : 0;
      return wordCount >= filters.minWordCount;
    });
  }

  if (filters.hasAnalysis !== undefined) {
    results = results.filter(t => !!t.ai_analysis === filters.hasAnalysis);
  }

  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(t => {
      if (!t.ai_analysis?.techniques) return false;
      const techniqueCategories = t.ai_analysis.techniques.map(tech => tech.category);
      return filters.categories.some(cat => techniqueCategories.includes(cat));
    });
  }

  return results;
};

export const searchTechniques = (transcripts, query, filters = {}) => {
  const allTechniques = [];
  
  transcripts.forEach(transcript => {
    if (transcript.ai_analysis?.techniques) {
      transcript.ai_analysis.techniques.forEach(technique => {
        allTechniques.push({
          ...technique,
          transcriptId: transcript.id,
          transcriptTitle: transcript.title,
          transcriptDate: transcript.created_at
        });
      });
    }
  });

  let results = [...allTechniques];

  // Text search
  if (query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    results = results.filter(technique => {
      const searchableText = [
        technique.name || '',
        technique.description || '',
        technique.objective || '',
        technique.subcategory || '',
        ...(technique.evidence || []).map(e => e.text || '')
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Apply filters
  if (filters.category) {
    results = results.filter(t => t.category === filters.category);
  }

  if (filters.funnelStage) {
    results = results.filter(t => t.funnelStage === filters.funnelStage);
  }

  if (filters.minConfidence) {
    results = results.filter(t => t.confidence >= filters.minConfidence);
  }

  if (filters.impact) {
    results = results.filter(t => t.impact === filters.impact);
  }

  return results;
};

export const getSearchSuggestions = (transcripts, currentQuery = '') => {
  const suggestions = new Set();
  
  // Add common search terms
  const commonTerms = [
    'urgencia', 'escasez', 'social proof', 'testimonios', 'hooks',
    'storytelling', 'objeciones', 'autoridad', 'credibilidad',
    'conversión', 'engagement', 'awareness', 'psicología'
  ];
  
  commonTerms.forEach(term => {
    if (term.toLowerCase().includes(currentQuery.toLowerCase())) {
      suggestions.add(term);
    }
  });

  // Add technique names from existing analyses
  transcripts.forEach(transcript => {
    if (transcript.ai_analysis?.techniques) {
      transcript.ai_analysis.techniques.forEach(technique => {
        if (technique.name.toLowerCase().includes(currentQuery.toLowerCase())) {
          suggestions.add(technique.name);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 8);
};

export const highlightSearchTerms = (text, query) => {
  if (!query || !text) return text;
  
  const terms = query.split(' ').filter(term => term.length > 0);
  let highlightedText = text;
  
  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
};

export const getAdvancedFilters = (transcripts) => {
  const filters = {
    categories: new Set(),
    funnelStages: new Set(),
    languages: new Set(),
    dateRange: { min: null, max: null }
  };

  transcripts.forEach(transcript => {
    // Extract categories and funnel stages from techniques
    if (transcript.ai_analysis?.techniques) {
      transcript.ai_analysis.techniques.forEach(technique => {
        if (technique.category) filters.categories.add(technique.category);
        if (technique.funnelStage) filters.funnelStages.add(technique.funnelStage);
      });
    }

    // Extract languages
    if (transcript.language) {
      filters.languages.add(transcript.language);
    }

    // Track date range
    const date = new Date(transcript.created_at);
    if (!filters.dateRange.min || date < filters.dateRange.min) {
      filters.dateRange.min = date;
    }
    if (!filters.dateRange.max || date > filters.dateRange.max) {
      filters.dateRange.max = date;
    }
  });

  return {
    categories: Array.from(filters.categories),
    funnelStages: Array.from(filters.funnelStages),
    languages: Array.from(filters.languages),
    dateRange: filters.dateRange
  };
};

const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};