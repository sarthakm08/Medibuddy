'use client';

import React, { useState } from 'react';
import { PatientProfile, PatientData } from '@/components/patient-profile';
import { ReportUploader } from '@/components/report-uploader';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { ShieldPlus, Heart, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MedibuddyHome() {
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    allergies: '',
    chronicConditions: ''
  });

  const [insights, setInsights] = useState<ExtractMedicalReportInsightsOutput | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const handleInsights = (data: ExtractMedicalReportInsightsOutput) => {
    setInsights(data);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform">
              <ShieldPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">Medibuddy</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">How it works</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Intro Section - No Print */}
        <section className="mb-12 no-print">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Intelligent Medical Companion
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Simplify your healthcare journey. Upload medical reports and receive structured summaries, medication tracking, and safety alerts tailored to your profile.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 no-print">
              <TabsTrigger value="profile" className="gap-2">
                <Heart className="w-4 h-4" /> 1. Patient Profile
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2" disabled={!insights}>
                <Stethoscope className="w-4 h-4" /> 2. Health Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <PatientProfile data={patientData} onChange={setPatientData} />
                <ReportUploader onInsightsExtracted={handleInsights} />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {insights && (
                <AnalysisDashboard insights={insights} patientData={patientData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-12 bg-white/50 no-print">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldPlus className="w-5 h-5 text-primary/50" />
            <span className="font-headline font-bold text-primary/50">Medibuddy</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Medibuddy is an AI-powered assistant. Always consult with a licensed healthcare professional before making any medical decisions.
          </p>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>© 2024 Medibuddy Tech. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span className="hidden md:inline">•</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
