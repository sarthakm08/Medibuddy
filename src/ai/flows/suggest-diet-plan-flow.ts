'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a personalized diet plan based on patient health data.
 */

import { ai, commonConfig } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDietPlanInputSchema = z.object({
  conditions: z.array(z.string()).describe('Patient chronic conditions.'),
  medications: z.array(z.string()).describe('Patient medications.'),
  weight: z.string().optional(),
  height: z.string().optional(),
});
export type SuggestDietPlanInput = z.infer<typeof SuggestDietPlanInputSchema>;

const DietPlanOutputSchema = z.object({
  title: z.string().describe('Title of the diet plan.'),
  recommendedFoods: z.array(z.string()).describe('List of recommended foods.'),
  foodsToAvoid: z.array(z.string()).describe('List of foods to avoid.'),
  dailySchedule: z.array(z.object({
    meal: z.string(),
    suggestion: z.string(),
  })),
  recoveryTips: z.string().describe('General tips for faster recovery.'),
});
export type DietPlanOutput = z.infer<typeof DietPlanOutputSchema>;

export async function suggestDietPlan(input: SuggestDietPlanInput): Promise<DietPlanOutput> {
  return suggestDietPlanFlow(input);
}

const suggestDietPlanPrompt = ai.definePrompt({
  name: 'suggestDietPlanPrompt',
  input: { schema: SuggestDietPlanInputSchema },
  output: { schema: DietPlanOutputSchema },
  config: commonConfig,
  prompt: `You are a clinical nutritionist. Suggest a personalized diet plan for a patient with the following profile:

Conditions: {{#each conditions}}- {{{this}}}
{{/each}}
Medications: {{#each medications}}- {{{this}}}
{{/each}}
Weight: {{{weight}}} kg, Height: {{{height}}} cm.

Create a balanced diet plan focused on faster recovery. Consider potential food-medication interactions and the patient's specific conditions (e.g., low sodium for hypertension, low glycemic for diabetes).`,
});

const suggestDietPlanFlow = ai.defineFlow(
  {
    name: 'suggestDietPlanFlow',
    inputSchema: SuggestDietPlanInputSchema,
    outputSchema: DietPlanOutputSchema,
  },
  async (input) => {
    const { output } = await suggestDietPlanPrompt(input);
    return output!;
  }
);
