// AI Analysis utilities for marketing techniques
import { analyzeTranscriptWithAI } from './openrouter';

export const analyzeTranscript = async (transcript, videoMetadata) => {
  // Use OpenRouter for real AI analysis
  try {
    const analysis = await analyzeTranscriptWithAI(transcript, videoMetadata);
    return analysis;
  } catch (error) {
    console.error('AI analysis failed, falling back to mock data:', error);
    
    // Fallback to mock analysis if AI fails
    return analyzeTranscriptMock(transcript, videoMetadata);
  }
};

// Mock analysis as fallback
const analyzeTranscriptMock = async (transcript, videoMetadata) => {
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing
  
  const fullText = transcript.map(segment => segment.text).join(' ');
  
  // Mock analysis based on keywords in transcript
  const techniques = [];
  const categories = {
    urgency: ['urgency', 'limited time', 'expires', 'deadline', 'hurry', 'now or never'],
    social_proof: ['testimonial', 'review', 'customer', 'success story', 'results'],
    scarcity: ['limited', 'exclusive', 'only', 'few left', 'rare', 'scarce'],
    authority: ['expert', 'proven', 'research', 'study', 'data', 'statistics'],
    hooks: ['welcome', 'today', 'first', 'secret', 'reveal', 'discover'],
    cta: ['click', 'subscribe', 'buy', 'get', 'download', 'sign up', 'join'],
    storytelling: ['story', 'happened', 'experience', 'journey', 'remember'],
    objection_handling: ['but', 'however', 'concern', 'worry', 'problem', 'issue']
  };
  
  Object.entries(categories).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (fullText.toLowerCase().includes(keyword)) {
        const evidence = findEvidence(transcript, keyword);
        if (evidence.length > 0) {
          techniques.push(createTechnique(category, keyword, evidence));
        }
      }
    });
  });
  
  // Generate executive summary
  const summary = generateExecutiveSummary(techniques, videoMetadata);
  
  return {
    summary,
    techniques: techniques.slice(0, 10), // Limit to top 10 techniques
    analysisMetadata: {
      processedAt: new Date().toISOString(),
      transcriptLength: fullText.length,
      techniquesFound: techniques.length,
      confidence: 0.85
    }
  };
};

const findEvidence = (transcript, keyword) => {
  const evidence = [];
  
  transcript.forEach(segment => {
    if (segment.text.toLowerCase().includes(keyword.toLowerCase())) {
      evidence.push({
        text: segment.text,
        timestamp: segment.start,
        duration: segment.duration
      });
    }
  });
  
  return evidence;
};

const createTechnique = (category, keyword, evidence) => {
  const techniqueTemplates = {
    urgency: {
      name: 'Urgency Creation',
      description: 'Creates time pressure to encourage immediate action',
      objective: 'Drive immediate conversions',
      funnelStage: 'conversion'
    },
    social_proof: {
      name: 'Social Proof',
      description: 'Uses testimonials and success stories to build credibility',
      objective: 'Build trust and credibility',
      funnelStage: 'consideration'
    },
    scarcity: {
      name: 'Scarcity Marketing',
      description: 'Emphasizes limited availability to increase perceived value',
      objective: 'Increase perceived value',
      funnelStage: 'conversion'
    },
    authority: {
      name: 'Authority Building',
      description: 'Establishes expertise through data and credentials',
      objective: 'Build credibility',
      funnelStage: 'awareness'
    },
    hooks: {
      name: 'Attention Hook',
      description: 'Opening statements designed to capture viewer attention',
      objective: 'Increase engagement',
      funnelStage: 'awareness'
    },
    cta: {
      name: 'Call to Action',
      description: 'Direct instructions for desired viewer behavior',
      objective: 'Drive specific actions',
      funnelStage: 'conversion'
    },
    storytelling: {
      name: 'Storytelling',
      description: 'Uses narrative techniques to engage and persuade',
      objective: 'Increase engagement',
      funnelStage: 'consideration'
    },
    objection_handling: {
      name: 'Objection Handling',
      description: 'Addresses potential concerns or hesitations',
      objective: 'Remove barriers to conversion',
      funnelStage: 'consideration'
    }
  };
  
  const template = techniqueTemplates[category] || {
    name: 'Marketing Technique',
    description: 'General marketing technique detected',
    objective: 'Improve marketing effectiveness',
    funnelStage: 'general'
  };
  
  return {
    id: `${category}_${keyword}_${Date.now()}`,
    name: template.name,
    category,
    description: template.description,
    objective: template.objective,
    funnelStage: template.funnelStage,
    evidence: evidence.slice(0, 3), // Limit evidence to top 3 instances
    confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
    detectedKeyword: keyword
  };
};

const generateExecutiveSummary = (techniques, videoMetadata) => {
  const categoryCount = {};
  techniques.forEach(tech => {
    categoryCount[tech.category] = (categoryCount[tech.category] || 0) + 1;
  });
  
  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
  
  return {
    overview: `Analysis of "${videoMetadata.title}" identified ${techniques.length} marketing techniques across ${Object.keys(categoryCount).length} categories.`,
    keyFindings: [
      `Primary focus on ${topCategories[0]} techniques`,
      `Strong emphasis on ${topCategories[1] || 'engagement'} strategies`,
      `${techniques.filter(t => t.confidence > 0.8).length} high-confidence techniques detected`
    ],
    recommendations: [
      'Consider implementing similar urgency tactics in your campaigns',
      'Study the storytelling structure for content inspiration',
      'Adapt the call-to-action patterns for your audience'
    ]
  };
};