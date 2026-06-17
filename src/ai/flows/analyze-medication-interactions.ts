'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing potential medication interactions, allergies,
 * and conflicts with patient health parameters.
 *
 * - analyzeMedicationInteractions - A function that handles the analysis process.
 * - AnalyzeMedicationInteractionsInput - The input type for the analyzeMedicationInteractions function.
 * - AnalyzeMedicationInteractionsOutput - The return type for the analyzeMedicationInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMedicationInteractionsInputSchema = z.object({
  medications: z.array(z.string()).describe('A list of medications the patient is currently taking.'),
  allergies: z.array(z.string()).describe('A list of known patient allergies.'),
  healthParameters: z.array(z.string()).describe('A list of relevant patient health parameters (e.g., "high blood pressure", "diabetes", "pregnant").'),
});
export type AnalyzeMedicationInteractionsInput = z.infer<typeof AnalyzeMedicationInteractionsInputSchema>;

const WarningSchema = z.object({
  type: z.enum(['allergy', 'medication-interaction', 'health-conflict']).describe("The type of warning, e.g., 'allergy', 'medication-interaction', 'health-conflict'."),
  medication: z.string().describe('The medication primarily involved in the warning.'),
  description: z.string().describe('A detailed description of the potential warning and its implications.'),
});

const AnalyzeMedicationInteractionsOutputSchema = z.object({
  hasWarnings: z.boolean().describe('True if any warnings were found, false otherwise.'),
  warnings: z.array(WarningSchema).describe('An array of identified warnings.'),
});
export type AnalyzeMedicationInteractionsOutput = z.infer<typeof AnalyzeMedicationInteractionsOutputSchema>;

export async function analyzeMedicationInteractions(input: AnalyzeMedicationInteractionsInput): Promise<AnalyzeMedicationInteractionsOutput> {
  return analyzeMedicationInteractionsFlow(input);
}

const analyzeMedicationInteractionsPrompt = ai.definePrompt({
  name: 'analyzeMedicationInteractionsPrompt',
  input: {schema: AnalyzeMedicationInteractionsInputSchema},
  output: {schema: AnalyzeMedicationInteractionsOutputSchema},
  prompt: `You are a highly skilled medical assistant specialized in identifying potential medication interactions, allergies, and conflicts with patient health parameters. Your goal is to analyze the provided information thoroughly and identify any potential warnings. Be precise and clear in your findings.

Patient's known allergies:
{{#if allergies}}
{{#each allergies}}- {{{this}}}
{{/each}}
{{else}}
None reported.
{{/if}}

Patient's relevant health parameters:
{{#if healthParameters}}
{{#each healthParameters}}- {{{this}}}
{{/each}}
{{else}}
None reported.
{{/if}}

Patient's current medications:
{{#if medications}}
{{#each medications}}- {{{this}}}
{{/each}}
{{else}}
None reported.
{{/if}}

Based on the above patient information, meticulously identify any potential warnings, specifically concerning:
1.  **Allergies**: If any medication is known to cause an allergic reaction in the patient based on their reported allergies.
2.  **Medication Interactions**: If any combination of the listed medications could lead to adverse interactions.
3.  **Health Conflicts**: If any medication conflicts with the patient's reported health parameters (e.g., a medication contraindicated for high blood pressure, diabetes, or pregnancy).

For each warning, provide the following details in a structured JSON array:
-   \`type\`: The category of the warning. Choose one of: 'allergy', 'medication-interaction', or 'health-conflict'.
-   \`medication\`: The specific medication primarily involved in this warning.
-   \`description\`: A clear and concise explanation of the potential warning and its implications.

If no warnings are found after careful consideration, set \`hasWarnings\` to \`false\` and return an empty array for \`warnings\`. Otherwise, set \`hasWarnings\` to \`true\`.`,
});

const analyzeMedicationInteractionsFlow = ai.defineFlow(
  {
    name: 'analyzeMedicationInteractionsFlow',
    inputSchema: AnalyzeMedicationInteractionsInputSchema,
    outputSchema: AnalyzeMedicationInteractionsOutputSchema,
  },
  async input => {
    const {output} = await analyzeMedicationInteractionsPrompt(input);
    return output!;
  }
);
