'use server';
/**
 * @fileOverview AI Symptom Checker Flow
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomCheckerInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
  patientContext: z.string().optional().describe('Brief context about the patient (age, sex, etc.).'),
});

const SymptomCheckerOutputSchema = z.object({
  possibleConditions: z.array(z.object({
    name: z.string(),
    likelihood: z.enum(['low', 'moderate', 'high']),
    explanation: z.string(),
  })),
  urgencyLevel: z.enum(['routine', 'urgent', 'emergency']),
  guidance: z.string().describe('What the user should do next.'),
  disclaimer: z.string(),
});

export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function checkSymptoms(input: z.infer<typeof SymptomCheckerInputSchema>): Promise<SymptomCheckerOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an AI medical triaging assistant. Analyze the symptoms provided and suggest possible conditions.
    
    Symptoms: ${input.symptoms}
    Patient Context: ${input.patientContext || 'Not provided'}
    
    Instructions:
    1. Be conservative. If life-threatening symptoms are mentioned, set urgency to 'emergency'.
    2. Suggest 2-3 possible conditions with likelihoods.
    3. Provide clear next-step guidance.
    4. Include a strong medical disclaimer.`,
    output: { schema: SymptomCheckerOutputSchema },
  });
  return output!;
}
