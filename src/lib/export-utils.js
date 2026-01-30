// Export utilities for transcripts and analyses
export const exportFormats = {
  CSV: 'csv',
  JSON: 'json',
  TXT: 'txt',
  MD: 'md'
};

export const exportTranscripts = (transcripts, format = exportFormats.CSV, options = {}) => {
  switch (format) {
    case exportFormats.CSV:
      return exportToCSV(transcripts, options);
    case exportFormats.JSON:
      return exportToJSON(transcripts, options);
    case exportFormats.TXT:
      return exportToTXT(transcripts, options);
    case exportFormats.MD:
      return exportToMarkdown(transcripts, options);
    default:
      throw new Error(`Formato de exportación no soportado: ${format}`);
  }
};

export const exportTechniques = (techniques, format = exportFormats.CSV, options = {}) => {
  switch (format) {
    case exportFormats.CSV:
      return exportTechniquesToCSV(techniques, options);
    case exportFormats.JSON:
      return exportTechniquesToJSON(techniques, options);
    case exportFormats.MD:
      return exportTechniquesToMarkdown(techniques, options);
    default:
      throw new Error(`Formato de exportación no soportado: ${format}`);
  }
};

const exportToCSV = (transcripts, options) => {
  const headers = [
    'ID',
    'Título',
    'Estado',
    'Fecha de Creación',
    'Palabras',
    'Idioma',
    'Técnicas Detectadas',
    'Confianza Promedio',
    'Resumen Ejecutivo'
  ];

  const rows = transcripts.map(transcript => {
    const techniques = transcript.ai_analysis?.techniques || [];
    const avgConfidence = techniques.length > 0 
      ? techniques.reduce((sum, t) => sum + (t.confidence || 0), 0) / techniques.length
      : 0;

    return [
      transcript.id,
      `"${(transcript.title || '').replace(/"/g, '""')}"`,
      transcript.status || 'unknown',
      new Date(transcript.created_at).toLocaleDateString(),
      transcript.transcript_text ? countWords(transcript.transcript_text) : 0,
      transcript.language || 'unknown',
      techniques.length,
      Math.round(avgConfidence * 100) / 100,
      `"${(transcript.ai_analysis?.summary?.overview || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return {
    content: csvContent,
    filename: `transcripts_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  };
};

const exportToJSON = (transcripts, options) => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTranscripts: transcripts.length,
    transcripts: transcripts.map(transcript => ({
      id: transcript.id,
      title: transcript.title,
      status: transcript.status,
      createdAt: transcript.created_at,
      language: transcript.language,
      stats: {
        wordCount: transcript.transcript_text ? countWords(transcript.transcript_text) : 0,
        techniquesCount: transcript.ai_analysis?.techniques?.length || 0,
        avgConfidence: calculateAvgConfidence(transcript.ai_analysis?.techniques || [])
      },
      ...(options.includeFullText && { transcriptText: transcript.transcript_text }),
      ...(options.includeAnalysis && { analysis: transcript.ai_analysis })
    }))
  };

  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `transcripts_${new Date().toISOString().split('T')[0]}.json`,
    mimeType: 'application/json'
  };
};

const exportToTXT = (transcripts, options) => {
  const content = transcripts.map(transcript => {
    const techniques = transcript.ai_analysis?.techniques || [];
    const stats = [
      `Título: ${transcript.title || 'Sin título'}`,
      `Fecha: ${new Date(transcript.created_at).toLocaleDateString()}`,
      `Estado: ${transcript.status || 'unknown'}`,
      `Palabras: ${transcript.transcript_text ? countWords(transcript.transcript_text) : 0}`,
      `Técnicas detectadas: ${techniques.length}`,
      `Confianza promedio: ${Math.round(calculateAvgConfidence(techniques) * 100)}%`
    ].join('\n');

    const summary = transcript.ai_analysis?.summary?.overview || 'Sin análisis disponible';
    
    const techniquesList = techniques.length > 0 
      ? '\n\nTécnicas principales:\n' + techniques.slice(0, 5).map(t => 
          `- ${t.name} (${Math.round(t.confidence * 100)}%): ${t.description}`
        ).join('\n')
      : '';

    return `${'='.repeat(80)}\n${stats}\n\nResumen:\n${summary}${techniquesList}\n`;
  }).join('\n\n');

  return {
    content: content,
    filename: `transcripts_${new Date().toISOString().split('T')[0]}.txt`,
    mimeType: 'text/plain'
  };
};

const exportToMarkdown = (transcripts, options) => {
  const content = [
    `# Análisis de Transcripts`,
    ``,
    `**Fecha de exportación:** ${new Date().toLocaleDateString()}`,
    `**Total de transcripts:** ${transcripts.length}`,
    ``,
    ...transcripts.map(transcript => {
      const techniques = transcript.ai_analysis?.techniques || [];
      
      return [
        `## ${transcript.title || 'Sin título'}`,
        ``,
        `- **ID:** ${transcript.id}`,
        `- **Fecha:** ${new Date(transcript.created_at).toLocaleDateString()}`,
        `- **Estado:** ${transcript.status || 'unknown'}`,
        `- **Palabras:** ${transcript.transcript_text ? countWords(transcript.transcript_text) : 0}`,
        `- **Técnicas detectadas:** ${techniques.length}`,
        `- **Confianza promedio:** ${Math.round(calculateAvgConfidence(techniques) * 100)}%`,
        ``,
        `### Resumen Ejecutivo`,
        ``,
        transcript.ai_analysis?.summary?.overview || 'Sin análisis disponible',
        ``,
        ...(techniques.length > 0 ? [
          `### Técnicas Principales`,
          ``,
          ...techniques.slice(0, 10).map(t => 
            `**${t.name}** (${Math.round(t.confidence * 100)}%)  \n${t.description}`
          ),
          ``
        ] : [])
      ].join('\n');
    })
  ].join('\n');

  return {
    content: content,
    filename: `transcripts_${new Date().toISOString().split('T')[0]}.md`,
    mimeType: 'text/markdown'
  };
};

const exportTechniquesToCSV = (techniques, options) => {
  const headers = [
    'Nombre',
    'Categoría',
    'Subcategoría',
    'Descripción',
    'Objetivo',
    'Etapa del Funnel',
    'Confianza',
    'Impacto',
    'Evidencia',
    'Transcript',
    'Fecha'
  ];

  const rows = techniques.map(technique => [
    `"${(technique.name || '').replace(/"/g, '""')}"`,
    technique.category || '',
    technique.subcategory || '',
    `"${(technique.description || '').replace(/"/g, '""')}"`,
    `"${(technique.objective || '').replace(/"/g, '""')}"`,
    technique.funnelStage || '',
    technique.confidence || 0,
    technique.impact || '',
    `"${(technique.evidence || []).map(e => e.text).join('; ').replace(/"/g, '""')}"`,
    `"${(technique.transcriptTitle || '').replace(/"/g, '""')}"`,
    technique.transcriptDate ? new Date(technique.transcriptDate).toLocaleDateString() : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return {
    content: csvContent,
    filename: `techniques_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv'
  };
};

const exportTechniquesToJSON = (techniques, options) => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTechniques: techniques.length,
    techniques: techniques
  };

  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `techniques_${new Date().toISOString().split('T')[0]}.json`,
    mimeType: 'application/json'
  };
};

const exportTechniquesToMarkdown = (techniques, options) => {
  const groupedByCategory = techniques.reduce((acc, technique) => {
    const category = technique.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(technique);
    return acc;
  }, {});

  const content = [
    `# Técnicas de Marketing Detectadas`,
    ``,
    `**Fecha de exportación:** ${new Date().toLocaleDateString()}`,
    `**Total de técnicas:** ${techniques.length}`,
    ``,
    ...Object.entries(groupedByCategory).map(([category, categoryTechniques]) => [
      `## ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      ``,
      ...categoryTechniques.map(technique => [
        `### ${technique.name}`,
        ``,
        `- **Confianza:** ${Math.round((technique.confidence || 0) * 100)}%`,
        `- **Impacto:** ${technique.impact || 'N/A'}`,
        `- **Etapa del funnel:** ${technique.funnelStage || 'N/A'}`,
        `- **Transcript:** ${technique.transcriptTitle || 'N/A'}`,
        ``,
        `**Descripción:** ${technique.description || 'N/A'}`,
        ``,
        `**Objetivo:** ${technique.objective || 'N/A'}`,
        ``,
        ...(technique.evidence && technique.evidence.length > 0 ? [
          `**Evidencia:**`,
          ...technique.evidence.map(e => `> ${e.text}`),
          ``
        ] : [])
      ].join('\n')),
      ``
    ].join('\n'))
  ].join('\n');

  return {
    content: content,
    filename: `techniques_${new Date().toISOString().split('T')[0]}.md`,
    mimeType: 'text/markdown'
  };
};

export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const calculateAvgConfidence = (techniques) => {
  if (!techniques || techniques.length === 0) return 0;
  const total = techniques.reduce((sum, t) => sum + (t.confidence || 0), 0);
  return total / techniques.length;
};