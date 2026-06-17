import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Activity, AlertCircle, Phone, History, Venus, Mars, MapPin, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface PatientData {
  name: string;
  age: string;
  phoneNumber: string;
  sex: string;
  weight: string;
  height: string;
  address: string;
  allergies: string;
  chronicConditions: string;
  accidentHistory: string;
  profilePhoto?: string;
}

interface PatientProfileProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
}

export function PatientProfile({ data, onChange }: PatientProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...data, profilePhoto: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onChange({ ...data, profilePhoto: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center relative shadow-inner">
              {data.profilePhoto ? (
                <Image src={data.profilePhoto} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="w-16 h-16 text-muted-foreground/40" />
              )}
            </div>
            {data.profilePhoto && (
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute -top-1 -right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removePhoto}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-background"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Profile Photo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={data.name} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone Number
            </Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" value={data.phoneNumber} onChange={handleChange} placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={data.age} onChange={handleChange} placeholder="35" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex" className="flex items-center gap-1">
              Sex
            </Label>
            <Select value={data.sex} onValueChange={(val) => handleSelectChange('sex', val)}>
              <SelectTrigger id="sex">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male"><div className="flex items-center gap-2"><Mars className="w-3 h-3" /> Male</div></SelectItem>
                <SelectItem value="female"><div className="flex items-center gap-2"><Venus className="w-3 h-3" /> Female</div></SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> Weight (kg)
            </Label>
            <Input id="weight" name="weight" type="number" value={data.weight} onChange={handleChange} placeholder="70" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Residential Address
          </Label>
          <Textarea 
            id="address" 
            name="address" 
            value={data.address} 
            onChange={handleChange} 
            placeholder="Enter your full home address" 
            className="min-h-[60px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> Height (cm)
            </Label>
            <Input id="height" name="height" type="number" value={data.height} onChange={handleChange} placeholder="175" />
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
              className="min-h-[60px]"
            />
          </div>
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

        <div className="space-y-2">
          <Label htmlFor="accidentHistory" className="flex items-center gap-1">
            <History className="w-3 h-3" /> Accident History & Minor Injuries
          </Label>
          <Textarea 
            id="accidentHistory" 
            name="accidentHistory" 
            value={data.accidentHistory} 
            onChange={handleChange} 
            placeholder="E.g., Left arm fracture in 2018, minor concussion in 2022" 
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
