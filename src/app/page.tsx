
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
  Heart, 
  Stethoscope, 
  ChevronRight, 
  Scan, 
  UserCircle, 
  Moon, 
  Sun, 
  ClipboardCheck, 
  LayoutDashboard, 
  FileSearch,
  Activity,
  User,
  AlertCircle,
  Bell
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
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
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
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
    <div className="min-h-screen selection:bg-primary/20 bg-[#F7F8FA] dark:bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-card/80 backdrop-blur-md no-print shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('analyzer')}>
            <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform shadow-md shadow-primary/20">
              <ShieldPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">Medibuddy</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-primary hover:bg-primary/5 rounded-full"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold overflow-hidden p-1 pr-3 rounded-full h-10">
                  <div className="relative w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-primary/10">
                    {patientData.profilePhoto ? (
                      <Image src={patientData.profilePhoto} alt="Profile" fill className="object-cover" />
                    ) : (
                      <UserCircle className="w-6 h-6" />
                    )}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-2xl font-headline font-bold">User Information</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-6 pt-2">
                  <PatientProfile data={patientData} onChange={handleProfileChange} />
                </ScrollArea>
                <DialogFooter className="p-6 pt-2">
                  <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full sm:w-auto">Save & Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className="mb-12 no-print text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-6 border border-primary/20 uppercase tracking-widest">
            <ShieldPlus className="w-3 h-3" /> AI-Powered Health Companion
          </div>
          <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-foreground leading-[1.1]">
            Your Intelligent <span className="text-primary">Medical Assistant</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Understand your health data better. Upload medical reports or X-rays to get structured summaries, medication tracking, and interactive safety analysis.
          </p>
        </section>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-card p-1 rounded-2xl shadow-sm border h-16 mb-12 no-print">
              <TabsTrigger 
                value="analyzer" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all h-full"
              >
                <FileSearch className="w-4 h-4" /> Analyzer
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all h-full"
              >
                <Stethoscope className="w-4 h-4" /> Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="xray" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all h-full"
              >
                <Scan className="w-4 h-4" /> Xray
              </TabsTrigger>
              <TabsTrigger 
                value="symptoms" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all h-full"
              >
                <ClipboardCheck className="w-4 h-4" /> Symptoms
              </TabsTrigger>
              <TabsTrigger 
                value="reminders" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all h-full"
              >
                <Bell className="w-4 h-4" /> Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none space-y-8">
              <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden rounded-3xl">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-headline font-bold">Patient Dashboard</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20 px-3 py-1 bg-primary/5">
                      ACTIVE PROFILE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-[#F0F4FF] dark:bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Age</p>
                      <p className="text-2xl font-extrabold">{patientData.age || '**'} <span className="text-sm font-medium text-muted-foreground">yrs</span></p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#F0F4FF] dark:bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Weight</p>
                      <p className="text-2xl font-extrabold">{patientData.weight || '**'} <span className="text-sm font-medium text-muted-foreground">kg</span></p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#F0F4FF] dark:bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Sex</p>
                      <p className="text-2xl font-extrabold capitalize">{patientData.sex || '--'}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#F0F4FF] dark:bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Height</p>
                      <p className="text-2xl font-extrabold">{patientData.height || '**'} <span className="text-sm font-medium text-muted-foreground">cm</span></p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                      <Activity className="w-4 h-4 text-primary" /> Health Indicators
                    </h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-5 rounded-2xl border bg-white dark:bg-card/50">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-sm font-semibold">Allergies</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {patientData.allergies || 'None reported'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-5 rounded-2xl border bg-white dark:bg-card/50">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(40,85,190,0.5)]" />
                          <span className="text-sm font-semibold">Chronic Conditions</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {patientData.chronicConditions || 'None reported'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="w-full">
                <ReportUploader onInsightsExtracted={handleInsights} onXrayDetected={handleXrayDetected} />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              {insights && (
                <AnalysisDashboard insights={insights} patientData={patientData} />
              )}
            </TabsContent>

            <TabsContent value="xray" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              <XrayAnalyzer initialImage={prefilledXrayUri} />
            </TabsContent>

            <TabsContent value="symptoms" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              <SymptomChecker />
            </TabsContent>

            <TabsContent value="reminders" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              <MedicineReminder />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <RajuChatbot />

      <footer className="border-t py-20 bg-white dark:bg-card no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            <strong>Medical Disclaimer:</strong> Medibuddy is an AI-powered assistant designed for informational purposes. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
            <span>© 2024 Medibuddy Tech</span>
            <span className="hidden md:inline text-border">•</span>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <span className="hidden md:inline text-border">•</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
