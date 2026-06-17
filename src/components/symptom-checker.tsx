'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Stethoscope, Zap, ShieldAlert, Sparkles, BrainCircuit, Camera, X, Image as ImageIcon } from 'lucide-react';
import { checkSymptoms, SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import Image from 'next/image';

export function SymptomChecker() {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<SymptomCheckerOutput | null>(null);
  
  // Image states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const uri = event.target?.result as string;
      setImagePreview(uri);
      setImageDataUri(uri);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageDataUri(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCheck = async () => {
    if (!symptomsInput.trim() && !imageDataUri) return;
    setIsChecking(true);
    setResult(null);
    try {
      const res = await checkSymptoms({ 
        symptoms: symptomsInput || "Symptom check requested based on photo.",
        photoDataUri: imageDataUri || undefined 
      });
      setResult(res);
    } catch (e) {
      console.error('Symptom check failed:', e);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary">AI Symptom Checker</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Describe your symptoms and optionally upload a photo for an immediate AI triage assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <Card className="md:col-span-5 border-none shadow-sm h-fit bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" /> Input Details
              </CardTitle>
              <CardDescription>Upload a photo or describe how you feel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">How are you feeling?</Label>
                <Textarea 
                  id="symptoms"
                  placeholder="e.g., Red rash on left arm, slightly itchy." 
                  className="min-h-[120px] bg-background"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Symptom Photo (Optional)</Label>
                {imagePreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                    <Image 
                      src={imagePreview} 
                      fill 
                      className="object-cover" 
                      alt="Symptom preview" 
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-background/40 cursor-pointer hover:bg-background/60 transition-all group"
                  >
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-2">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Upload image (Rash, etc.)</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                )}
              </div>

              <Button className="w-full gap-2 shadow-md" onClick={handleCheck} disabled={isChecking || (!symptomsInput.trim() && !imageDataUri)}>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Analyze Symptoms
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-7 space-y-6">
            {isChecking ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 animate-pulse text-center">
                <BrainCircuit className="w-12 h-12 text-primary/20 mb-4" />
                <p className="font-medium text-muted-foreground">AI is examining your input and photo...</p>
              </div>
            ) : result ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <Alert variant={result.urgencyLevel === 'emergency' ? 'destructive' : 'default'} className="bg-white border-2 shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <AlertTitle className="font-bold flex items-center justify-between">
                    Urgency Level: {result.urgencyLevel.toUpperCase()}
                    <Badge variant={result.urgencyLevel === 'emergency' ? 'destructive' : 'secondary'}>
                      {result.urgencyLevel}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-base leading-relaxed">
                    {result.guidance}
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">Possible Conditions</h4>
                  {result.possibleConditions.map((cond, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
                      <div className={`h-1 w-full ${cond.likelihood === 'high' ? 'bg-orange-500' : 'bg-primary'}`} />
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-lg">{cond.name}</h4>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {cond.likelihood} Likelihood
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cond.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-[10px] text-yellow-800 leading-tight italic">
                    <strong>Medical Disclaimer:</strong> {result.disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 text-muted-foreground text-center">
                <Sparkles className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm">Upload a photo of the symptom (like a rash or injury) or describe your symptoms to start analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
