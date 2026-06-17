'use client';

import React, { useState, useEffect } from 'react';
import { PatientProfile, PatientData } from '@/components/patient-profile';
import { ReportUploader } from '@/components/report-uploader';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { XrayAnalyzer } from '@/components/xray-analyzer';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { ShieldPlus, Heart, Stethoscope, ChevronRight, Scan, UserCircle, Moon, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MedibuddyHome() {
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    phoneNumber: '',
    sex: '',
    weight: '',
    height: '',
    address: '',
    allergies: '',
    chronicConditions: '',
    accidentHistory: ''
  });

  const [insights, setInsights] = useState<ExtractMedicalReportInsightsOutput | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  // Theme Toggle State
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
    setActiveTab('analysis');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen selection:bg-primary/20 bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md no-print shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('profile')}>
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
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold">
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-2xl font-headline font-bold">User Information</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-6 pt-2">
                  <PatientProfile data={patientData} onChange={setPatientData} />
                </ScrollArea>
                <DialogFooter className="p-6 pt-2">
                  <Button onClick={() => setIsProfileDialogOpen(false)} className="w-full sm:w-auto">Save & Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Intro Section - No Print */}
        <section className="mb-12 no-print">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20">
              <ShieldPlus className="w-3 h-3" /> AI-Powered Health Companion
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
              Your Intelligent <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Medical Assistant</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Understand your health data better. Upload medical reports or X-rays to get structured summaries, medication tracking, and interactive safety analysis.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-12 no-print bg-card p-1 rounded-xl shadow-sm border h-14">
              <TabsTrigger 
                value="profile" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Heart className="w-4 h-4" /> Patient Profile
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all" 
                disabled={!insights}
              >
                <Stethoscope className="w-4 h-4" /> Health Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="xray" 
                className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Scan className="w-4 h-4" /> X-ray Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7">
                  <PatientProfile data={patientData} onChange={setPatientData} />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <ReportUploader onInsightsExtracted={handleInsights} />
                  
                  <div className={`p-6 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-500 flex items-center justify-between ${insights ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Analysis Ready</h4>
                        <p className="text-xs text-muted-foreground">Clinical profile successfully scanned.</p>
                      </div>
                    </div>
                    {insights && (
                      <Button variant="ghost" size="icon" onClick={() => setActiveTab('analysis')} className="text-primary hover:bg-primary/10">
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              {insights && (
                <AnalysisDashboard insights={insights} patientData={patientData} />
              )}
            </TabsContent>

            <TabsContent value="xray" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
              <XrayAnalyzer />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-16 bg-card no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            <strong>Medical Disclaimer:</strong> Medibuddy is an AI-powered assistant designed for informational purposes. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            <span>© 2024 Medibuddy Tech</span>
            <span className="hidden md:inline text-border">•</span>
            <a href="#" className="hover:underline underline-offset-4">Terms of Service</a>
            <span className="hidden md:inline text-border">•</span>
            <a href="#" className="hover:underline underline-offset-4">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
