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
  LayoutDashboard, 
  FileSearch,
  Activity,
  Bell,
  Heart,
  Baby,
  Ambulance,
  Calendar,
  ChevronDown,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  }, []);

  const handleInsights = (data: ExtractMedicalReportInsightsOutput) => {
    setInsights(data);
    if (data.medications.length > 0 || data.treatmentTimelines.length > 0) {
      setActiveTab('analysis');
      window.scrollTo({ top: document.getElementById('ai-portal')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleXrayDetected = (uri: string) => {
    setPrefilledXrayUri(uri);
    setActiveTab('xray');
    window.scrollTo({ top: document.getElementById('ai-portal')?.offsetTop || 0, behavior: 'smooth' });
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

  const heroImg = PlaceHolderImages.find(img => img.id === 'medical-hero');
  const emergencyImg = PlaceHolderImages.find(img => img.id === 'emergency-icon');
  const pediatricImg = PlaceHolderImages.find(img => img.id === 'pediatric-icon');
  const cardioImg = PlaceHolderImages.find(img => img.id === 'cardiology-icon');
  const diagImg = PlaceHolderImages.find(img => img.id === 'advanced-diagnostics');
  const surgeryImg = PlaceHolderImages.find(img => img.id === 'specialized-surgeries');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary/20">
      {/* 1. Header Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl glass rounded-full px-6 py-3 flex items-center justify-between shadow-lg no-print">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <ShieldPlus className="w-5 h-5 text-white" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-primary">CAREPLUS MEDICAL</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Services', 'Departments', 'Doctors', 'Contact'].map((item) => (
            <button key={item} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              {item}
            </button>
          ))}
        </nav>

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
          
          <Button className="bg-[#00B5B5] hover:bg-[#00A0A0] text-white font-bold rounded-full px-6 shadow-md transition-all">
            Book Appointment
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 px-6 md:px-12">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ''} 
            fill 
            className="object-cover opacity-30 blur-[2px]" 
            alt="Hero Background" 
            data-ai-hint={heroImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-6xl md:text-7xl font-headline font-bold text-foreground leading-tight">
            Your Health,<br />
            <span className="text-primary">Our Priority</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-lg">
            Compassionate Care for You and Your Family. Experience the next generation of healthcare powered by AI.
          </p>
          
          {/* Booking Bar */}
          <div className="glass p-6 rounded-3xl shadow-xl border border-white/40 flex flex-col md:flex-row gap-4 items-end mt-12 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</label>
              <Select>
                <SelectTrigger className="bg-white/50 border-none h-12 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency Care</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="cardio">Cardiology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Doctor</label>
              <Select>
                <SelectTrigger className="bg-white/50 border-none h-12 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smith">Dr. Sarah Smith</SelectItem>
                  <SelectItem value="doe">Dr. John Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" className="bg-white/50 border-none h-12 rounded-xl pl-10 focus:ring-primary" />
              </div>
            </div>
            <Button className="bg-[#00B5B5] hover:bg-[#00A0A0] text-white h-12 px-8 rounded-xl font-bold shadow-lg w-full md:w-auto">
              Book Now
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Departments Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-16">Our Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Emergency Care', icon: Ambulance, color: 'text-primary', img: emergencyImg },
            { title: 'Pediatric Department', icon: Baby, color: 'text-accent', img: pediatricImg },
            { title: 'Cardiology', icon: Heart, color: 'text-destructive', img: cardioImg },
          ].map((dept, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white">
              <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
                <div className={`p-6 rounded-3xl bg-muted/30 group-hover:scale-110 transition-transform`}>
                  <dept.icon className={`w-12 h-12 ${dept.color}`} />
                </div>
                <h3 className="text-xl font-bold">{dept.title}</h3>
                <Button variant="ghost" className="text-primary gap-2 font-bold p-0 hover:bg-transparent">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Featured Services Section */}
      <section className="py-24 bg-[#EEF2F6]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-headline font-bold text-center mb-16">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <div className="relative h-64">
                <Image 
                  src={diagImg?.imageUrl || ''} 
                  fill 
                  className="object-cover" 
                  alt="Diagnostics" 
                  data-ai-hint={diagImg?.imageHint} 
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Advanced Diagnostics</CardTitle>
                <CardDescription>Advanced diagnostics with modern imaging machines.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <div className="relative h-64">
                <Image 
                  src={surgeryImg?.imageUrl || ''} 
                  fill 
                  className="object-cover" 
                  alt="Surgery" 
                  data-ai-hint={surgeryImg?.imageHint} 
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Specialized Surgeries</CardTitle>
                <CardDescription>Specialized surgeries with certified surgeons and medical equipment.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <div className="relative h-64">
                <Image 
                  src={heroImg?.imageUrl || ''} 
                  fill 
                  className="object-cover" 
                  alt="Primary Care" 
                  data-ai-hint="medical checkup" 
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Primary Care</CardTitle>
                <CardDescription>Maintaining long-term health with personalized checkups.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Intelligence Portal (AI Functional Tabs) */}
      <section id="ai-portal" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Intelligence Portal
          </div>
          <h2 className="text-4xl font-headline font-bold">Medibuddy AI Workspace</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access your intelligent health tools below. Analyze reports, check symptoms, and track medications.
          </p>
        </div>

        <main>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white p-1.5 rounded-3xl shadow-md border h-20 mb-12 no-print overflow-hidden">
              <TabsTrigger value="analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl transition-all h-full text-base">
                <FileSearch className="w-5 h-5" /> Analyzer
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl transition-all h-full text-base">
                <Activity className="w-5 h-5" /> Health Analysis
              </TabsTrigger>
              <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl transition-all h-full text-base">
                <Scan className="w-5 h-5" /> X-ray Analyzer
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl transition-all h-full text-base">
                <Stethoscope className="w-5 h-5" /> Symptom Checker
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-2xl transition-all h-full text-base">
                <Bell className="w-5 h-5" /> Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-12 space-y-8">
                  <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-primary/10 rounded-xl">
                            <LayoutDashboard className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle className="text-2xl font-headline font-bold">Patient Dashboard</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold tracking-widest text-primary border-primary/20 px-3 py-1 bg-primary/5 uppercase">
                          Active Profile
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-primary/5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Age</p>
                          <p className="text-2xl font-extrabold">{patientData.age || '--'} <span className="text-sm font-medium text-muted-foreground">yrs</span></p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-primary/5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Weight</p>
                          <p className="text-2xl font-extrabold">{patientData.weight || '--'} <span className="text-sm font-medium text-muted-foreground">kg</span></p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-primary/5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Sex</p>
                          <p className="text-2xl font-extrabold capitalize">{patientData.sex || '--'}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-primary/5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Height</p>
                          <p className="text-2xl font-extrabold">{patientData.height || '--'} <span className="text-sm font-medium text-muted-foreground">cm</span></p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-5 rounded-2xl border bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <span className="text-sm font-semibold">Known Allergies</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{patientData.allergies || 'None reported'}</span>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl border bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                            <span className="text-sm font-semibold">Chronic Conditions</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{patientData.chronicConditions || 'None reported'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
      </section>
      
      <RajuChatbot />
      
      <footer className="py-20 bg-primary text-white text-center space-y-8 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl">
                <ShieldPlus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-headline text-2xl font-bold">CAREPLUS MEDICAL</h2>
            </div>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Use', 'Accessibility'].map(item => (
                <button key={item} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] opacity-50 max-w-3xl mx-auto leading-relaxed">
            <strong>Medical Disclaimer:</strong> Medibuddy is an AI-powered assistant designed for informational purposes. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
          </p>
          <div className="pt-12 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <span>&copy; 2024 CAREPLUS MEDICAL AI</span>
            <span className="w-1 h-1 rounded-full bg-white" />
            <span>Patient-First Healthcare</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
