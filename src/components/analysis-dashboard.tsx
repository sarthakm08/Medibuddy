import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pill, Calendar, Info, ShieldAlert, Download, HeartPulse, ClipboardList, Activity, Stethoscope, ChevronRight, Apple, Loader2, X, AlertCircle } from 'lucide-react';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { analyzeMedicationInteractions, AnalyzeMedicationInteractionsOutput } from '@/ai/flows/analyze-medication-interactions';
import { suggestDietPlan, DietPlanOutput } from '@/ai/flows/suggest-diet-plan-flow';
import { PatientData } from './patient-profile';
import { ProgressTracker } from './progress-tracker';
import { DoctorScheduler } from './doctor-scheduler';
import { MedicineReminder } from './medicine-reminder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AnalysisDashboardProps {
  insights: ExtractMedicalReportInsightsOutput;
  patientData: PatientData;
}

export function AnalysisDashboard({ insights, patientData }: AnalysisDashboardProps) {
  const [safetyAnalysis, setSafetyAnalysis] = useState<AnalyzeMedicationInteractionsOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlanOutput | null>(null);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [showDietDialog, setShowDietDialog] = useState(false);

  useEffect(() => {
    async function performSafetyCheck() {
      setIsAnalyzing(true);
      try {
        const medications = insights.medications.map(m => m.name);
        const allergies = patientData.allergies.split(',').map(s => s.trim()).filter(Boolean);
        const healthParameters = patientData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean);
        
        const result = await analyzeMedicationInteractions({
          medications,
          allergies,
          healthParameters
        });
        setSafetyAnalysis(result);
      } catch (error) {
        console.error('Safety check failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    performSafetyCheck();
  }, [insights, patientData]);

  const handleSuggestDiet = async () => {
    setIsGeneratingDiet(true);
    setShowDietDialog(true);
    try {
      const plan = await suggestDietPlan({
        conditions: patientData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        medications: insights.medications.map(m => m.name),
        weight: patientData.weight,
        height: patientData.height
      });
      setDietPlan(plan);
    } catch (error) {
      console.error('Diet plan generation failed:', error);
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2 text-primary">
            <HeartPulse className="w-6 h-6 animate-pulse text-destructive" />
            Health Analysis
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Clinical overview and safety assessment.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSuggestDiet} className="gap-2 border-primary/20 hover:bg-primary/5 text-primary shadow-sm transition-all">
            <Apple className="w-4 h-4" /> Suggest Diet Plan
          </Button>
          <Button onClick={handleExport} className="gap-2 shadow-lg hover:scale-105 transition-all">
            <Download className="w-4 h-4" /> Export Summary
          </Button>
        </div>
      </div>

      {/* AI Summary Message */}
      {insights.message && (
        <Alert className="bg-primary/5 border-primary/20 animate-in fade-in duration-700">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-bold">Assistant Summary</AlertTitle>
          <AlertDescription className="text-sm">
            {insights.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl no-print bg-muted/30 p-1 mb-8 h-auto">
          <TabsTrigger value="overview" className="gap-2 py-3 data-[state=active]:shadow-md">
            <ClipboardList className="w-4 h-4" /> Medical
          </TabsTrigger>
          <TabsTrigger value="reminders" className="gap-2 py-3 data-[state=active]:shadow-md">
            <Pill className="w-4 h-4" /> Reminders
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2 py-3 data-[state=active]:shadow-md">
            <Activity className="w-4 h-4" /> Vitals
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2 py-3 data-[state=active]:shadow-md">
            <Stethoscope className="w-4 h-4" /> Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* Safety Alerts */}
          {isAnalyzing ? (
            <div className="p-8 border rounded-xl bg-muted/10 animate-pulse flex items-center justify-center gap-3">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <span className="font-medium">Performing Safety Analysis...</span>
            </div>
          ) : safetyAnalysis?.hasWarnings && (
            <div className="space-y-4">
              <h3 className="text-lg font-headline font-semibold flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-5 h-5" /> Safety Warnings Identified
              </h3>
              <div className="grid gap-3">
                {safetyAnalysis.warnings.map((warning, idx) => (
                  <Alert key={idx} variant="destructive" className="bg-destructive/5 border-destructive/20 shadow-sm">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle className="capitalize font-bold flex items-center gap-2">
                      {warning.type.replace('-', ' ')}: {warning.medication}
                    </AlertTitle>
                    <AlertDescription className="mt-1 opacity-90">{warning.description}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Identified Medications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden shadow-sm bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold text-foreground">Medicine</TableHead>
                        <TableHead className="font-bold text-foreground">Dosage</TableHead>
                        <TableHead className="font-bold text-foreground">Frequency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insights.medications.length > 0 ? (
                        insights.medications.map((med, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-semibold text-primary">{med.name}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">No medications found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="font-headline text-xl">Timelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {insights.treatmentTimelines.length > 0 ? (
                    insights.treatmentTimelines.map((timeline, idx) => (
                      <div key={idx} className="relative pl-7 pb-8 border-l-2 border-accent/20 last:border-0 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />
                        <div className="space-y-1.5 p-4 bg-white rounded-xl shadow-sm border border-accent/5">
                          <h4 className="text-sm font-bold">{timeline.condition}</h4>
                          <p className="text-xs text-muted-foreground">{timeline.startDate} → {timeline.endDate || 'Ongoing'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground italic">No timelines found.</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <MedicineReminder />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressTracker />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <DoctorScheduler />
        </TabsContent>
      </Tabs>

      {/* Diet Plan Dialog */}
      <Dialog open={showDietDialog} onOpenChange={setShowDietDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <Apple className="w-6 h-6 text-green-500" />
              {isGeneratingDiet ? 'Generating Nutrition Strategy...' : dietPlan?.title}
            </DialogTitle>
            <DialogDescription>
              Tailored dietary recommendations for faster clinical recovery.
            </DialogDescription>
          </DialogHeader>
          
          {isGeneratingDiet ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-medium animate-pulse">Analyzing clinical interactions and nutrient requirements...</p>
            </div>
          ) : dietPlan && (
            <div className="space-y-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-green-700 uppercase tracking-wider">Recommended Foods</h4>
                  <ul className="space-y-2">
                    {dietPlan.recommendedFoods.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-destructive uppercase tracking-wider">Foods to Avoid</h4>
                  <ul className="space-y-2">
                    {dietPlan.foodsToAvoid.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-destructive mt-1">✕</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider">Daily Meal Schedule</h4>
                <div className="grid gap-3">
                  {dietPlan.dailySchedule.map((s, i) => (
                    <div key={i} className="p-3 bg-muted/20 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-bold text-xs min-w-[100px] text-primary">{s.meal}</span>
                      <span className="text-sm text-muted-foreground">{s.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold">Recovery Tip</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">
                  {dietPlan.recoveryTips}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
