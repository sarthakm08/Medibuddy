import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pill, Calendar, Info, ShieldAlert, Download, HeartPulse, ClipboardList, Activity, Stethoscope, ChevronRight } from 'lucide-react';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { analyzeMedicationInteractions, AnalyzeMedicationInteractionsOutput } from '@/ai/flows/analyze-medication-interactions';
import { PatientData } from './patient-profile';
import { ProgressTracker } from './progress-tracker';
import { DoctorScheduler } from './doctor-scheduler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisDashboardProps {
  insights: ExtractMedicalReportInsightsOutput;
  patientData: PatientData;
}

export function AnalysisDashboard({ insights, patientData }: AnalysisDashboardProps) {
  const [safetyAnalysis, setSafetyAnalysis] = useState<AnalyzeMedicationInteractionsOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
            Personalized Health Analysis
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive view of your medications, trends, and clinical summary.</p>
        </div>
        <Button onClick={handleExport} className="gap-2 shadow-lg hover:scale-105 transition-transform">
          <Download className="w-4 h-4" /> Export Health Summary
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl no-print bg-muted/30 p-1 mb-8">
          <TabsTrigger value="overview" className="gap-2 py-3 data-[state=active]:shadow-md">
            <ClipboardList className="w-4 h-4" /> Medical Overview
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2 py-3 data-[state=active]:shadow-md">
            <Activity className="w-4 h-4" /> Vital Progress
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2 py-3 data-[state=active]:shadow-md">
            <Stethoscope className="w-4 h-4" /> Appointments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
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

          {!safetyAnalysis?.hasWarnings && safetyAnalysis !== null && !isAnalyzing && (
            <Alert className="bg-green-50 border-green-200 text-green-800 shadow-sm">
              <ShieldAlert className="h-4 w-4 text-green-600" />
              <AlertTitle className="font-bold">Safety Check Passed</AlertTitle>
              <AlertDescription className="opacity-90">Based on your clinical profile, no immediate drug-allergy or condition interactions were detected.</AlertDescription>
            </Alert>
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
                <CardDescription>Extracted prescriptions and dosages from your medical report.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden shadow-sm bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold text-foreground">Medicine</TableHead>
                        <TableHead className="font-bold text-foreground">Dosage</TableHead>
                        <TableHead className="font-bold text-foreground">Frequency</TableHead>
                        <TableHead className="font-bold text-foreground">Route</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insights.medications.length > 0 ? (
                        insights.medications.map((med, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-primary">{med.name}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{med.route || 'Oral'}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">No medications found in report.</TableCell>
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
                  <CardTitle className="font-headline text-xl">Treatment Timelines</CardTitle>
                </div>
                <CardDescription>Conditions and treatment durations.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                  {insights.treatmentTimelines.length > 0 ? (
                    insights.treatmentTimelines.map((timeline, idx) => (
                      <div key={idx} className="relative pl-7 pb-8 border-l-2 border-accent/20 last:border-0 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-sm" />
                        <div className="space-y-1.5 p-4 bg-white rounded-xl shadow-sm border border-accent/5">
                          <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                            {timeline.condition}
                            <ChevronRight className="w-3 h-3 text-accent" />
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            {timeline.startDate || 'Start Date N/A'} 
                            <span className="text-accent/40 px-1">→</span>
                            {timeline.endDate || 'Ongoing'}
                          </p>
                          {timeline.notes && <p className="text-xs mt-3 italic leading-relaxed text-muted-foreground bg-muted/30 p-2 rounded-md border-l-2 border-accent/30">{timeline.notes}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground italic text-sm border-2 border-dashed rounded-xl">No timelines extracted.</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {insights.otherKeyInformation && (
            <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <CardTitle className="font-headline text-xl">Clinical Observations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground bg-white p-4 rounded-xl shadow-inner italic">
                  "{insights.otherKeyInformation}"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-6">
          <ProgressTracker />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6">
          <DoctorScheduler />
        </TabsContent>
      </Tabs>

      {/* Print-only Footer */}
      <div className="print-only hidden mt-12 pt-6 border-t border-dashed">
        <p className="text-[10px] text-center text-muted-foreground">
          Medibuddy Analysis Summary • Generated on {new Date().toLocaleDateString()} • Confidential Patient Data
        </p>
      </div>
    </div>
  );
}
