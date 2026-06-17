'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PatientProfile, PatientData } from '@/components/patient-profile';
import { ReportUploader } from '@/components/report-uploader';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { XrayAnalyzer } from '@/components/xray-analyzer';
import { SymptomChecker } from '@/components/symptom-checker';
import { MedicineReminder } from '@/components/medicine-reminder';
import { RajuChatbot } from '@/components/raju-chatbot';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { 
  ShieldPlus, 
  Stethoscope, 
  Scan, 
  UserCircle, 
  Moon, 
  Sun, 
  ClipboardCheck, 
  LayoutDashboard, 
  FileSearch,
  Activity,
  Bell
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const INITIAL_PATIENT_DATA: PatientData = {
  name: '',
  age: '',
  phoneNumber: '',
  sex: '',
  weight: '',
  height: '',
  address: '',
  allergies: '',
  chronicConditions: '',
  accidentHistory: '',
  profilePhoto: null
};

export default function MedibuddyHome() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userId = user?.uid || 'demo-user';
  const profileRef = useMemo(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
  const { data: remoteProfile } = useDoc(profileRef);

  const [patientData, setPatientData] = useState<PatientData>(INITIAL_PATIENT_DATA);

  useEffect(() => {
    if (remoteProfile) {
      setPatientData(prev => ({ ...prev, ...remoteProfile }));
    }
  }, [remoteProfile]);

  const [insights, setInsights] = useState<ExtractMedicalReportInsightsOutput | null>(null);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [prefilledXrayUri, setPrefilledXrayUri] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleInsights = (data: ExtractMedicalReportInsightsOutput) => {
    setInsights(data);
    if (data.medications.length > 0 || data.treatmentTimelines.length > 0) {
      setActiveTab('analysis');
    }
  };

  const handleXrayDetected = (uri: string) => {
    setPrefilledXrayUri(uri);
    setActiveTab('xray');
  };

  const handleTabChange = (value: string) => {
    if (value === 'analysis' && !insights) {
      toast({
        title: "Medical Report Required",
        description: "Kindly upload a medical report first.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(value);
  };

  const handleProfileChange = (updatedData: PatientData) => {
    setPatientData(updatedData);
    if (profileRef) {
      const dataToSave = { ...updatedData };
      // Sanitize undefined values to null for Firestore
      Object.keys(dataToSave).forEach(key => {
        const k = key as keyof PatientData;
        if (dataToSave[k] === undefined) {
          dataToSave[k] = null as any;
        }
      });

      setDoc(profileRef, dataToSave, { merge: true })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: profileRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 selection:bg-primary/20">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <ShieldPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Medibuddy</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </Button>

          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold rounded-full">
                <UserCircle className="w-5 h-5" />
                <span>Profile</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-headline font-bold">Patient Information</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-6 pt-2">
                <PatientProfile data={patientData} onChange={handleProfileChange} />
              </ScrollArea>
              <DialogFooter className="p-6 pt-2">
                <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full">Save and Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-card p-1 rounded-2xl shadow-sm border h-16 mb-8 no-print">
            <TabsTrigger value="analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
              <FileSearch className="w-4 h-4" /> Analyzer
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
              <Activity className="w-4 h-4" /> Health Analysis
            </TabsTrigger>
            <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
              <Scan className="w-4 h-4" /> X-ray Analyzer
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
              <Stethoscope className="w-4 h-4" /> Symptom Checker
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
              <Bell className="w-4 h-4" /> Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-12 space-y-8">
                {/* Patient Summary Dashboard */}
                <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <LayoutDashboard className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-headline font-bold">Patient Dashboard</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold tracking-widest text-primary border-primary/20 px-3 py-1 bg-primary/5">
                        ACTIVE PROFILE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Current Age</p>
                        <p className="text-2xl font-extrabold">{patientData.age || '--'} <span className="text-sm font-medium text-muted-foreground">yrs</span></p>
                      </div>
                      <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Weight</p>
                        <p className="text-2xl font-extrabold">{patientData.weight || '--'} <span className="text-sm font-medium text-muted-foreground">kg</span></p>
                      </div>
                      <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Sex</p>
                        <p className="text-2xl font-extrabold capitalize">{patientData.sex || '--'}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Height</p>
                        <p className="text-2xl font-extrabold">{patientData.height || '--'} <span className="text-sm font-medium text-muted-foreground">cm</span></p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-5 rounded-2xl border bg-white dark:bg-background/20">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-sm font-semibold">Known Allergies</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{patientData.allergies || 'None reported'}</span>
                      </div>
                      <div className="flex items-center justify-between p-5 rounded-2xl border bg-white dark:bg-background/20">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                          <span className="text-sm font-semibold">Chronic Conditions</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{patientData.chronicConditions || 'None reported'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Uploader */}
                <ReportUploader onInsightsExtracted={handleInsights} onXrayDetected={handleXrayDetected} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {insights && <AnalysisDashboard insights={insights} patientData={patientData} />}
          </TabsContent>

          <TabsContent value="xray" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <XrayAnalyzer initialImage={prefilledXrayUri} />
          </TabsContent>

          <TabsContent value="symptoms" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SymptomChecker />
          </TabsContent>

          <TabsContent value="reminders" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MedicineReminder />
          </TabsContent>
        </Tabs>
      </main>
      
      <RajuChatbot />
      
      <footer className="mt-20 text-center space-y-4 no-print">
        <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
          <strong>Medical Disclaimer:</strong> Medibuddy is an AI-powered assistant designed for informational purposes. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>&copy; 2024 Medibuddy AI</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>Patient-First Healthcare</span>
        </div>
      </footer>
    </div>
  );
}
