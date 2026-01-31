// OpenAI API Integration (formerly OpenRouter)
import { retryWithBackoff, parseAPIError } from './api-retry';
import { validateAIResponse, repairMalformedJSON } from './ai-response-validator';
import { validateTranscript, getTranscriptStats } from './transcript-validator';

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
    throw new Error('La clave API de OpenAI es necesaria para el análisis de IA');
  }

  // Validate and clean transcript
  const validation = validateTranscript(transcript);
  const fullText = Array.isArray(transcript)
    ? transcript.map(segment => segment.text).join(' ')
    : validation.cleanText;

  const stats = getTranscriptStats(fullText);

  console.log(`🤖 Iniciando análisis con ${AI_MODEL}...`, {
    wordCount: stats.wordCount,
    estimatedTokens: stats.estimatedTokens,
    language: stats.language
  });

  const systemPrompt = `Eres un experto analista de comunicación, gestión del conocimiento, psicología de persuasión y estrategia de contenido.

Tu tarea es realizar un ANÁLISIS EXHAUSTIVO Y PROFUNDO del contenido proporcionado. NO te limites a lo superficial - busca TODAS las ideas clave, estrategias de comunicación, modelos mentales y patrones presentes.

## CATEGORÍAS DE ANÁLISIS (analiza TODAS):

### 1. IDEAS CENTRALES Y CONOCIMIENTO
- Conceptos fundamentales explicados
- Modelos mentales y marcos de pensamiento
- Tesis principales y argumentos de soporte
- Datos clave, estadísticas y evidencia presentada
- Lecciones aprendidas y conclusiones

### 2. ESTRATEGIAS DE COMUNICACIÓN Y PERSUASIÓN
- Términos de urgencia y relevancia
- Llamadas a la acción (CTAs) implícitas y explícitas
- Manejo de objeciones o contra-argumentos
- Uso de autoridad y credibilidad
- Estructura retórica y lógica argumentativa

### 3. ENGAGEMENT Y RETENCIÓN
- Ganchos (hooks) y aperturas
- Storytelling (narrativas, metáforas, analogías)
- Elementos de sorpresa o ruptura de patrón
- Preguntas reflexivas y participación
- Estructura didáctica (cómo facilita el aprendizaje)

### 4. POSICIONAMIENTO Y VALOR
- Propuesta de valor única identificada
- Diferenciación de otros enfoques
- Identificación y definición de problemas
- Soluciones propuestas y su "por qué"

### 5. PSICOLOGÍA APLICADA
- Principios de influencia (reciprocidad, compromiso, prueba social, autoridad, agrado, escasez)
- Sesgos cognitivos abordados o utilizados
- Apelaciones emocionales vs racionales
- Dinámicas de grupo o identidad

### 6. ESTRUCTURA Y FORMATO
- Frameworks explicativos utilizados
- Progresión lógica de las ideas
- Puntos de inflexión o "Momentos Aha!"
- Claridad y densidad de información

### 7. LENGUAJE Y TONO
- Terminología específica del dominio
- Tono de voz (autoritario, empático, analítico, inspirador)
- Claridad y accesibilidad del lenguaje
- Uso de ejemplos concretos

## INSTRUCCIONES CRÍTICAS:
1. Analiza el contenido en PROFUNDIDAD
2. Identifica MÍNIMO 15-25 puntos/técnicas diferentes
3. Incluye insights SUTILES que un análisis superficial perdería
4. Proporciona CITAS EXACTAS como evidencia para cada punto
5. Explica POR QUÉ cada elemento es relevante o efectivo
6. Identifica conexiones entre diferentes partes del contenido
7. Evalúa la calidad y utilidad del conocimiento

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional.
IMPORTANTE: Al generar el resumen y los hallazgos, EVITA mencionar nombres propios de personas específicas (a menos que sean figuras públicas globales), marcas pequeñas o casos de estudio por su nombre propio. Generaliza los ejemplos (ej: "una empresa de software" en lugar de "Acme Corp") para centrarte en el patrón o lección.`;

  const userPrompt = `Realiza un ANÁLISIS EXHAUSTIVO de este contenido. Quiero el análisis MÁS COMPLETO Y DETALLADO posible para una Base de Conocimiento.

**CONTENIDO A ANALIZAR:**
${fullText}

**FORMATO DE RESPUESTA (JSON):**
{
    "suggestedTitle": "Un título claro, descriptivo y profesional para este contenido (max 6-8 palabras)",
    "summary": {
      "overview": "Resumen ejecutivo detallado del contenido, temas principales y valor del conocimiento (4-6 oraciones)",
    "targetAudience": "Descripción del público objetivo o perfil ideal para este conocimiento",
    "mainObjective": "Objetivo principal del contenido (educar, transformar, vender, informar)",
    "sophisticationLevel": "Nivel de profundidad del conocimiento: básico/intermedio/avanzado/experto",
    "overallEffectiveness": "Evaluación de la calidad y utilidad del contenido (1-10) con justificación",
    "keyFindings": [
      "Idea/Hallazgo clave 1 - con explicación detallada",
      "Idea/Hallazgo clave 2 - con explicación detallada",
      "Idea/Hallazgo clave 3 - con explicación detallada",
      "Idea/Hallazgo clave 4 - con explicación detallada",
      "Idea/Hallazgo clave 5 - con explicación detallada"
    ],
    "strengthsAndWeaknesses": {
      "strengths": ["Punto fuerte 1", "Punto fuerte 2", "Punto fuerte 3"],
      "weaknesses": ["Limitación o área de mejora 1", "Limitación 2"]
    },
    "recommendations": [
      "Aplicación práctica 1 - cómo usar este conocimiento",
      "Aplicación práctica 2",
      "Aplicación práctica 3",
      "Aplicación práctica 4"
    ]
  },
  "frameworksDetected": [
    {
      "name": "Nombre del modelo o estructura",
      "description": "Cómo se aplica en el contenido",
      "effectiveness": "alta/media/baja"
    }
  ],
  "emotionalJourney": {
    "openingEmotion": "Estado inicial propuesto",
    "middleEmotion": "Estado durante el desarrollo",
    "closingEmotion": "Estado final o conclusión",
    "peakMoments": ["Momento de mayor revelación 1", "Momento 2"]
  },
  "techniques": [
    {
      "name": "Nombre descriptivo del concepto, técnica o estrategia",
      "category": "conocimiento|comunicacion|engagement|posicionamiento|psicologia|estructura",
      "subcategory": "Subcategoría específica (ej: 'modelo mental', 'hook', 'storytelling')",
      "description": "Explicación DETALLADA de este elemento y su importancia",
      "whyItWorks": "Por qué es efectivo o relevante",
      "objective": "Qué logra este elemento",
      "funnelStage": "aprendizaje|consideracion|aplicacion|retencion",
      "evidence": [
        {
          "text": "CITA TEXTUAL EXACTA del contenido (mínimo 10-30 palabras)",
          "context": "Contexto: dónde aparece y su relevancia"
        }
      ],
      "confidence": 0.95,
      "impact": "alto|medio|bajo"
    }
  ],
  "languageAnalysis": {
    "toneOfVoice": "Descripción del tono usado",
    "powerWords": ["Conceptos clave o terminología importante"],
    "callToActionPhrases": ["Frases de acción o conclusión"],
    "persuasivePatterns": ["Patrones retóricos identificados"]
  }
}

## REQUISITOS CRÍTICOS:
- Detecta MÍNIMO 15-25 elementos diferentes (ideas, técnicas, estrategias)
- Cada elemento debe tener evidencia textual EXACTA
- Incluye tanto conceptos explícitos como estrategias de comunicación sutiles
- Las descripciones deben ser DETALLADAS
- Si el contenido es corto, exprime al máximo cada detalle
- NO inventes información que no esté en el texto`;

  try {
    const analysis = await retryWithBackoff(async () => {
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
        throw parseAPIError(errorData, response);
      }

      return response.json();
    }, 3, 1000, 30000); // 3 retries, 1s base delay, 30s max delay

    console.log('✅ Respuesta recibida de OpenAI');

    const content = analysis.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió contenido de la IA');
    }

    // Parse and repair JSON if needed
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(content);
    } catch (parseError) {
      console.warn('JSON malformado, intentando reparar...');
      parsedAnalysis = repairMalformedJSON(content);
    }

    // Validate and sanitize the response
    let formattedAnalysis;
    try {
      const { sanitizedResponse } = validateAIResponse(parsedAnalysis);
      formattedAnalysis = {
        ...sanitizedResponse,
        suggestedTitle: parsedAnalysis.suggestedTitle,
        analysisMetadata: {
          ...sanitizedResponse.analysisMetadata,
          transcriptStats: stats,
          tokensUsed: analysis.usage?.total_tokens || 0
        }
      };
    } catch (validationError) {
      console.warn('Validation failed, using fallback response:', validationError);

      // Create a basic fallback response
      formattedAnalysis = {
        summary: {
          overview: 'Análisis completado con limitaciones. La respuesta de la IA no siguió el formato esperado.',
          keyFindings: ['Se detectó contenido de marketing'],
          recommendations: ['Revisar el análisis manualmente']
        },
        techniques: [{
          id: `fallback_${Date.now()}`,
          name: 'Análisis General',
          category: 'engagement',
          description: 'Se detectó contenido de marketing general',
          objective: 'Comunicar mensaje',
          funnelStage: 'awareness',
          evidence: [],
          confidence: 0.5
        }],
        analysisMetadata: {
          processedAt: new Date().toISOString(),
          model: AI_MODEL,
          transcriptLength: fullText.length,
          techniquesFound: 1,
          tokensUsed: analysis.usage?.total_tokens || 0,
          transcriptStats: stats,
          validationError: validationError.message
        }
      };
    }

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

    if (error.statusCode === 429) {
      throw new Error('Límite de peticiones alcanzado. Por favor, intenta de nuevo más tarde.');
    }

    if (error.statusCode >= 500) {
      throw new Error('Error del servidor de OpenAI. Reintentando automáticamente...');
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

  const systemPrompt = `Eres un "Training Partner" y mentor experto. Tu objetivo es entrenar al usuario utilizando el conocimiento del transcript proporcionado.
NO te comportes como un simple buscador. Compórtate como un coach experimentado.

CONTENIDO:
${transcriptText}

ANÁLISIS DE INTELIGENCIA:
${JSON.stringify(aiAnalysis, null, 2)}

TU METODOLOGÍA DE ENTRENAMIENTO:
1. **Respuesta Directa y Práctica**: Responde a la pregunta del usuario con consejos accionables derivados del contenido.
2. **Mentalidad de Coach**: No solo des la información, explica *por qué* es importante y *cómo* aplicarla.
3. **Desafía al Usuario**: Si el usuario hace una pregunta superficial, respóndela pero invítalo a pensar más profundo (ej: "¿Has considerado cómo esto aplicaría a tu situación X?").
4. **Citas de Autoridad**: Respalda tus consejos citando el transcript (usa comillas).
5. **Verificación de Comprensión**: Termina tus respuestas importantes con una pregunta para asegurar que el usuario entendió o para animarlo a aplicar lo aprendido.

Si la pregunta no está en el contenido, usa tu criterio experto para dar un consejo general pero aclara que no está explícito en el texto.`;

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

  const systemPrompt = `Eres un Consultor Estratégico y "Training Partner" de alto nivel.
Tienes acceso a una BASE DE CONOCIMIENTO CENTRALIZADA (Tu cerebro) con ${transcripts.length} documentos clave.

TU MISIÓN:
Actuar como un socio de pensamiento (Thinking Partner) para el usuario. No eres solo un buscador, eres un consejero que usa esta base de datos para potenciar las decisiones del usuario.

BASE DE CONOCIMIENTO:
${knowledgeBase}

PRINCIPIOS DE INTERACCIÓN:
1. **Síntesis Inteligente**: No listes documentos. Cruza información. Si un documento dice A y otro dice B, explica la relación entre ellos.
2. **Consejo Proactivo**: Cuando el usuario pregunte sobre un tema, no solo le des la definición. Dale sugerencias de cómo implementar ese conocimiento.
3. **Voz de Experto**: Usa un tono profesional, alentador y seguro. Eres el experto en este conocimiento.
4. **Citas Reales**: Usa "..." para citar frases poderosas de los textos que refuercen tu consejo.
5. **Fomenta la Acción**: Tus respuestas deben inspirar al usuario a hacer algo con la información.
6. **Preguntas de Coaching**: De vez en cuando, termina con una pregunta que invite a la reflexión estratégica (ej: "¿Cuál de estas estrategias crees que tendría más impacto en tu proyecto actual?").

Tu objetivo final es que el usuario sea más inteligente y capaz después de hablar contigo.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: question }
  ];

  try {
    console.log(`🔍 Analizando contenido...`);

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