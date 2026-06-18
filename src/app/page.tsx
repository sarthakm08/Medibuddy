'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PatientProfile, PatientData } from '@/components/patient-profile';
import { ReportUploader } from '@/components/report-uploader';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { XrayAnalyzer } from '@/components/xray-analyzer';
import { SymptomChecker } from '@/components/symptom-checker';
import { MedicineReminder } from '@/components/medicine-reminder';
import { RajuChatbot } from '@/components/raju-chatbot';
import { AnimatedBackground } from '@/components/animated-background';
import { FallDetection } from '@/components/fall-detection';
import { DashboardView } from '@/components/dashboard-view';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { 
  ShieldPlus, 
  Stethoscope, 
  Scan, 
  UserCircle, 
  LayoutDashboard, 
  FileSearch,
  Activity,
  Bell,
  Sparkles,
  Heart,
  ShieldAlert,
  Phone,
  ArrowUpCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';

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
  profilePhoto: null,
  bloodGroup: '',
  nomineeName: '',
  nomineePhoneNumber: ''
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [prefilledXrayUri, setPrefilledXrayUri] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInsights = (data: ExtractMedicalReportInsightsOutput) => {
    setInsights(data);
    toast({
      title: "Analysis Complete",
      description: "We've extracted insights from your medical report below.",
    });
  };

  const handleXrayDetected = (uri: string) => {
    setPrefilledXrayUri(uri);
    setActiveTab('xray');
  };

  const handleTabChange = (value: string) => {
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
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <FallDetection />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 no-print border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldPlus className="w-6 h-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tight text-white">MEDIBUDDY</h1>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 transition-colors">
                {patientData.profilePhoto ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm">
                    <Image src={patientData.profilePhoto} fill className="object-cover" alt="Profile" />
                  </div>
                ) : (
                  <UserCircle className="w-6 h-6 text-white" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 glass-dark border-white/10">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-headline font-bold text-white">Patient Profile Settings</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-6 pt-2">
                <PatientProfile data={patientData} onChange={handleProfileChange} />
              </ScrollArea>
              <DialogFooter className="p-6 pt-2">
                <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full bg-primary text-white hover:bg-primary/90">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="flex flex-col gap-8">
          {/* Welcome Banner */}
          <section className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-3xl font-headline font-bold text-white drop-shadow-md">
              Welcome back, {patientData.name || 'Patient'}
            </h2>
            <p className="text-muted-foreground font-medium">Your intelligent health companion and emergency workspace.</p>
          </section>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass p-1 rounded-2xl shadow-2xl border-white/10 mb-8 no-print h-14">
              <TabsTrigger value="dashboard" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="report-analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <FileSearch className="w-4 h-4" /> AI Report Analyzer
              </TabsTrigger>
              <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Scan className="w-4 h-4" /> X-ray Scanner
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Stethoscope className="w-4 h-4" /> AI Symptom Checker
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Bell className="w-4 h-4" /> Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="animate-in fade-in duration-500">
              <DashboardView patientData={patientData} insights={insights} />
            </TabsContent>

            <TabsContent value="report-analyzer" className="animate-in fade-in duration-500 space-y-8">
              <div className="max-w-4xl mx-auto">
                <ReportUploader onInsightsExtracted={handleInsights} onXrayDetected={handleXrayDetected} />
              </div>
              {insights && (
                <div className="animate-in slide-in-from-bottom-4 duration-700">
                  <AnalysisDashboard insights={insights} patientData={patientData} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="xray" className="animate-in fade-in duration-500">
              <XrayAnalyzer initialImage={prefilledXrayUri} />
            </TabsContent>

            <TabsContent value="symptoms" className="animate-in fade-in duration-500">
              <SymptomChecker />
            </TabsContent>

            <TabsContent value="reminders" className="animate-in fade-in duration-500">
              <MedicineReminder />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <RajuChatbot />

      <footer className="mt-20 py-8 glass border-t-white/10 text-center text-xs text-muted-foreground no-print relative z-10">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <p className="font-medium text-white/80"><strong>Clinical Disclaimer:</strong> Medibuddy is an AI clinical assistant. Fall detection and SOS features require active internet and sensor permissions.</p>
          <p className="opacity-70">&copy; 2024 Medibuddy AI Assistant • Patient-First Healthcare</p>
        </div>
      </footer>
    </div>
  );
}
