'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing X-ray images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeXrayInputSchema = z.object({
  xrayDataUri: z.string().describe("X-ray image as a data URI."),
});
export type AnalyzeXrayInput = z.infer<typeof AnalyzeXrayInputSchema>;

const AnalyzeXrayOutputSchema = z.object({
  status: z.enum(['success', 'error']).describe('Whether the analysis was successful or the image was invalid/unclear.'),
  errorMessage: z.string().optional().describe('Error message if status is error.'),
  findings: z.string().optional().describe('What the X-ray shows.'),
  recoveryTime: z.string().optional().describe('Estimated time for recovery (e.g., "4-6 weeks").'),
  seriousness: z.enum(['low', 'moderate', 'high']).optional().describe('How serious the findings are.'),
  recommendations: z.array(z.string()).optional(),
});
export type AnalyzeXrayOutput = z.infer<typeof AnalyzeXrayOutputSchema>;

export async function analyzeXray(input: AnalyzeXrayInput): Promise<AnalyzeXrayOutput> {
  return analyzeXrayFlow(input);
}

const analyzeXrayPrompt = ai.definePrompt({
  name: 'analyzeXrayPrompt',
  input: { schema: AnalyzeXrayInputSchema },
  output: { schema: AnalyzeXrayOutputSchema },
  prompt: `You are an expert radiologist. Analyze the provided X-ray image.

X-ray Image: {{media url=xrayDataUri}}

Instructions:
1. First, determine if the image is a valid, clear X-ray. If it is blurry, not an X-ray, or of poor quality, set status to 'error' and provide a helpful error message asking to re-upload.
2. If valid, provide detailed findings.
3. Estimate recovery time.
4. Assess seriousness (low, moderate, high).
5. Provide next-step recommendations.

DISCLAIMER: Always emphasize that this is an AI analysis and must be confirmed by a human doctor.`,
});

const analyzeXrayFlow = ai.defineFlow(
  {
    name: 'analyzeXrayFlow',
    inputSchema: AnalyzeXrayInputSchema,
    outputSchema: AnalyzeXrayOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeXrayPrompt(input);
    return output!;
  }
);
