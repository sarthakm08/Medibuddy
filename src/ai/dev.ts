import { config } from 'dotenv';
config();

// Ensure all flows are registered for the Genkit UI
import './flows/extract-medical-report-insights-flow.ts';
import './flows/analyze-medication-interactions.ts';
import './flows/suggest-diet-plan-flow.ts';
import './flows/analyze-xray-flow.ts';
import './flows/symptom-checker-flow.ts';
import './flows/health-coach-flow.ts';
import './flows/raju-chat-flow.ts';
import './flows/detect-medicine-flow.ts';
