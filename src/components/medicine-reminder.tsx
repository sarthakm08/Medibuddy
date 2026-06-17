import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Droplets, Camera, Plus, Trash2, Bell, Clock } from 'lucide-react';
import Image from 'next/image';

interface Reminder {
  id: string;
  name: string;
  type: 'pill' | 'syrup';
  amount: string;
  time: string;
  imageUrl?: string;
}

export function MedicineReminder() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'pill' as 'pill' | 'syrup',
    amount: '',
    time: '',
    image: null as string | null
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addReminder = () => {
    if (!formData.name || !formData.amount || !formData.time) return;
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      type: formData.type,
      amount: formData.amount,
      time: formData.time,
      imageUrl: formData.image || undefined
    };
    setReminders([...reminders, newReminder]);
    setFormData({ name: '', type: 'pill', amount: '', time: '', image: null });
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Card */}
      <Card className="lg:col-span-4 h-fit border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-headline">Add Reminder</CardTitle>
          </div>
          <CardDescription>Never miss a dose again.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Medicine Name</Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Paracetamol" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pill">Pill / Tablet</SelectItem>
                  <SelectItem value="syrup">Syrup (ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formData.type === 'pill' ? 'Amount (units)' : 'Amount (ml)'}</Label>
              <Input 
                type="number"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder={formData.type === 'pill' ? "1" : "5"} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input 
              type="time" 
              value={formData.time} 
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Medicine Picture (Optional)</Label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="w-full gap-2 border-dashed h-20"
                onClick={() => document.getElementById('med-img')?.click()}
              >
                {formData.image ? (
                  <div className="relative w-full h-full">
                    <Image src={formData.image} fill className="object-cover rounded" alt="Medicine preview" />
                  </div>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">Upload Photo</span>
                  </>
                )}
              </Button>
              <input 
                id="med-img" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>
          </div>
          <Button className="w-full gap-2" onClick={addReminder}>
            <Plus className="w-4 h-4" /> Save Reminder
          </Button>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card className="lg:col-span-8 border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Active Reminders</CardTitle>
          <CardDescription>Scheduled dosage for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {reminders.length > 0 ? (
              reminders.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center border">
                      {r.imageUrl ? (
                        <Image src={r.imageUrl} fill className="object-cover" alt={r.name} />
                      ) : (
                        r.type === 'pill' ? <Pill className="text-primary w-6 h-6" /> : <Droplets className="text-accent w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{r.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {r.time} • {r.amount} {r.type === 'pill' ? 'unit(s)' : 'ml'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteReminder(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-10" />
                <p className="text-sm">No reminders set. Add your first medicine above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
