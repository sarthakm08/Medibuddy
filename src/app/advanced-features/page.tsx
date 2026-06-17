'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Stethoscope, 
  LayoutDashboard, 
  Bell, 
  Search, 
  BrainCircuit, 
  Moon, 
  Heart, 
  Activity, 
  Loader2, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  FileText,
  Pill,
  Syringe,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { checkSymptoms, SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import { getHealthCoachAdvice, HealthCoachOutput } from '@/ai/flows/health-coach-flow';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const MOCK_WELLNESS_DATA = [
  { time: '10 PM', sleep: 20, hr: 62 },
  { time: '12 AM', sleep: 80, hr: 58 },
  { time: '02 AM', sleep: 95, hr: 55 },
  { time: '04 AM', sleep: 85, hr: 56 },
  { time: '06 AM', sleep: 60, hr: 60 },
  { time: '08 AM', sleep: 10, hr: 72 },
];

export default function AdvancedFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState('symptoms');
  
  // Symptom Checker State
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false);
  const [symptomResult, setSymptomResult] = useState<SymptomCheckerOutput | null>(null);

  // Health Coach State
  const [isGettingCoach, setIsGettingCoach] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState<HealthCoachOutput | null>(null);

  // Interaction State
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');

  const handleSymptomCheck = async () => {
    if (!symptomsInput) return;
    setIsCheckingSymptoms(true);
    try {
      const res = await checkSymptoms({ symptoms: symptomsInput });
      setSymptomResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingSymptoms(false);
    }
  };

  const fetchCoachAdvice = async () => {
    setIsGettingCoach(true);
    try {
      const advice = await getHealthCoachAdvice({ patientProfile: "35y male, active, slight hypertension" });
      setCoachAdvice(advice);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGettingCoach(false);
    }
  };

  useEffect(() => {
    if (activeFeature === 'coach' && !coachAdvice) {
      fetchCoachAdvice();
    }
  }, [activeFeature]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 shadow-sm">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-headline text-xl font-bold text-primary">Advanced Health Suite</h1>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeFeature} onValueChange={setActiveFeature} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto bg-white border p-1 rounded-2xl shadow-sm gap-1">
            <TabsTrigger value="symptoms" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <Stethoscope className="w-4 h-4" /> Symptoms
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <Bell className="w-4 h-4" /> Reminders
            </TabsTrigger>
            <TabsTrigger value="interaction" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <Search className="w-4 h-4" /> Interactions
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <BrainCircuit className="w-4 h-4" /> Coach
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              <Moon className="w-4 h-4" /> Wellness
            </TabsTrigger>
          </TabsList>

          {/* Symptom Checker */}
          <TabsContent value="symptoms" className="space-y-6">
            <div className="grid md:grid-cols-12 gap-8">
              <Card className="md:col-span-5 border-none shadow-sm h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" /> AI Symptom Checker
                  </CardTitle>
                  <CardDescription>Enter how you're feeling for an immediate AI triage assessment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Describe Symptoms</Label>
                    <Textarea 
                      placeholder="e.g., Persistent dry cough, mild fever, and fatigue for 3 days." 
                      className="min-h-[150px] bg-muted/20"
                      value={symptomsInput}
                      onChange={(e) => setSymptomsInput(e.target.value)}
                    />
                  </div>
                  <Button className="w-full gap-2" onClick={handleSymptomCheck} disabled={isCheckingSymptoms || !symptomsInput}>
                    {isCheckingSymptoms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Run AI Triage
                  </Button>
                </CardContent>
              </Card>

              <div className="md:col-span-7 space-y-6">
                {isCheckingSymptoms ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 animate-pulse">
                    <BrainCircuit className="w-12 h-12 text-primary/20 mb-4" />
                    <p className="font-medium text-muted-foreground">Analyzing symptoms against medical patterns...</p>
                  </div>
                ) : symptomResult ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Alert variant={symptomResult.urgencyLevel === 'emergency' ? 'destructive' : 'default'} className="bg-white border-2">
                      <ShieldAlert className="w-5 h-5" />
                      <AlertTitle className="font-bold flex items-center justify-between">
                        Urgency Level: {symptomResult.urgencyLevel.toUpperCase()}
                        <Badge variant="outline">{symptomResult.urgencyLevel}</Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2 text-base">
                        {symptomResult.guidance}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4">
                      {symptomResult.possibleConditions.map((cond, i) => (
                        <Card key={i} className="border-none shadow-sm overflow-hidden">
                          <div className={`h-1 w-full ${cond.likelihood === 'high' ? 'bg-orange-500' : 'bg-primary'}`} />
                          <CardContent className="pt-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              {cond.name}
                              <Badge variant="secondary" className="text-[10px]">{cond.likelihood} probability</Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{cond.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <p className="text-[10px] text-muted-foreground italic px-2">
                      {symptomResult.disclaimer}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-white/50 text-muted-foreground">
                    <Sparkles className="w-12 h-12 opacity-10 mb-4" />
                    <p className="text-sm">Enter symptoms on the left to start analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Health Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><FileText className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold">Blood Panel</p>
                        <p className="text-[10px] text-muted-foreground">Mar 12, 2024</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-md"><Syringe className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold">Flu Vaccine</p>
                        <p className="text-[10px] text-muted-foreground">Nov 15, 2023</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Health Trends</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                      <TrendingUp className="w-3 h-3 mr-1" /> Improving
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { day: 'Mon', score: 65 },
                        { day: 'Tue', score: 68 },
                        { day: 'Wed', score: 75 },
                        { day: 'Thu', score: 72 },
                        { day: 'Fri', score: 80 },
                        { day: 'Sat', score: 85 },
                        { day: 'Sun', score: 82 },
                      ]}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">Aggregate Health Score (0-100)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Smart Medication Reminder */}
          <TabsContent value="reminders" className="space-y-6">
            <div className="grid md:grid-cols-12 gap-8">
              <Card className="md:col-span-4 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Bell className="w-5 h-5" /> Adherence Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center p-12">
                    <div className="absolute inset-0 rounded-full border-8 border-muted opacity-20" />
                    <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }} />
                    <span className="text-4xl font-extrabold text-primary">92%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Excellent Work!</p>
                    <p className="text-xs text-muted-foreground">You've only missed 2 doses this month. Your family was notified on missed sessions.</p>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-8 grid gap-4">
                <Card className="border-none shadow-sm p-6 flex items-center justify-between group bg-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Lisinopril (10mg)</h4>
                      <p className="text-xs text-muted-foreground">Daily • 08:00 AM • Family Alert Enabled</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">Missed</Button>
                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">Taken</Button>
                  </div>
                </Card>
                <Card className="border-none shadow-sm p-6 flex items-center justify-between group bg-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Multivitamin</h4>
                      <p className="text-xs text-muted-foreground">Daily • 12:00 PM</p>
                    </div>
                  </div>
                  <Button size="sm" className="h-8">Next Dose in 2h</Button>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Medicine Interaction Checker */}
          <TabsContent value="interaction" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> Multi-Medicine Conflict Check
                </CardTitle>
                <CardDescription>Verify if taking two specific medications together poses any risk.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Medicine A</Label>
                    <Input placeholder="e.g. Warfarin" value={med1} onChange={e => setMed1(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Medicine B</Label>
                    <Input placeholder="e.g. Ibuprofen" value={med2} onChange={e => setMed2(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full gap-2 py-6 text-lg" disabled={!med1 || !med2}>
                  <ShieldAlert className="w-5 h-5" /> Analyze Interactions
                </Button>
                
                <Alert className="bg-primary/5 border-primary/20 mt-4">
                  <Clock className="w-4 h-4 text-primary" />
                  <AlertTitle className="text-sm font-bold">Safety Note</AlertTitle>
                  <AlertDescription className="text-xs">
                    This tool checks against standard pharmacopeia. Always cross-check with your pharmacist.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalized Health Coach */}
          <TabsContent value="coach" className="space-y-6">
            <div className="grid md:grid-cols-12 gap-8">
              <Card className="md:col-span-4 bg-primary text-white border-none shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg"><BrainCircuit className="w-6 h-6" /></div>
                    <h3 className="text-xl font-bold">AI Health Coach</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm opacity-90 leading-relaxed">"Based on your recent labs and profile, we're focusing on cardiovascular health and sodium management this week."</p>
                    <Button variant="secondary" className="w-full font-bold" onClick={fetchCoachAdvice} disabled={isGettingCoach}>
                      {isGettingCoach ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update My Plan
                    </Button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 border-t border-white/10 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                  <span>7k Steps Today</span>
                  <span className="opacity-30">|</span>
                  <span>1.2k Cal Burned</span>
                </div>
              </Card>

              <div className="md:col-span-8 space-y-6">
                {coachAdvice ? (
                  <div className="grid md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="border-none shadow-sm bg-green-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-green-700">Daily Focus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {coachAdvice.dailySuggestions.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-blue-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-700">Fitness Strategy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {coachAdvice.fitnessRecommendations.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Activity className="w-4 h-4 text-blue-600 mt-0.5" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-2 border-none shadow-sm bg-orange-50/50">
                      <CardContent className="py-6 flex items-center gap-6">
                        <div className="p-4 bg-orange-100 rounded-2xl text-orange-600"><Sparkles className="w-8 h-8" /></div>
                        <div>
                          <h4 className="font-bold">Nutrition & Wellness</h4>
                          <p className="text-sm text-muted-foreground mt-1">{coachAdvice.nutritionFocus}</p>
                          <p className="text-xs font-bold text-orange-700 mt-2 italic">{coachAdvice.wellnessTip}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-20 border-2 border-dashed rounded-2xl bg-white/50">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sleep & Wellness Monitor */}
          <TabsContent value="wellness" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/50 pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Moon className="w-5 h-5 text-indigo-600" /> Sleep Quality</span>
                    <Badge className="bg-indigo-100 text-indigo-700 border-none">Great</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-4">7h 42m</div>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_WELLNESS_DATA}>
                        <Area type="step" dataKey="sleep" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>Deep Sleep: 1h 20m</span>
                    <span>REM: 2h 10m</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-rose-50/50 pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-600" /> Heart Rate</span>
                    <Badge className="bg-rose-100 text-rose-700 border-none">Stable</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-4">64 <span className="text-sm font-medium text-muted-foreground">BPM</span></div>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_WELLNESS_DATA}>
                        <Line type="monotone" dataKey="hr" stroke="#e11d48" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground mt-2 italic">Real-time sync from wearable active</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-amber-50/50 pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Activity className="w-5 h-5 text-amber-600" /> Stress Levels</span>
                    <Badge className="bg-amber-100 text-amber-700 border-none">Medium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Current Score</span>
                      <span className="text-amber-600 font-bold">42/100</span>
                    </div>
                    <Progress value={42} className="h-2 bg-amber-100" />
                  </div>
                  <div className="p-4 bg-muted/20 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      "Stress peaks detected during 2-4 PM. Consider a 5-minute breathing exercise tomorrow at 1:45 PM."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
