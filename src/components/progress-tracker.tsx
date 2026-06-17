import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Smile, Meh, Frown, Plus, Activity, Heart } from 'lucide-react';

interface HealthEntry {
  date: string;
  weight: number;
  mood: number;
}

const INITIAL_DATA: HealthEntry[] = [
  { date: '2024-01-01', weight: 72, mood: 3 },
  { date: '2024-01-15', weight: 71.5, mood: 4 },
  { date: '2024-02-01', weight: 70.8, mood: 3 },
  { date: '2024-02-15', weight: 70.2, mood: 5 },
];

export function ProgressTracker() {
  const [data, setData] = useState<HealthEntry[]>(INITIAL_DATA);
  const [newWeight, setNewWeight] = useState('');
  const [newMood, setNewMood] = useState('3');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addEntry = () => {
    if (!newWeight) return;
    const entry: HealthEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      mood: parseInt(newMood),
    };
    setData([...data, entry]);
    setNewWeight('');
  };

  const currentWeight = data[data.length - 1]?.weight || 0;
  const previousWeight = data[data.length - 2]?.weight || currentWeight;
  const weightDiff = (currentWeight - previousWeight).toFixed(1);
  const isGain = parseFloat(weightDiff) > 0;
  const isLoss = parseFloat(weightDiff) < 0;

  if (!isClient) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weight Trend
              </CardTitle>
              <CardDescription>Monitor weight gain or loss</CardDescription>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${isLoss ? 'bg-green-100 text-green-700' : isGain ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              {isGain ? <TrendingUp className="w-4 h-4" /> : isLoss ? <TrendingDown className="w-4 h-4" /> : null}
              {Math.abs(parseFloat(weightDiff))} kg
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickFormatter={(str) => str.split('-').slice(1).join('/')} 
                    stroke="#94a3b8"
                  />
                  <YAxis fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Emotional Well-being
            </CardTitle>
            <CardDescription>Daily mood shift visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickFormatter={(str) => str.split('-').slice(1).join('/')} 
                    stroke="#94a3b8"
                  />
                  <YAxis fontSize={10} ticks={[1, 2, 3, 4, 5]} stroke="#94a3b8" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="mood" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      <Card className="border-dashed border-2 bg-primary/5 shadow-none hover:bg-primary/10 transition-colors">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="weight-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Weight (kg)</Label>
              <Input 
                id="weight-input" 
                type="number" 
                placeholder="70.5" 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Mood</Label>
              <Select value={newMood} onValueChange={setNewMood}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="How do you feel?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1"><div className="flex items-center gap-2"><Frown className="w-4 h-4 text-destructive" /> Very Low</div></SelectItem>
                  <SelectItem value="2"><div className="flex items-center gap-2"><Frown className="w-4 h-4" /> Low</div></SelectItem>
                  <SelectItem value="3"><div className="flex items-center gap-2"><Meh className="w-4 h-4" /> Neutral</div></SelectItem>
                  <SelectItem value="4"><div className="flex items-center gap-2"><Smile className="w-4 h-4" /> Good</div></SelectItem>
                  <SelectItem value="5"><div className="flex items-center gap-2"><Smile className="w-4 h-4 text-green-600" /> Excellent</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addEntry} className="gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Log Vital Signs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
