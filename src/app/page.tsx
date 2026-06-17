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
  LayoutDashboard, 
  FileSearch,
  Activity,
  Bell,
  Sparkles,
  Settings
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      // Sanitize undefined for Firestore
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <ShieldPlus className="w-6 h-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tight text-primary">MEDIBUDDY</h1>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {patientData.profilePhoto ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                    <Image src={patientData.profilePhoto} fill className="object-cover" alt="Profile" />
                  </div>
                ) : (
                  <UserCircle className="w-6 h-6 text-primary" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-headline font-bold">Patient Profile Settings</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-6 pt-2">
                <PatientProfile data={patientData} onChange={handleProfileChange} />
              </ScrollArea>
              <DialogFooter className="p-6 pt-2">
                <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
          {/* Welcome Banner */}
          <section className="space-y-2">
            <h2 className="text-3xl font-headline font-bold text-slate-900">
              Welcome back, {patientData.name || 'Patient'}
            </h2>
            <p className="text-muted-foreground">Manage your medical reports and health parameters in one intelligent workspace.</p>
          </section>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-xl shadow-sm border mb-8 no-print h-14">
              <TabsTrigger value="analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
                <FileSearch className="w-4 h-4" /> Analyzer
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
                <Activity className="w-4 h-4" /> Health Analysis
              </TabsTrigger>
              <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
                <Scan className="w-4 h-4" /> X-ray Analyzer
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
                <Stethoscope className="w-4 h-4" /> Symptom Checker
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all h-full">
                <Bell className="w-4 h-4" /> Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Patient Overview */}
                <div className="md:col-span-4 space-y-6">
                  <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <LayoutDashboard className="w-5 h-5 text-primary" />
                          Dashboard
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20">Active Profile</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Age</p>
                          <p className="text-xl font-bold">{patientData.age || '--'} <span className="text-sm font-normal text-muted-foreground">yrs</span></p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight</p>
                          <p className="text-xl font-bold">{patientData.weight || '--'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sex</p>
                          <p className="text-xl font-bold capitalize">{patientData.sex || '--'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Height</p>
                          <p className="text-xl font-bold">{patientData.height || '--'} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                          <span>Allergies: <span className="font-normal text-muted-foreground">{patientData.allergies || 'None'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>Conditions: <span className="font-normal text-muted-foreground">{patientData.chronicConditions || 'None'}</span></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">Pro Tip</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload your latest blood panel or diagnostic report to see an AI-powered medication interaction check.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Uploader */}
                <div className="md:col-span-8">
                  <ReportUploader onInsightsExtracted={handleInsights} onXrayDetected={handleXrayDetected} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              {insights && <AnalysisDashboard insights={insights} patientData={patientData} />}
            </TabsContent>

            <TabsContent value="xray">
              <XrayAnalyzer initialImage={prefilledXrayUri} />
            </TabsContent>

            <TabsContent value="symptoms">
              <SymptomChecker />
            </TabsContent>

            <TabsContent value="reminders">
              <MedicineReminder />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <RajuChatbot />

      <footer className="mt-20 py-8 border-t text-center text-xs text-muted-foreground no-print">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <p><strong>Medical Disclaimer:</strong> Medibuddy is an AI assistant for informational purposes only. It is not a substitute for professional medical advice.</p>
          <p>&copy; 2024 Medibuddy AI Assistant • Patient-First Healthcare</p>
        </div>
      </footer>
    </div>
  );
}
