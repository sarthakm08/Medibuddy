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
  Bell,
  HeartPulse,
  Ambulance,
  Baby,
  CalendarDays,
  ChevronRight,
  ArrowRight,
  Stethoscope as StethoscopeIcon
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
import Image from 'next/image';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
      const element = document.getElementById('patient-intelligence');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleXrayDetected = (uri: string) => {
    setPrefilledXrayUri(uri);
    setActiveTab('xray');
    const element = document.getElementById('patient-intelligence');
    element?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="min-h-screen selection:bg-primary/20 bg-background text-foreground scroll-smooth">
      {/* Navigation - Glassmorphism style */}
      <header className="fixed top-0 z-50 w-full px-4 md:px-8 py-4 no-print">
        <div className="container mx-auto flex items-center justify-between glass px-6 py-3 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg shadow-sm">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-primary">CAREPLUS MEDICAL</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#" className="text-primary hover:text-primary transition-colors">Home</a>
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#departments" className="hover:text-primary transition-colors">Departments</a>
            <a href="#patient-intelligence" className="hover:text-primary transition-colors">AI Assistant</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hidden sm:flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold rounded-full h-10 px-4">
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
                  <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full">Save Details</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button className="rounded-full font-bold shadow-md">Book Appointment</Button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(img => img.id === 'medical-hero')?.imageUrl || ''} 
              alt="Healthcare background" 
              fill 
              className="object-cover opacity-100"
              data-ai-hint="doctor patient"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10 grid lg:grid-cols-2 items-center gap-12">
            <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Your Health,<br /><span className="text-primary">Our Priority</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Experience world-class healthcare with compassionate professionals and cutting-edge medical intelligence at your fingertips.
              </p>
              
              {/* Floating Booking Bar */}
              <div className="glass p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-end gap-4">
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</label>
                  <Select>
                    <SelectTrigger className="bg-white/50 h-11 border-none">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Care</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatric">Pediatrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Doctor</label>
                  <Select>
                    <SelectTrigger className="bg-white/50 h-11 border-none">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-smith">Dr. Sarah Smith</SelectItem>
                      <SelectItem value="dr-doe">Dr. John Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</label>
                  <div className="relative">
                    <Input type="date" className="bg-white/50 h-11 border-none pr-10" />
                    <CalendarDays className="absolute right-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <Button className="h-11 px-8 rounded-xl font-bold shadow-lg bg-primary hover:bg-primary/90 w-full md:w-auto">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section id="departments" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center mb-16">
            <h3 className="font-headline text-3xl font-bold mb-4">Our Departments</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">Providing specialized care across multiple disciplines with advanced facilities.</p>
          </div>
          
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            {[
              { title: "Emergency Care", icon: Ambulance, imgId: "emergency-icon" },
              { title: "Pediatric Department", icon: Baby, imgId: "pediatric-icon" },
              { title: "Cardiology", icon: HeartPulse, imgId: "cardiology-icon" }
            ].map((dept, idx) => (
              <Card key={idx} className="group hover:shadow-2xl transition-all duration-500 border-none overflow-hidden rounded-3xl text-center">
                <CardContent className="p-12 space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:rotate-12 transition-all">
                    <dept.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-headline text-xl font-bold">{dept.title}</h4>
                  <Button variant="ghost" className="gap-2 text-primary font-bold">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Services Section */}
        <section id="services" className="py-24">
          <div className="container mx-auto px-4 text-center mb-16">
            <h3 className="font-headline text-3xl font-bold mb-4">Featured Services</h3>
          </div>
          
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
            {[
              { 
                title: "Advanced Diagnostics", 
                desc: "Advanced diagnostics with high-resolution modern imaging machines.",
                imgId: "advanced-diagnostics"
              },
              { 
                title: "Specialized Surgeries", 
                desc: "Expert surgical procedures using minimal-access techniques and robotic assistance.",
                imgId: "specialized-surgeries"
              }
            ].map((service, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative h-64 w-full rounded-3xl overflow-hidden mb-6 shadow-md">
                  <Image 
                    src={PlaceHolderImages.find(img => img.id === service.imgId)?.imageUrl || ''} 
                    alt={service.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    data-ai-hint={service.title}
                  />
                </div>
                <h4 className="font-headline text-2xl font-bold mb-2">{service.title}</h4>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  View Service Details <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Intelligent Medical Assistant Workspace */}
        <section id="patient-intelligence" className="py-24 bg-slate-50 border-t">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-[10px] px-3 py-1 font-bold border-primary/20 text-primary tracking-widest uppercase bg-primary/5">
                Powered by GenAI
              </Badge>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">Patient Intelligence Portal</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Securely upload reports, track medications, and get instant AI-powered health insights.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-2xl shadow-sm border h-16 mb-12">
                <TabsTrigger value="analyzer" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                  <FileSearch className="w-4 h-4" /> Analyzer
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                  <StethoscopeIcon className="w-4 h-4" /> Analysis
                </TabsTrigger>
                <TabsTrigger value="xray" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                  <Scan className="w-4 h-4" /> Xray
                </TabsTrigger>
                <TabsTrigger value="symptoms" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                  <ClipboardCheck className="w-4 h-4" /> Symptoms
                </TabsTrigger>
                <TabsTrigger value="reminders" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all h-full">
                  <Bell className="w-4 h-4" /> Reminders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analyzer" className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
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
                      {[
                        { label: "Age", value: patientData.age, unit: "yrs" },
                        { label: "Weight", value: patientData.weight, unit: "kg" },
                        { label: "Sex", value: patientData.sex, unit: "" },
                        { label: "Height", value: patientData.height, unit: "cm" }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-secondary/50 border border-primary/5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className="text-2xl font-extrabold capitalize">
                            {stat.value || '--'} <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-5 rounded-2xl border bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-sm font-semibold">Allergies</span>
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

                <div className="w-full">
                  <ReportUploader onInsightsExtracted={handleInsights} onXrayDetected={handleXrayDetected} />
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
          </div>
        </section>
      </main>

      <RajuChatbot />

      <footer className="border-t py-20 bg-white no-print">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary rounded-lg">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-xl text-primary">CAREPLUS MEDICAL</span>
          </div>
          <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            <strong>Medical Disclaimer:</strong> Medibuddy is an AI-powered assistant designed for informational purposes. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
            <span>© 2024 Careplus Medical</span>
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
