// OpenAI API Integration (formerly OpenRouter)
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-4o';

// Debug logging
console.log('OpenAI Config Loaded:', {
  hasKey: !!OPENAI_API_KEY,
  model: AI_MODEL,
  envType: process.env.NODE_ENV
});

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const analyzeTranscriptWithAI = async (transcript, videoMetadata) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    throw new Error('La clave API de OpenAI es necesaria para el análisis de IA');
  }

  const fullText = Array.isArray(transcript)
    ? transcript.map(segment => segment.text).join(' ')
    : transcript;

  const systemPrompt = `Eres un experto analista de marketing digital, copywriting, psicología de persuasión y estrategia de contenido con más de 20 años de experiencia.

Tu tarea es realizar un ANÁLISIS EXHAUSTIVO Y PROFUNDO del transcript proporcionado. NO te limites a lo superficial - busca TODAS las técnicas, estrategias y patrones presentes.

## CATEGORÍAS DE ANÁLISIS (analiza TODAS):

### 1. TÉCNICAS DE PERSUASIÓN Y CONVERSIÓN
- Urgencia y escasez (deadlines, ofertas limitadas, "solo quedan X")
- CTAs (llamadas a la acción - directas, indirectas, múltiples)
- Manejo y anticipación de objeciones
- Garantías, reversión de riesgo, pruebas gratuitas
- Anclaje de precios y comparaciones
- Cierre de ventas (técnicas específicas usadas)
- FOMO (Fear of Missing Out)
- Exclusividad y acceso limitado

### 2. CREDIBILIDAD Y AUTORIDAD
- Social proof (testimonios, casos de éxito, números, estadísticas)
- Autoridad (credenciales, experiencia, logros, menciones de marcas)
- Transparencia y vulnerabilidad estratégica
- Datos, estudios y evidencia científica
- Name dropping y asociaciones
- Años de experiencia, clientes atendidos, resultados

### 3. ENGAGEMENT Y RETENCIÓN DE ATENCIÓN
- Hooks iniciales (primeros 5-30 segundos)
- Storytelling (narrativas personales, casos, metáforas)
- Pattern interrupts (cambios de ritmo, sorpresas)
- Preguntas retóricas y directas
- Loops abiertos y curiosidad
- Cliffhangers y promesas futuras
- Humor, emoción, controversia
- Estructura del contenido (cómo mantiene enganchado)

### 4. AWARENESS Y POSICIONAMIENTO
- Propuesta de valor única (USP)
- Diferenciación competitiva
- Posicionamiento de marca/persona
- Educación del mercado
- Reframing de problemas
- Creación de nueva categoría

### 5. PSICOLOGÍA Y PERSUASIÓN AVANZADA
- Principio de reciprocidad
- Compromiso y consistencia
- Prueba social
- Autoridad
- Agrado/Liking
- Escasez
- Unidad (pertenencia a grupo)
- Contraste
- Razón (uso de "porque")
- Dolor vs Placer (qué enfatiza más)

### 6. ESTRUCTURA Y FRAMEWORKS
- Framework de presentación usado (AIDA, PAS, BAB, etc.)
- Estructura del argumento
- Progresión lógica
- Puntos de inflexión emocional
- Momentos de mayor impacto

### 7. LENGUAJE Y COPYWRITING  
- Palabras de poder usadas
- Lenguaje sensorial
- Lenguaje específico vs vago
- Uso de números y especificidad
- Tono y voz (formal, casual, urgente, etc.)
- Uso de "tú/usted" vs "nosotros"
- Preguntas vs afirmaciones

## INSTRUCCIONES CRÍTICAS:
1. Analiza el transcript LÍNEA POR LÍNEA si es necesario
2. Identifica MÍNIMO 15-25 técnicas diferentes
3. Incluye técnicas SUTILES que otros pasarían por alto
4. Proporciona CITAS EXACTAS como evidencia
5. Explica POR QUÉ cada técnica es efectiva
6. Identifica patrones y combinaciones de técnicas
7. Evalúa la sofisticación general del contenido

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional.`;

  const userPrompt = `Realiza un ANÁLISIS EXHAUSTIVO de este transcript. Quiero el análisis MÁS COMPLETO Y DETALLADO posible.

**TRANSCRIPT A ANALIZAR:**
${fullText}

**FORMATO DE RESPUESTA (JSON):**
{
  "summary": {
    "overview": "Resumen ejecutivo detallado del contenido, enfoque principal, y estrategia general de marketing/persuasión detectada (4-6 oraciones)",
    "targetAudience": "Descripción del público objetivo inferido del contenido",
    "mainObjective": "Objetivo principal del contenido (vender, educar, generar leads, etc.)",
    "sophisticationLevel": "Nivel de sofisticación del marketing: básico/intermedio/avanzado/experto",
    "overallEffectiveness": "Evaluación de la efectividad general del contenido (1-10) con justificación",
    "keyFindings": [
      "Hallazgo clave 1 - con explicación detallada de por qué es importante",
      "Hallazgo clave 2 - con explicación detallada",
      "Hallazgo clave 3 - con explicación detallada",
      "Hallazgo clave 4 - con explicación detallada",
      "Hallazgo clave 5 - con explicación detallada"
    ],
    "strengthsAndWeaknesses": {
      "strengths": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
      "weaknesses": ["Debilidad o área de mejora 1", "Debilidad 2"]
    },
    "recommendations": [
      "Recomendación accionable 1 - específica y aplicable",
      "Recomendación accionable 2",
      "Recomendación accionable 3",
      "Recomendación accionable 4"
    ]
  },
  "frameworksDetected": [
    {
      "name": "Nombre del framework (AIDA, PAS, etc.)",
      "description": "Cómo se implementa en el contenido",
      "effectiveness": "alta/media/baja"
    }
  ],
  "emotionalJourney": {
    "openingEmotion": "Emoción que busca generar al inicio",
    "middleEmotion": "Emoción en el desarrollo",
    "closingEmotion": "Emoción al cierre",
    "peakMoments": ["Momento de mayor impacto emocional 1", "Momento 2"]
  },
  "techniques": [
    {
      "name": "Nombre descriptivo y específico de la técnica",
      "category": "conversion|credibility|engagement|awareness|psychology|copywriting",
      "subcategory": "Subcategoría específica (ej: 'urgencia', 'social proof', 'hook')",
      "description": "Explicación DETALLADA de cómo se implementa esta técnica en el contenido",
      "whyItWorks": "Explicación psicológica de por qué esta técnica es efectiva",
      "objective": "Objetivo específico que busca lograr con esta técnica",
      "funnelStage": "awareness|consideration|conversion|retention",
      "evidence": [
        {
          "text": "CITA TEXTUAL EXACTA del transcript (mínimo 10-30 palabras)",
          "context": "Contexto: dónde aparece y cómo se conecta con el resto del contenido"
        }
      ],
      "confidence": 0.95,
      "impact": "alto|medio|bajo"
    }
  ],
  "languageAnalysis": {
    "toneOfVoice": "Descripción del tono usado",
    "powerWords": ["Lista de palabras de poder detectadas"],
    "callToActionPhrases": ["Frases de CTA usadas"],
    "persuasivePatterns": ["Patrones de lenguaje persuasivo encontrados"]
  }
}

## REQUISITOS CRÍTICOS:
- Detecta MÍNIMO 15-25 técnicas diferentes (más es mejor)
- Cada técnica debe tener evidencia textual EXACTA del transcript
- Incluye técnicas obvias Y sutiles
- Las descripciones deben ser DETALLADAS, no genéricas
- Busca combinaciones inteligentes de técnicas
- Si el contenido es corto, aún así busca todas las técnicas presentes
- NO inventes técnicas que no estén evidenciadas en el texto`;

  try {
    console.log(`🤖 Iniciando análisis con ${AI_MODEL}...`);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" } // Force JSON for OpenAI
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta recibida de OpenAI');

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió contenido de la IA');
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw content:', content);
      throw new Error('Error al parsear la respuesta de la IA');
    }

    // Validate and format the response
    const formattedAnalysis = {
      summary: analysis.summary || {
        overview: 'Análisis completado',
        keyFindings: [],
        recommendations: []
      },
      techniques: (analysis.techniques || []).map(technique => ({
        id: `${technique.category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: technique.name,
        category: technique.category,
        description: technique.description,
        objective: technique.objective,
        funnelStage: technique.funnelStage,
        evidence: technique.evidence || [],
        confidence: technique.confidence || 0.8
      })),
      analysisMetadata: {
        processedAt: new Date().toISOString(),
        model: AI_MODEL,
        transcriptLength: fullText.length,
        techniquesFound: analysis.techniques?.length || 0,
        tokensUsed: data.usage?.total_tokens || 0
      }
    };

    console.log(`✨ Análisis completado: ${formattedAnalysis.techniques.length} técnicas detectadas`);

    return formattedAnalysis;

  } catch (error) {
    console.error('❌ AI Analysis Error:', error);

    // Provide helpful error messages
    if (error.message.includes('API key')) {
      throw new Error('La clave API de OpenAI es inválida o no está configurada');
    }

    if (error.message.includes('JSON')) {
      throw new Error('Error al procesar la respuesta de la IA. Por favor, intenta de nuevo.');
    }

    if (error.message.includes('429')) {
      throw new Error('Límite de peticiones alcanzado (Quota exceeded). Por favor, intenta de nuevo más tarde.');
    }

    throw error;
  }
};

// Get available models (Updated for OpenAI)
export const getAvailableModels = () => {
  return [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Más rápido y mejor calidad general',
      recommended: true,
      costPer1M: '$5.00'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Modelo potente y fiable',
      costPer1M: '$10.00'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Opción económica y rápida',
      costPer1M: '$0.50'
    }
  ];
};

// Test API connection
export const testOpenRouterConnection = async () => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo conectar con OpenAI');
    }

    return { success: true, message: 'Conexión exitosa con OpenAI' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Chat with transcript - Q&A functionality
export const chatWithTranscript = async (transcriptText, aiAnalysis, chatHistory, question) => {
  if (!OPENAI_API_KEY) {
    throw new Error('La clave API de OpenAI es necesaria para el chat');
  }

  const systemPrompt = `Eres un asistente experto en análisis de marketing y contenido de video. 
Tienes acceso al transcript completo de un video y su análisis de marketing previo.

Tu rol es responder preguntas del usuario sobre el contenido del transcript, las técnicas de marketing identificadas, 
y proporcionar insights adicionales cuando se te solicite.

TRANSCRIPT DEL VIDEO:
${transcriptText}

ANÁLISIS PREVIO DE MARKETING:
${JSON.stringify(aiAnalysis, null, 2)}

INSTRUCCIONES:
- Responde de manera clara y concisa
- Cita partes específicas del transcript cuando sea relevante
- Usa el análisis previo como referencia pero puedes profundizar más
- Si la pregunta no está relacionada con el contenido, indica amablemente que solo puedes ayudar con preguntas sobre el transcript
- Responde en español`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: question }
  ];

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de API OpenAI: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de la IA');
    }

    return content;

  } catch (error) {
    console.error('❌ Chat Error:', error);

    if (error.message.includes('429')) {
      throw new Error('Límite de peticiones alcanzado. Por favor, espera un momento.');
    }

    throw error;
  }
};

// Chat with ALL transcripts - global knowledge base search
export const chatWithAllTranscripts = async (transcripts, chatHistory, question) => {
  if (!OPENAI_API_KEY) {
    throw new Error('La clave API de OpenAI es necesaria para el chat');
  }

  // Build a knowledge base from all transcripts
  const knowledgeBase = transcripts.map((t, index) => {
    const text = t.transcript_text || '';
    const analysis = t.ai_analysis ? `\nANÁLISIS PREVIO: ${JSON.stringify(t.ai_analysis.summary || t.ai_analysis, null, 2)}` : '';

    // Truncate very long transcripts to manage context window
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) + '...[truncado]' : text;

    return `--- TRANSCRIPT ${index + 1}: "${t.title || 'Sin título'}" ---
${truncatedText}
${analysis}
--- FIN TRANSCRIPT ${index + 1} ---`;
  }).join('\n\n');

  const systemPrompt = `Eres un experto analista de marketing digital, copywriting y persuasión. 

Tienes acceso a una BASE DE CONOCIMIENTO con ${transcripts.length} transcripts de videos de marketing, ventas y negocios.

TU MISIÓN:
1. Cuando el usuario haga una pregunta, busca en TODOS los transcripts la información relevante
2. Proporciona respuestas DETALLADAS y ESPECÍFICAS basadas en el contenido real de los transcripts
3. Cita ejemplos textuales cuando sea posible (usa comillas)
4. Si encuentras patrones o técnicas similares en varios transcripts, mencionalo
5. Si la información no está en los transcripts, dilo honestamente

FORMATO DE RESPUESTA:
- Sé detallado pero organizado
- Usa bullets o numeración cuando sea apropiado
- Incluye citas textuales de los transcripts cuando hay ejemplos relevantes
- Indica de qué transcript viene la información cuando sea posible

BASE DE CONOCIMIENTO (${transcripts.length} transcripts):

${knowledgeBase}

IMPORTANTE:
- Responde en español
- Basa tus respuestas ÚNICAMENTE en el contenido de los transcripts
- Si no encuentras información relevante, dilo claramente`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: question }
  ];

  try {
    console.log(`🔍 Buscando en ${transcripts.length} transcripts...`);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error de API OpenAI: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de la IA');
    }

    console.log('✅ Respuesta generada');
    return content;

  } catch (error) {
    console.error('❌ Global Chat Error:', error);

    if (error.message.includes('429')) {
      throw new Error('Límite de peticiones alcanzado. Por favor, espera un momento.');
    }

    throw error;
  }
};