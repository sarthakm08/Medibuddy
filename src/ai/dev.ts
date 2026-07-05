import { config } from 'dotenv';
config();

// Ensure all flows are registered for the Genkit UI
// Removed .ts extensions to follow TypeScript best practices and avoid bundler confusion
import './flows/extract-medical-report-insights-flow';
import './flows/analyze-medication-interactions';
import './flows/suggest-diet-plan-flow';
import './flows/analyze-xray-flow';
import './flows/symptom-checker-flow';
import './flows/health-coach-flow';
import './flows/raju-chat-flow';
import './flows/detect-medicine-flow';
