'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting key medical information from uploaded reports.
 *
 * - extractMedicalReportInsights - A function that handles the medical report insights extraction process.
 * - ExtractMedicalReportInsightsInput - The input type for the extractMedicalReportInsights function.
 * - ExtractMedicalReportInsightsOutput - The return type for the extractMedicalReportInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractMedicalReportInsightsInputSchema = z.object({
  medicalReportDataUri: z
    .string()
    .describe(
      "A medical report (PDF or image), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractMedicalReportInsightsInput = z.infer<
  typeof ExtractMedicalReportInsightsInputSchema
>;

const ExtractMedicalReportInsightsOutputSchema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().describe('The name of the medication.'),
        dosage: z.string().describe('The dosage of the medication (e.g., "500 mg").'),
        frequency: z.string().describe('How often the medication should be taken (e.g., "twice daily").'),
        route: z.string().optional().describe('The route of administration (e.g., "oral", "topical").'),
        notes: z.string().optional().describe('Any additional notes or instructions for the medication.'),
      })
    )
    .describe('A list of all identified medications.'),
  treatmentTimelines: z
    .array(
      z.object({
        condition: z.string().describe('The medical condition or reason for treatment.'),
        startDate: z.string().optional().describe('The start date of the treatment in YYYY-MM-DD format.'),
        endDate: z.string().optional().describe('The end date of the treatment in YYYY-MM-DD format.'),
        notes: z.string().optional().describe('Any specific instructions or details regarding the treatment timeline.'),
      })
    )
    .describe('A list of identified treatment plans and their timelines.'),
  otherKeyInformation: z.string().optional().describe('Any other significant medical information found in the report.'),
});
export type ExtractMedicalReportInsightsOutput = z.infer<
  typeof ExtractMedicalReportInsightsOutputSchema
>;

export async function extractMedicalReportInsights(
  input: ExtractMedicalReportInsightsInput
): Promise<ExtractMedicalReportInsightsOutput> {
  return extractMedicalReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMedicalReportInsightsPrompt',
  input: { schema: ExtractMedicalReportInsightsInputSchema },
  output: { schema: ExtractMedicalReportInsightsOutputSchema },
  prompt: `You are an expert medical assistant trained to extract key medical information from patient reports.

Your task is to carefully analyze the provided medical report and extract all relevant medications, their dosages, frequencies, and any associated treatment timelines.

Pay close attention to detail and accurately parse complex medical jargon. If specific information is not available (e.g., end date for a treatment), you can omit that field.

Medical Report: {{media url=medicalReportDataUri}}

Extract the information in a structured JSON format according to the output schema provided.`,
});

const extractMedicalReportInsightsFlow = ai.defineFlow(
  {
    name: 'extractMedicalReportInsightsFlow',
    inputSchema: ExtractMedicalReportInsightsInputSchema,
    outputSchema: ExtractMedicalReportInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
