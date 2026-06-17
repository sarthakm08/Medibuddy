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
      <Card className="glass-morphism overflow-hidden rounded-[2.5rem] border-white/60 shadow-2xl">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl backdrop-blur-sm">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold text-primary">Intelligent Report Uploader</CardTitle>
          </div>
          <CardDescription className="text-base mt-2 font-medium">Securely upload your medical documents for AI-powered data extraction.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div 
            onClick={triggerUpload}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all duration-500 group border-white/40 shadow-inner"
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
                <p className="text-xl font-bold text-primary animate-pulse">Analyzing your report...</p>
              </div>
            ) : fileName && !errorMsg ? (
              <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                <div className="p-4 bg-green-100/50 rounded-full shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-xl font-bold text-center text-primary">
                  <span className="block">Uploaded Successfully</span>
                  <span className="text-sm font-medium text-muted-foreground">{fileName}</span>
                </p>
                <Button variant="outline" size="sm" className="mt-2 rounded-full px-8 glass border-primary/20 hover:bg-primary/5">Replace File</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="p-6 rounded-full bg-white/40 group-hover:bg-primary/20 transition-all duration-500 shadow-xl group-hover:scale-110">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">Click to upload or drag & drop</p>
                  <p className="text-sm text-muted-foreground mt-1 font-semibold">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 glass border-destructive/20 shadow-lg rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Analysis Note</AlertTitle>
          <AlertDescription className="text-sm font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}