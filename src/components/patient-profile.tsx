import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Activity, AlertCircle } from 'lucide-react';

export interface PatientData {
  name: string;
  age: string;
  weight: string;
  height: string;
  allergies: string;
  chronicConditions: string;
}

interface PatientProfileProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
}

export function PatientProfile({ data, onChange }: PatientProfileProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="font-headline text-xl">Patient Profile</CardTitle>
        </div>
        <CardDescription>Enter your personalized health parameters to ensure accurate medication safety analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={data.name} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={data.age} onChange={handleChange} placeholder="35" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> Weight (kg)
            </Label>
            <Input id="weight" name="weight" type="number" value={data.weight} onChange={handleChange} placeholder="70" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> Height (cm)
            </Label>
            <Input id="height" name="height" type="number" value={data.height} onChange={handleChange} placeholder="175" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies" className="flex items-center gap-1 text-destructive">
            <AlertCircle className="w-3 h-3" /> Allergies
          </Label>
          <Textarea 
            id="allergies" 
            name="allergies" 
            value={data.allergies} 
            onChange={handleChange} 
            placeholder="List any known allergies (e.g., Penicillin, Peanuts)" 
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chronicConditions">Chronic Conditions & Parameters</Label>
          <Textarea 
            id="chronicConditions" 
            name="chronicConditions" 
            value={data.chronicConditions} 
            onChange={handleChange} 
            placeholder="E.g., High Blood Pressure, Diabetes, Pregnant" 
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
