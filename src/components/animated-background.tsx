'use client';

import React from 'react';
import { Pill, Stethoscope, Syringe, Heart, Activity, Thermometer, BriefcaseMedical } from 'lucide-react';

const icons = [
  { Icon: Pill, size: 48, top: '10%', left: '5%', delay: '0s' },
  { Icon: Stethoscope, size: 64, top: '20%', left: '80%', delay: '2s' },
  { Icon: Syringe, size: 52, top: '60%', left: '10%', delay: '4s' },
  { Icon: Heart, size: 40, top: '75%', left: '85%', delay: '1s' },
  { Icon: Activity, size: 56, top: '40%', left: '15%', delay: '6s' },
  { Icon: Thermometer, size: 44, top: '85%', left: '40%', delay: '3s' },
  { Icon: BriefcaseMedical, size: 60, top: '15%', left: '45%', delay: '5s' },
  { Icon: Pill, size: 36, top: '50%', left: '90%', delay: '7s' },
  { Icon: Heart, size: 48, top: '65%', left: '50%', delay: '2.5s' },
  { Icon: Activity, size: 42, top: '30%', left: '70%', delay: '4.5s' },
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {icons.map((item, index) => (
        <div
          key={index}
          className="absolute opacity-10 animate-float"
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            filter: 'blur(8px)', // Visual blur effect (roughly 35% visual blur)
          }}
        >
          <item.Icon 
            size={item.size} 
            className="text-primary-foreground/40" 
            strokeWidth={1}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
    </div>
  );
}