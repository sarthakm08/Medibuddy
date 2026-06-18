
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
  Phone
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
            <p className="text-muted-foreground font-medium">Manage your medical reports and health parameters in one intelligent workspace.</p>
          </section>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass p-1 rounded-2xl shadow-2xl border-white/10 mb-8 no-print h-14">
              <TabsTrigger value="analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <FileSearch className="w-4 h-4" /> Analyzer
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Activity className="w-4 h-4" /> Health Analysis
              </TabsTrigger>
              <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Scan className="w-4 h-4" /> X-ray Analyzer
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Stethoscope className="w-4 h-4" /> Symptom Checker
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                <Bell className="w-4 h-4" /> Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Patient Overview */}
                <div className="md:col-span-4 space-y-6">
                  <Card className="glass-morphism border-none">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20 bg-white/5">Active Profile</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Age</p>
                          <p className="text-xl font-bold text-white">{patientData.age || '--'} <span className="text-sm font-normal text-muted-foreground">yrs</span></p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blood Group</p>
                          <p className="text-xl font-bold text-white flex items-center gap-1">
                            <Heart className="w-4 h-4 text-destructive" /> {patientData.bloodGroup || '--'}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight</p>
                          <p className="text-xl font-bold text-white">{patientData.weight || '--'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sex</p>
                          <p className="text-xl font-bold capitalize text-white">{patientData.sex || '--'}</p>
                        </div>
                      </div>

                      {patientData.nomineeName && (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Emergency Nominee
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-bold text-white">{patientData.nomineeName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" /> {patientData.nomineePhoneNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold p-2 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-destructive shadow-sm" />
                          <span className="text-white">Allergies: <span className="font-normal text-muted-foreground">{patientData.allergies || 'None'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold p-2 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-secondary shadow-sm" />
                          <span className="text-white">Conditions: <span className="font-normal text-muted-foreground">{patientData.chronicConditions || 'None'}</span></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/10 shadow-inner">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white">Pro Tip</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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

            <TabsContent value="analysis" className="animate-in fade-in duration-500">
              {insights && <AnalysisDashboard insights={insights} patientData={patientData} />}
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
          <p className="font-medium text-white/80"><strong>Medical Disclaimer:</strong> Medibuddy is an AI assistant for informational purposes only. It is not a substitute for professional medical advice.</p>
          <p className="opacity-70">&copy; 2024 Medibuddy AI Assistant • Patient-First Healthcare</p>
        </div>
      </footer>
    </div>
  );
}
