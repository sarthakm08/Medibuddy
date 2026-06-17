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

const HealthCoachOutputSchema = z.object({
  dailySuggestions: z.array(z.string()),
  fitnessRecommendations: z.array(z.string()),
  nutritionFocus: z.string(),
  wellnessTip: z.string(),
});

export type HealthCoachOutput = z.infer<typeof HealthCoachOutputSchema>;

export async function getHealthCoachAdvice(input: z.infer<typeof HealthCoachInputSchema>): Promise<HealthCoachOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a personalized health and wellness coach.
    
    Patient Profile: ${input.patientProfile}
    Goals: ${input.goals || 'Improve overall wellness'}
    
    Provide daily suggestions, fitness recommendations, nutrition focus, and a wellness tip tailored to this specific profile.`,
    output: { schema: HealthCoachOutputSchema },
  });
  return output!;
}
