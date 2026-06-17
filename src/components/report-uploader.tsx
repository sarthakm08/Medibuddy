import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractMedicalReportInsights, ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReportUploaderProps {
  onInsightsExtracted: (insights: ExtractMedicalReportInsightsOutput) => void;
  onXrayDetected: (imageUri: string) => void;
}

export function ReportUploader({ onInsightsExtracted, onXrayDetected }: ReportUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
          const insights = await extractMedicalReportInsights({ medicalReportDataUri: dataUri });
          
          if (insights.isXray) {
            onXrayDetected(dataUri);
          } else {
            onInsightsExtracted(insights);
            if (insights.medications.length === 0 && insights.treatmentTimelines.length === 0) {
              setErrorMsg(insights.message || "I couldn't extract enough information from this report.");
            }
          }
        } catch (error) {
          console.error('Error extracting insights:', error);
          setErrorMsg('Failed to analyze the report. Please try a clearer image or PDF.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="font-headline text-xl">Intelligent Report Uploader</CardTitle>
          </div>
          <CardDescription>Securely upload your medical documents for AI-powered data extraction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            onClick={triggerUpload}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-background/40 cursor-pointer hover:bg-background/60 transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,image/*"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse">Analyzing your report...</p>
              </div>
            ) : fileName && !errorMsg ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="text-sm font-medium text-center">
                  <span className="block font-bold">Uploaded Successfully</span>
                  <span className="text-muted-foreground">{fileName}</span>
                </p>
                <Button variant="outline" size="sm" className="mt-2">Replace File</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Note</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
