'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Stethoscope, Zap, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { checkSymptoms, SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';

export function SymptomChecker() {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<SymptomCheckerOutput | null>(null);

  const handleCheck = async () => {
    if (!symptomsInput.trim()) return;
    setIsChecking(true);
    setResult(null);
    try {
      const res = await checkSymptoms({ symptoms: symptomsInput });
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
            Describe your symptoms for an immediate AI triage assessment. This helps determine the potential urgency of your condition.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <Card className="md:col-span-5 border-none shadow-sm h-fit bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" /> Describe Symptoms
              </CardTitle>
              <CardDescription>Be as specific as possible about onset and severity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">How are you feeling?</Label>
                <Textarea 
                  id="symptoms"
                  placeholder="e.g., I have a sharp pain in my lower back and a mild fever since yesterday." 
                  className="min-h-[150px] bg-background"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                />
              </div>
              <Button className="w-full gap-2 shadow-md" onClick={handleCheck} disabled={isChecking || !symptomsInput.trim()}>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Analyze Symptoms
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-7 space-y-6">
            {isChecking ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 animate-pulse text-center">
                <BrainCircuit className="w-12 h-12 text-primary/20 mb-4" />
                <p className="font-medium text-muted-foreground">Analyzing symptoms against medical patterns...</p>
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
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 text-muted-foreground text-center">
                <Sparkles className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm">Describe your symptoms in the input field to receive an AI assessment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
