'use server';
/**
 * @fileOverview Raju - The friendly health assistant chatbot flow.
 */

import { ai, commonConfig } from '@/ai/genkit';
import { z } from 'genkit';

const RajuChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Chat history.'),
});
export type RajuChatInput = z.infer<typeof RajuChatInputSchema>;

const RajuChatOutputSchema = z.object({
  reply: z.string().describe('Raju\'s response.'),
});
export type RajuChatOutput = z.infer<typeof RajuChatOutputSchema>;

export async function rajuChat(input: RajuChatInput): Promise<RajuChatOutput> {
  return rajuChatFlow(input);
}

const rajuChatFlow = ai.defineFlow(
  {
    name: 'rajuChatFlow',
    inputSchema: RajuChatInputSchema,
    outputSchema: RajuChatOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `You are Raju, a friendly and knowledgeable medical assistant chatbot for the Medibuddy app.
      Your tone is empathetic, helpful, and professional. 
      You can answer general health questions, explain medical terms, and provide wellness tips.
      Always remind users that you are an AI and they should consult a real doctor for serious issues.
      Keep your answers concise and easy to understand.`,
      prompt: input.message,
      config: commonConfig,
      output: { schema: RajuChatOutputSchema },
    });
    
    if (!output) {
      return { reply: "I'm sorry, I'm having a little trouble processing that. Could you try rephrasing?" };
    }
    
    return output;
  }
);
