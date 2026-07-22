'use client';

import VoiceMessages from '@/components/VoiceMessages';
import { RotaryPhoneSection, RetroChatSection } from '@/components/NostalgiaFeatures';

/* ═══════════════════════════════════════════════════
   Contacts Tab — Voice Messages, Rotary Phone, Retro Chat
   ═══════════════════════════════════════════════════ */

export default function ContactsTab() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="old-body text-sm text-[#5c4033] font-medium">
          Reach out the old-fashioned way.
        </p>
      </div>

      <RotaryPhoneSection />
      <VoiceMessages />
      <RetroChatSection />
    </div>
  );
}
