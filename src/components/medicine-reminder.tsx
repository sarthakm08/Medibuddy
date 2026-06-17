import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Droplets, 
  Camera, 
  Plus, 
  Trash2, 
  Bell, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Smartphone,
  MessageCircle,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { detectMedicine } from '@/ai/flows/detect-medicine-flow';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  name: string;
  type: 'pill' | 'syrup';
  amount: string;
  time: string;
  imageUrl?: string;
  taken: boolean;
}

export function MedicineReminder() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'pill' as 'pill' | 'syrup',
    amount: '',
    time: '',
    image: null as string | null
  });
  
  const [smartFeatures, setSmartFeatures] = useState({
    sms: true,
    whatsapp: false,
    familyAlert: true
  });

  const adherence = reminders.length > 0 
    ? Math.round((reminders.filter(r => r.taken).length / reminders.length) * 100) 
    : 0;

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

  const handleAIDetect = async () => {
    if (!formData.image) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of the medicine first.",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    try {
      const result = await detectMedicine({ photoDataUri: formData.image });
      if (result.detected) {
        setFormData(prev => ({
          ...prev,
          name: result.name || prev.name,
          type: result.type || prev.type,
          amount: result.suggestedAmount || prev.amount
        }));
        toast({
          title: "Medicine Detected",
          description: `Successfully identified ${result.name}.`,
        });
      } else {
        toast({
          title: "Detection Failed",
          description: "Could not clearly identify medicine from photo. Please enter manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred during AI detection.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const addReminder = () => {
    if (!formData.name || !formData.amount || !formData.time) {
      toast({
        title: "Missing Info",
        description: "Please fill in the medicine name, amount, and time.",
        variant: "destructive"
      });
      return;
    }
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      type: formData.type,
      amount: formData.amount,
      time: formData.time,
      imageUrl: formData.image || undefined,
      taken: false
    };
    setReminders([...reminders, newReminder]);
    setFormData({ name: '', type: 'pill', amount: '', time: '', image: null });
    toast({
      title: "Reminder Added",
      description: `${newReminder.name} scheduled for ${newReminder.time}.`,
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleTaken = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, taken: !r.taken } : r));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Smart Controls & Stats */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Adherence Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{adherence}%</span>
              <Badge variant="secondary" className={adherence > 80 ? "bg-green-500 text-white" : "bg-orange-500 text-white"}>
                {adherence > 80 ? 'Excellent' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={adherence} className="h-2 bg-white/20" />
            <p className="text-[10px] opacity-80">Tracked based on doses marked as 'Taken' today.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Smart Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs">SMS Alerts</Label>
              </div>
              <Switch checked={smartFeatures.sms} onCheckedChange={(v) => setSmartFeatures({...smartFeatures, sms: v})} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs">WhatsApp Sync</Label>
              </div>
              <Switch checked={smartFeatures.whatsapp} onCheckedChange={(v) => setSmartFeatures({...smartFeatures, whatsapp: v})} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs">Family Alert on Missed</Label>
              </div>
              <Switch checked={smartFeatures.familyAlert} onCheckedChange={(v) => setSmartFeatures({...smartFeatures, familyAlert: v})} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold">New Reminder</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Medicine Picture</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 gap-2 border-dashed h-12"
                  onClick={() => document.getElementById('med-img')?.click()}
                >
                  {formData.image ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Camera className="w-4 h-4" />}
                  <span className="text-[10px]">{formData.image ? 'Change Photo' : 'Upload Label'}</span>
                </Button>
                {formData.image && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-12 w-12 shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={handleAIDetect}
                    disabled={isDetecting}
                    title="Detect info from label"
                  >
                    {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              <input id="med-img" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Medicine Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Paracetamol"
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pill">Pill</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{formData.type === 'pill' ? 'Units' : 'ML'}</Label>
                <Input 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="1"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Time</Label>
              <Input 
                type="time" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="h-8 text-xs"
              />
            </div>

            <Button className="w-full h-10 gap-2" onClick={addReminder} disabled={isDetecting}>
              <Plus className="w-4 h-4" /> Add to Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card className="lg:col-span-8 border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center justify-between">
            Today's Schedule
            <Badge variant="outline">{reminders.length} Scheduled</Badge>
          </CardTitle>
          <CardDescription>Stay on track with your prescribed dosage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {reminders.length > 0 ? (
              reminders.map(r => (
                <div key={r.id} className={`flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm group transition-opacity ${r.taken ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-lg bg-muted overflow-hidden flex items-center justify-center border shrink-0">
                      {r.imageUrl ? (
                        <Image src={r.imageUrl} fill className="object-cover" alt={r.name} />
                      ) : (
                        r.type === 'pill' ? <Pill className="text-primary w-6 h-6" /> : <Droplets className="text-accent w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-base ${r.taken ? 'line-through' : ''}`}>{r.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {r.time} • {r.amount} {r.type === 'pill' ? 'pill(s)' : 'ml'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={r.taken ? 'secondary' : 'default'} 
                      size="sm" 
                      className={`h-8 gap-1.5 ${r.taken ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
                      onClick={() => toggleTaken(r.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {r.taken ? 'Taken' : 'Mark Taken'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive group-hover:opacity-100 opacity-0 transition-opacity" onClick={() => deleteReminder(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-xl">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm">Your schedule is empty. Add a medication to start tracking adherence.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
