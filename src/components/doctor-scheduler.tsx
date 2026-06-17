import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, MapPin, User, Clock, CheckCircle2, Stethoscope, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  completed: boolean;
}

export function DoctorScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { 
      id: '1',
      doctor: 'Dr. Sarah Smith', 
      specialty: 'General Physician', 
      date: '2024-04-12', 
      time: '10:30 AM', 
      location: 'City Health Clinic',
      completed: false
    }
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
    
    const newAppt: Appointment = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };

    setAppointments([newAppt, ...appointments]);
    setFormData({ doctor: '', specialty: '', date: '', time: '', location: '' });
  };

  const toggleComplete = (id: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Form Block */}
      <Card className="lg:col-span-4 shadow-lg border-none bg-card/50 backdrop-blur-sm h-fit">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-5 h-5 text-primary" />
            <CardTitle className="font-headline text-lg">Schedule Session</CardTitle>
          </div>
          <CardDescription>Log your next doctor's visit or specialist consultation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Doctor's Name</Label>
              <Input 
                id="doc-name"
                value={formData.doctor} 
                onChange={e => setFormData({...formData, doctor: e.target.value})}
                placeholder="Dr. Jane Doe" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input 
                id="specialty"
                value={formData.specialty} 
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                placeholder="Cardiologist" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date"
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time"
                  type="time" 
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / Link</Label>
              <Input 
                id="location"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Room 302 or Zoom link" 
              />
            </div>
            <Button type="submit" className="w-full gap-2 shadow-md">
              <CalendarIcon className="w-4 h-4" /> Save Appointment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List Block */}
      <Card className="lg:col-span-8 shadow-sm border-none bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-5 h-5 text-primary" />
            <CardTitle className="font-headline text-lg">Upcoming Visits</CardTitle>
          </div>
          <CardDescription>Keep track of your healthcare calendar and specialist visits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  className={`p-5 rounded-xl border transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${appt.completed ? 'bg-muted/30 opacity-60' : 'bg-background shadow-sm'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${appt.completed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-base ${appt.completed ? 'line-through' : ''}`}>{appt.doctor}</h4>
                      <Badge variant={appt.completed ? 'outline' : 'secondary'} className="text-[10px] uppercase mt-1">
                        {appt.specialty}
                      </Badge>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5" /> {appt.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {appt.time}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {appt.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Separator orientation="vertical" className="hidden md:block h-10 mx-2" />
                    <Button 
                      variant={appt.completed ? 'outline' : 'ghost'} 
                      size="sm" 
                      onClick={() => toggleComplete(appt.id)}
                      className={`gap-1.5 ${appt.completed ? 'text-muted-foreground' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${appt.completed ? 'fill-green-500 text-white' : ''}`} />
                      {appt.completed ? 'Visited' : 'Mark Done'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground italic border-2 border-dashed rounded-xl">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>No appointments scheduled yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
