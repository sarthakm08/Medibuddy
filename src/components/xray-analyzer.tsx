import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Activity, ShieldAlert, Timer, Info, AlertTriangle } from 'lucide-react';
import { analyzeXray, AnalyzeXrayOutput } from '@/ai/flows/analyze-xray-flow';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface XrayAnalyzerProps {
  initialImage?: string | null;
}

export function XrayAnalyzer({ initialImage }: XrayAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeXrayOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
      performAnalysis(initialImage);
    }
  }, [initialImage]);

  const performAnalysis = async (dataUri: string) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeXray({ xrayDataUri: dataUri });
      setResult(analysis);
    } catch (error) {
      console.error('X-ray analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      setPreview(dataUri);
      performAnalysis(dataUri);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-headline font-bold text-primary">X-ray Analysis Engine</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Upload an X-ray image for an AI-powered scan of findings, recovery estimation, and clinical seriousness.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Area */}
          <Card className="border-2 border-dashed border-primary/20 bg-muted/10 hover:border-primary/40 transition-all overflow-hidden group">
            <CardContent className="p-0">
              <label className="cursor-pointer flex flex-col items-center justify-center p-12 min-h-[400px]">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {preview ? (
                  <div className="relative w-full h-[350px]">
                    <Image src={preview} fill className="object-contain rounded-lg" alt="X-ray preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">Replace Image</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-bold">Drop X-ray here</p>
                    <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, and DICOM conversions</p>
                  </div>
                )}
              </label>
            </CardContent>
          </Card>

          {/* Analysis Side */}
          <div className="space-y-4">
            {isAnalyzing && (
              <Card className="border-none shadow-sm bg-primary/5 p-12 flex flex-col items-center text-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div>
                  <h3 className="font-bold">Scanning Image...</h3>
                  <p className="text-sm text-muted-foreground">Checking clarity and identifying skeletal structures.</p>
                </div>
              </Card>
            )}

            {!isAnalyzing && result && result.status === 'error' && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-sm animate-in zoom-in-95">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">Analysis Failed</AlertTitle>
                <AlertDescription className="mt-2 text-sm leading-relaxed">
                  {result.errorMessage || "The uploaded image is not a valid or clear X-ray. Please ensure the lighting is good and the entire area of interest is visible."}
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-white" onClick={() => document.querySelector('input')?.click()}>
                    Re-upload Clear Image
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!isAnalyzing && result && result.status === 'success' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <div className={`h-1.5 w-full ${result.seriousness === 'high' ? 'bg-destructive' : result.seriousness === 'moderate' ? 'bg-orange-500' : 'bg-green-500'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="gap-1 px-3 py-1 bg-muted/30">
                        <Activity className="w-3 h-3" /> AI Analysis Result
                      </Badge>
                      <Badge className={result.seriousness === 'high' ? 'bg-destructive' : result.seriousness === 'moderate' ? 'bg-orange-500' : 'bg-green-500'}>
                        {result.seriousness?.toUpperCase()} SERIOUSNESS
                      </Badge>
                    </div>
                    <CardTitle className="font-headline text-xl mt-4">Radiology Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border-l-4 border-slate-200">
                      {result.findings}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 text-primary mb-1">
                          <Timer className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Recovery</span>
                        </div>
                        <p className="text-lg font-bold">{result.recoveryTime}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                        <div className="flex items-center gap-2 text-accent mb-1">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Severity</span>
                        </div>
                        <p className="text-lg font-bold capitalize">{result.seriousness} Scale</p>
                      </div>
                    </div>

                    {result.recommendations && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" /> Recommended Next Steps
                        </h4>
                        <ul className="grid gap-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 text-[10px] leading-tight">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <AlertDescription>
                    <strong>Medical Disclaimer:</strong> This automated scan is for informational use only. Skeletal anomalies must be diagnosed by a licensed medical practitioner.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {!isAnalyzing && !result && (
              <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[200px]">
                <ShieldAlert className="w-8 h-8 mb-4 opacity-10" />
                <p className="text-sm italic">Analysis results will appear here after upload.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
