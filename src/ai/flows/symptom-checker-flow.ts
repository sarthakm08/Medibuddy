'use server';
/**
 * @fileOverview AI Symptom Checker Flow with Image Support
 * 
 * - checkSymptoms - A function that handles the symptom analysis process including visual symptoms.
 * - SymptomCheckerInput - The input type for the symptom checker.
 * - SymptomCheckerOutput - The return type for the symptom checker.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomCheckerInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
  patientContext: z.string().optional().describe('Brief context about the patient (age, sex, etc.).'),
  photoDataUri: z.string().optional().describe("An optional photo of the symptom (e.g., a rash), as a data URI."),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

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

const symptomCheckerPrompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  input: { schema: SymptomCheckerInputSchema },
  output: { schema: SymptomCheckerOutputSchema },
  prompt: `You are an AI medical triaging assistant. Analyze the symptoms provided and suggest possible conditions.
    
Symptoms: {{{symptoms}}}
Patient Context: {{#if patientContext}}{{{patientContext}}}{{else}}Not provided{{/if}}
{{#if photoDataUri}}
Symptom Photo: {{media url=photoDataUri}}
{{/if}}
    
Instructions:
1. Analyze both the text description and any provided image (e.g., look for rashes, discoloration, or swelling).
2. Be conservative. If life-threatening symptoms are mentioned or visible, set urgency to 'emergency'.
3. Suggest 2-3 possible conditions with likelihoods based on all provided evidence.
4. Provide clear next-step guidance.
5. Include a strong medical disclaimer.`,
});

export async function checkSymptoms(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await symptomCheckerPrompt(input);
    return output!;
  }
);
