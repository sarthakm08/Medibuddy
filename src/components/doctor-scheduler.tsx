import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, MapPin, User, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
}

export function DoctorScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { doctor: 'Dr. Sarah Smith', specialty: 'General Physician', date: '2024-04-12', time: '10:30 AM', location: 'City Health Clinic' }
  ]);
  
  const [formData, setFormData] = useState({
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    location: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor || !formData.date) return;
    setAppointments([...appointments, formData]);
    setFormData({ doctor: '', specialty: '', date: '', time: '', location: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-1 shadow-sm border-none bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Schedule Session</CardTitle>
          <CardDescription>Log your next doctor's visit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Doctor's Name</Label>
              <Input 
                value={formData.doctor} 
                onChange={e => setFormData({...formData, doctor: e.target.value})}
                placeholder="Dr. Jane Doe" 
              />
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Input 
                value={formData.specialty} 
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                placeholder="Cardiologist" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location / Link</Label>
              <Input 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Room 302 or Zoom link" 
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <CalendarIcon className="w-4 h-4" /> Save Appointment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="lg:col-span-2 shadow-sm border-none bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Upcoming Visits</CardTitle>
          <CardDescription>Your healthcare appointment calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appt, i) => (
                <div key={i} className="p-4 rounded-xl border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{appt.doctor}</h4>
                      <Badge variant="secondary" className="text-[10px] mt-1">{appt.specialty}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> {appt.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {appt.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {appt.location}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Done
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground italic text-sm">No appointments scheduled.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
