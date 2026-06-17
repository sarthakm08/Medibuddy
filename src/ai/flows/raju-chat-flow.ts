'use server';
/**
 * @fileOverview Raju - The friendly health assistant chatbot flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RajuChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Chat history.'),
});

const RajuChatOutputSchema = z.object({
  reply: z.string().describe('Raju\'s response.'),
});

export async function rajuChat(input: z.infer<typeof RajuChatInputSchema>) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    system: `You are Raju, a friendly and knowledgeable medical assistant chatbot for the Medibuddy app.
    Your tone is empathetic, helpful, and professional. 
    You can answer general health questions, explain medical terms, and provide wellness tips.
    Always remind users that you are an AI and they should consult a real doctor for serious issues.
    Keep your answers concise and easy to understand.`,
    prompt: input.message,
    // Note: In a real app we'd pass history here, but keeping it simple for MVP
    output: { schema: RajuChatOutputSchema },
  });
  return output!;
}
