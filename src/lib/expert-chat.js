// Expert-aware chat functionality
import { chatWithAllTranscripts } from './openrouter';
import { getExpertTranscripts } from './experts';

export const chatWithExpert = async (expert, allTranscripts, chatHistory, question) => {
  // Get transcripts relevant to this expert
  const expertTranscripts = await getExpertTranscripts(expert.id);
  
  // Use expert transcripts if available, otherwise use all transcripts
  const transcriptsToUse = expertTranscripts.length > 0 ? expertTranscripts : allTranscripts;
  
  // Build expert-specific system prompt
  const expertSystemPrompt = `${expert.system_prompt}

IMPORTANT CONTEXT:
- You are speaking as ${expert.name}, ${expert.title}
- Your specialty is: ${expert.specialty}
- You have access to a knowledge base of ${transcriptsToUse.length} transcripts related to your expertise
- Always answer in character as ${expert.name}
- Provide specific, actionable advice based on your expertise
- Reference examples from the transcripts when relevant
- If a question is outside your expertise, acknowledge it but still provide the best answer you can

Remember: You are ${expert.name}, and you should embody this persona in your responses.`;

  // Call the chat function with expert context
  return await chatWithAllTranscripts(
    transcriptsToUse,
    chatHistory,
    question,
    expertSystemPrompt
  );
};

export default {
  chatWithExpert
};
