'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting medicine details from a photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectMedicineInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a medicine pack or bottle, as a data URI."),
});
export type DetectMedicineInput = z.infer<typeof DetectMedicineInputSchema>;

const DetectMedicineOutputSchema = z.object({
  detected: z.boolean().describe('Whether a medicine was successfully detected.'),
  name: z.string().optional().describe('The name of the medicine.'),
  type: z.enum(['pill', 'syrup']).optional().describe('The type of medicine.'),
  suggestedAmount: z.string().optional().describe('The suggested dosage amount found on the label.'),
  confidence: z.number().optional().describe('Detection confidence score 0-1.'),
});
export type DetectMedicineOutput = z.infer<typeof DetectMedicineOutputSchema>;

export async function detectMedicine(input: DetectMedicineInput): Promise<DetectMedicineOutput> {
  return detectMedicineFlow(input);
}

const detectMedicinePrompt = ai.definePrompt({
  name: 'detectMedicinePrompt',
  input: { schema: DetectMedicineInputSchema },
  output: { schema: DetectMedicineOutputSchema },
  prompt: `You are an expert pharmacist assistant. Analyze the provided photo of a medicine.

Photo: {{media url=photoDataUri}}

Instructions:
1. Identify the name of the medicine.
2. Determine if it is likely a pill (tablets, capsules) or a syrup (liquid).
3. Look for any dosage instructions like "500mg" or "10ml".
4. If the image is unclear or not a medicine, set detected to false.

Be precise and avoid guessing if the label is not readable.`,
});

const detectMedicineFlow = ai.defineFlow(
  {
    name: 'detectMedicineFlow',
    inputSchema: DetectMedicineInputSchema,
    outputSchema: DetectMedicineOutputSchema,
  },
  async (input) => {
    const { output } = await detectMedicinePrompt(input);
    return output!;
  }
);
