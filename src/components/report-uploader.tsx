
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
    <div className="space-y-6">
      <Card className="shadow-sm border-none bg-white dark:bg-card overflow-hidden rounded-3xl">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">Intelligent Report Uploader</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">Securely upload your medical documents for AI-powered data extraction.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div 
            onClick={triggerUpload}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl bg-[#FAFAFA] dark:bg-background/40 cursor-pointer hover:bg-[#F0F4FF] dark:hover:bg-primary/5 transition-all group border-primary/20"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,image/*"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-bold animate-pulse">Analyzing your report...</p>
              </div>
            ) : fileName && !errorMsg ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-lg font-bold text-center">
                  <span className="block">Uploaded Successfully</span>
                  <span className="text-sm font-medium text-muted-foreground">{fileName}</span>
                </p>
                <Button variant="outline" size="sm" className="mt-2 rounded-full px-6">Replace File</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="p-5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shadow-sm">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">Click to upload or drag & drop</p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 rounded-2xl border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Analysis Note</AlertTitle>
          <AlertDescription className="text-sm font-medium">{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
