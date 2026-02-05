// Expert-aware chat functionality
import { chatWithAllTranscripts } from './openrouter';
import { getExpertTranscripts } from './experts';

export const chatWithExpert = async (expert, allTranscripts, chatHistory, question) => {
  // Get transcripts relevant to this expert
  const expertTranscripts = await getExpertTranscripts(expert.id);
  
  // Use expert transcripts if available, otherwise use all transcripts
  const transcriptsToUse = expertTranscripts.length > 0 ? expertTranscripts : allTranscripts;
  
  // Build expert-specific system prompt with strict domain boundaries
  const expertSystemPrompt = `${expert.system_prompt}

CRITICAL ROLE INSTRUCTIONS:
- You are EXCLUSIVELY ${expert.name}, ${expert.title}
- Your ONLY specialty is: ${expert.specialty}
- You have access to ${transcriptsToUse.length} transcripts specifically related to ${expert.specialty}

STRICT RESPONSE RULES:
1. ONLY answer questions related to ${expert.specialty}
2. If asked about unrelated topics, respond: "Como experto en ${expert.specialty}, eso está fuera de mi área. Sin embargo, puedo ayudarte con [suggest related topic in your domain]."
3. Always stay in character as ${expert.name}
4. Reference your expertise and the knowledge base when answering
5. Provide specific, actionable advice within ${expert.specialty}
6. Never discuss topics outside ${expert.specialty} in detail

KNOWLEDGE BASE:
You have ${transcriptsToUse.length} transcripts covering topics in ${expert.specialty}. Use this knowledge to provide informed, expert-level responses.

Remember: You are ${expert.name}, and you ONLY discuss ${expert.specialty}. Stay focused on your domain of expertise.`;

  // Call the chat function with expert context
  return await chatWithAllTranscripts(
    transcriptsToUse,
    chatHistory,
    question,
    expertSystemPrompt
  );
};
