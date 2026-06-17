import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pill, Calendar, Info, ShieldAlert, Download, HeartPulse, ClipboardList } from 'lucide-react';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { analyzeMedicationInteractions, AnalyzeMedicationInteractionsOutput } from '@/ai/flows/analyze-medication-interactions';
import { PatientData } from './patient-profile';

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
      <div className="flex items-center justify-between no-print">
        <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-primary" />
          Health Dashboard
        </h2>
        <Button onClick={handleExport} className="gap-2 shadow-lg">
          <Download className="w-4 h-4" /> Export PDF Summary
        </Button>
      </div>

      {/* Safety Alerts */}
      {safetyAnalysis?.hasWarnings && (
        <div className="space-y-4">
          <h3 className="text-lg font-headline font-semibold flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" /> Safety Warnings Identified
          </h3>
          <div className="grid gap-3">
            {safetyAnalysis.warnings.map((warning, idx) => (
              <Alert key={idx} variant="destructive" className="bg-destructive/5 border-destructive/20">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="capitalize font-bold">{warning.type.replace('-', ' ')}: {warning.medication}</AlertTitle>
                <AlertDescription className="mt-1">{warning.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {!safetyAnalysis?.hasWarnings && safetyAnalysis !== null && !isAnalyzing && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <ShieldAlert className="h-4 w-4 text-green-600" />
          <AlertTitle className="font-bold">No Critical Safety Conflicts Found</AlertTitle>
          <AlertDescription>Based on your profile, no immediate interactions or allergy conflicts were detected.</AlertDescription>
        </Alert>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medication Table */}
        <Card className="lg:col-span-2 shadow-sm border-none bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              <CardTitle className="font-headline">Identified Medications</CardTitle>
            </div>
            <CardDescription>Extracted prescriptions and dosages from your medical report.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Medicine</TableHead>
                    <TableHead className="font-semibold">Dosage</TableHead>
                    <TableHead className="font-semibold">Frequency</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insights.medications.length > 0 ? (
                    insights.medications.map((med, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-primary">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase">{med.route || 'Oral'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No medications found in report.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {insights.medications.some(m => m.notes) && (
              <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/10">
                <h4 className="text-xs font-bold uppercase text-accent mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Medication Notes
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {insights.medications.filter(m => m.notes).map((m, i) => (
                    <li key={i}><span className="font-medium text-foreground">{m.name}:</span> {m.notes}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Treatment Timelines */}
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="font-headline">Treatment Timelines</CardTitle>
            </div>
            <CardDescription>Conditions and duration of treatment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {insights.treatmentTimelines.length > 0 ? (
                insights.treatmentTimelines.map((timeline, idx) => (
                  <div key={idx} className="relative pl-6 pb-6 border-l-2 border-primary/20 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{timeline.condition}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {timeline.startDate || 'Start Date N/A'} 
                        <span className="text-primary/40 px-1">→</span>
                        {timeline.endDate || 'Ongoing'}
                      </p>
                      {timeline.notes && <p className="text-xs mt-2 italic leading-relaxed">{timeline.notes}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic text-sm">No timelines extracted.</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Other Key Information */}
      {insights.otherKeyInformation && (
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <CardTitle className="font-headline">Clinical Observations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {insights.otherKeyInformation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Print-only Footer */}
      <div className="print-only hidden mt-12 pt-6 border-t border-dashed">
        <p className="text-[10px] text-center text-muted-foreground">
          Medibuddy Analysis Summary • Generated on {new Date().toLocaleDateString()} • Confidential Patient Data
        </p>
      </div>
    </div>
  );
}
