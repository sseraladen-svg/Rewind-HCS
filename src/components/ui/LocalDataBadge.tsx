'use client';

import { Shield } from 'lucide-react';

/**
 * Small trust indicator badge — placed in the footer.
 * Warm-sepia styling consistent with the app aesthetic.
 * Communicates: all data stays on-device, nothing uploaded.
 */
export default function LocalDataBadge() {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <div
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #d4a574, #c4956a)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <Shield className="w-2 h-2 text-[#faf6eb]" />
      </div>
      <span className="old-typewriter text-[9px] text-[#a89878] tracking-wide">
        Your memories stay on this device. Nothing is uploaded.
      </span>
    </div>
  );
}