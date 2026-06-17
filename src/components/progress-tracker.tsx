import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Smile, Meh, Frown, Plus } from 'lucide-react';

const INITIAL_DATA = [
  { date: '2024-01-01', weight: 72, mood: 3 },
  { date: '2024-01-15', weight: 71.5, mood: 4 },
  { date: '2024-02-01', weight: 70.8, mood: 3 },
  { date: '2024-02-15', weight: 70.2, mood: 5 },
];

export function ProgressTracker() {
  const [data, setData] = useState(INITIAL_DATA);
  const [newWeight, setNewWeight] = useState('');
  const [newMood, setNewMood] = useState('3');

  const addEntry = () => {
    if (!newWeight) return;
    const entry = {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-lg">Weight Trend</CardTitle>
              <CardDescription>Track gain/loss over time</CardDescription>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${isGain ? 'text-destructive' : 'text-green-600'}`}>
              {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(parseFloat(weightDiff))} kg
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                  <YAxis fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Mood Tracker</CardTitle>
            <CardDescription>Visualizing emotional well-being</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                  <YAxis fontSize={10} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Bar dataKey="mood" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      <Card className="border-dashed border-2 bg-transparent shadow-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="weight-input">Today's Weight (kg)</Label>
              <Input 
                id="weight-input" 
                type="number" 
                placeholder="70.5" 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Mood</Label>
              <Select value={newMood} onValueChange={setNewMood}>
                <SelectTrigger>
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
            <Button onClick={addEntry} className="gap-2">
              <Plus className="w-4 h-4" /> Log Vital Signs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
