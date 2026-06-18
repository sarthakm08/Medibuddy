'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Heart, ShieldAlert, Phone, Sparkles, Activity, Stethoscope, Calendar } from 'lucide-react';
import { PatientData } from './patient-profile';
import { ExtractMedicalReportInsightsOutput } from '@/ai/flows/extract-medical-report-insights-flow';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardViewProps {
  patientData: PatientData;
  insights: ExtractMedicalReportInsightsOutput | null;
}

export function DashboardView({ patientData, insights }: DashboardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Column: Vitals & Profile */}
      <div className="md:col-span-4 space-y-6">
        <Card className="glass-morphism border-none shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <LayoutDashboard className="w-5 h-5" />
                Vitals Overview
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20 bg-white/5">Active Profile</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-primary/5 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Age</p>
                <p className="text-xl font-bold text-white">{patientData.age || '--'} <span className="text-sm font-normal text-muted-foreground">yrs</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-destructive/5 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blood Group</p>
                <p className="text-xl font-bold text-white flex items-center gap-1">
                  <Heart className="w-4 h-4 text-destructive" /> {patientData.bloodGroup || '--'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-primary/5 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight</p>
                <p className="text-xl font-bold text-white">{patientData.weight || '--'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-primary/5 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sex</p>
                <p className="text-xl font-bold capitalize text-white">{patientData.sex || '--'}</p>
              </div>
            </div>

            {patientData.nomineeName && (
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 mb-2">
                  <ShieldAlert className="w-3 h-3" /> Emergency Contact
                </p>
                <div>
                  <p className="text-base font-bold text-white">{patientData.nomineeName}</p>
                  <p className="text-sm text-primary flex items-center gap-1 mt-1 font-semibold">
                    <Phone className="w-3 h-3" /> {patientData.nomineePhoneNumber || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm font-semibold p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-3 h-3 rounded-full bg-destructive shadow-lg animate-pulse" />
                <span className="text-white">Allergies: <span className="font-normal text-muted-foreground ml-1">{patientData.allergies || 'None Reported'}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-3 h-3 rounded-full bg-secondary shadow-lg" />
                <span className="text-white">Conditions: <span className="font-normal text-muted-foreground ml-1">{patientData.chronicConditions || 'None Reported'}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10 shadow-inner overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Clinical Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                  "Maintain a steady weight log in the Progress tab to help Raju fine-tune your cardiovascular wellness focus."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Active Diagnoses & History */}
      <div className="md:col-span-8 space-y-6">
        <Card className="glass-morphism border-none h-full min-h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Active Diagnoses & Treatment</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Ongoing clinical observations and timelines</p>
                </div>
              </div>
              {insights && (
                <Badge className="bg-accent text-white border-none shadow-lg shadow-accent/20">
                  {insights.treatmentTimelines.length} Active Plans
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {insights && insights.treatmentTimelines.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {insights.treatmentTimelines.map((timeline, idx) => (
                    <div key={idx} className="group relative pl-8 pb-8 border-l-2 border-accent/30 last:border-0 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background group-hover:scale-125 transition-transform" />
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-bold text-white">{timeline.condition}</h4>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                            <Activity className="w-3 h-3 mr-1" /> Monitoring
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Started: {timeline.startDate || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-destructive" />
                            <span>Target: {timeline.endDate || 'Ongoing'}</span>
                          </div>
                        </div>
                        {timeline.notes && (
                          <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
                            " {timeline.notes} "
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                <div className="p-6 bg-white/5 rounded-full mb-6">
                  <Stethoscope className="w-12 h-12 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white">No Active Diagnoses</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-2">
                  Upload a medical report in the Analyzer tab to extract and track your treatment progress.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
