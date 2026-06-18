'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting key medical information from uploaded reports.
 *
 * - extractMedicalReportInsights - A function that handles the medical report insights extraction process.
 * - ExtractMedicalReportInsightsInput - The input type for the extractMedicalReportInsights function.
 * - ExtractMedicalReportInsightsOutput - The return type for the extractMedicalReportInsights function.
 */

import { ai, commonConfig } from '@/ai/genkit';
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
  isXray: z.boolean().describe('True if the uploaded file appears to be a skeletal X-ray image rather than a text report.'),
  message: z.string().describe('A summary message explaining what was found or why information could not be extracted.'),
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

const extractMedicalReportInsightsPrompt = ai.definePrompt({
  name: 'extractMedicalReportInsightsPrompt',
  input: { schema: ExtractMedicalReportInsightsInputSchema },
  output: { schema: ExtractMedicalReportInsightsOutputSchema },
  config: commonConfig,
  prompt: `You are an expert medical assistant. Analyze the provided file.

File: {{media url=medicalReportDataUri}}

Instructions:
1. **Detect File Type**: If the image is a skeletal X-ray, set 'isXray' to true.
2. **Extraction**: If it's a report, extract all medications and treatment timelines.
3. **Fallback Message**: If the file is unreadable, blurry, or contains no medical information, explain this clearly in the 'message' field (e.g., "I couldn't find any medications or treatment plans in this document. Please ensure the scan is clear.").
4. If it IS an X-ray, set 'isXray' to true and set 'message' to "This looks like an X-ray. I am redirecting you to the X-ray Analyzer."

Be precise. If information is missing, do not hallucinate; use the 'message' field to inform the user.`,
});

const extractMedicalReportInsightsFlow = ai.defineFlow(
  {
    name: 'extractMedicalReportInsightsFlow',
    inputSchema: ExtractMedicalReportInsightsInputSchema,
    outputSchema: ExtractMedicalReportInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await extractMedicalReportInsightsPrompt(input);
    return output!;
  }
);
