'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, PhoneCall, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export function FallDetection() {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);

  // SOS Alarm Sound Logic
  const startAlarm = () => {
    if (isMuted) return;
    if (!audioContext.current) audioContext.current = new AudioContext();
    
    oscillator.current = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    
    oscillator.current.type = 'siren' as any;
    oscillator.current.frequency.setValueAtTime(440, audioContext.current.currentTime);
    oscillator.current.frequency.exponentialRampToValueAtTime(880, audioContext.current.currentTime + 0.5);
    oscillator.current.loop = true;
    
    gain.gain.setValueAtTime(0.5, audioContext.current.currentTime);
    
    oscillator.current.connect(gain);
    gain.connect(audioContext.current.destination);
    
    oscillator.current.start();
  };

  const stopAlarm = () => {
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current = null;
    }
  };

  useEffect(() => {
    // Accelerometer logic
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      
      // Impact threshold (e.g., > 25 m/s^2) followed by near-zero motion
      if (totalAcc > 25 && !isAlertOpen && !isSOSActive) {
        triggerFallWarning();
      }
    };

    const triggerFallWarning = () => {
      setIsAlertOpen(true);
      setCountdown(5);
      
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            triggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isAlertOpen, isSOSActive]);

  const triggerSOS = () => {
    setIsAlertOpen(false);
    setIsSOSActive(true);
    startAlarm();
    
    toast({
      variant: "destructive",
      title: "EMERGENCY SOS TRIGGERED",
      description: "Emergency contacts and ambulance services have been notified of your location.",
    });
  };

  const dismissAlert = () => {
    setIsAlertOpen(false);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    stopAlarm();
    toast({
      title: "SOS Cancelled",
      description: "Emergency services have been updated.",
    });
  };

  return (
    <>
      {/* Fall Detected Warning Dialog */}
      <Dialog open={isAlertOpen} onOpenChange={(open) => !open && dismissAlert()}>
        <DialogContent className="glass-dark border-destructive/50 sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto p-4 bg-destructive/20 rounded-full w-fit mb-4">
              <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">Fall Detected!</DialogTitle>
            <DialogDescription className="text-white/80 text-lg">
              Are you okay? SOS will trigger in:
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <span className="text-7xl font-black text-destructive">{countdown}</span>
            <Progress value={(countdown / 5) * 100} className="h-2 mt-6 bg-white/10" />
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button variant="outline" onClick={dismissAlert} className="w-full text-lg h-14 border-white/20 hover:bg-white/10">
              I'm Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active SOS Overlay */}
      {isSOSActive && (
        <div className="fixed inset-0 z-[100] bg-destructive/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <ShieldAlert className="w-32 h-32 text-white animate-bounce mb-8" />
          <h1 className="text-5xl font-black text-white mb-4">SOS ACTIVE</h1>
          <p className="text-xl text-white/90 mb-12 max-w-md">
            Emergency services and your nominee have been contacted. Location data sent.
          </p>
          
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <Button size="lg" variant="secondary" className="h-16 text-xl font-bold gap-3" onClick={() => window.open('tel:911')}>
              <PhoneCall className="w-6 h-6" /> Call Ambulance
            </Button>
            <Button size="lg" variant="outline" className="h-16 text-xl font-bold border-white text-white hover:bg-white/10" onClick={cancelSOS}>
              Cancel False Alarm
            </Button>
            <Button variant="ghost" className="text-white" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="mr-2" /> : <Volume2 className="mr-2" />}
              {isMuted ? 'Unmute Alarm' : 'Mute Alarm'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
