'use server';
/**
 * @fileOverview Personalized Health Coach Flow
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HealthCoachInputSchema = z.object({
  patientProfile: z.string().describe('Summarized patient data.'),
  goals: z.string().optional().describe('User health goals.'),
});
export type HealthCoachInput = z.infer<typeof HealthCoachInputSchema>;

const HealthCoachOutputSchema = z.object({
  dailySuggestions: z.array(z.string()),
  fitnessRecommendations: z.array(z.string()),
  nutritionFocus: z.string(),
  wellnessTip: z.string(),
});
export type HealthCoachOutput = z.infer<typeof HealthCoachOutputSchema>;

export async function getHealthCoachAdvice(input: HealthCoachInput): Promise<HealthCoachOutput> {
  return healthCoachFlow(input);
}

const healthCoachFlow = ai.defineFlow(
  {
    name: 'healthCoachFlow',
    inputSchema: HealthCoachInputSchema,
    outputSchema: HealthCoachOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a personalized health and wellness coach.
      
      Patient Profile: ${input.patientProfile}
      Goals: ${input.goals || 'Improve overall wellness'}
      
      Provide daily suggestions, fitness recommendations, nutrition focus, and a wellness tip tailored to this specific profile.`,
      output: { schema: HealthCoachOutputSchema },
    });
    return output!;
  }
);
