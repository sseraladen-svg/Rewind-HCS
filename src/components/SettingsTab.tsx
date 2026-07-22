'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Database, User } from 'lucide-react';
import EraSkins from '@/components/EraSkins';
import { useSession } from 'next-auth/react';

interface SettingsTabProps {
  onOpenManageData: () => void;
}

const SECTIONS = [
  { id: 'skins' as const, label: 'Era Themes', icon: <Palette className="h-4 w-4" />, emoji: '🎨' },
  { id: 'data' as const, label: 'Data Management', icon: <Database className="h-4 w-4" />, emoji: '💾' },
  { id: 'account' as const, label: 'Account', icon: <User className="h-4 w-4" />, emoji: '👤' },
];

type SectionId = typeof SECTIONS[number]['id'];

export default function SettingsTab({ onOpenManageData }: SettingsTabProps) {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Era Skins section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest">Era Themes</h2>
        </div>
        <EraSkins />
      </section>

      {/* Data Management section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest">Data Management</h2>
        </div>
        <div className="sk-paper rounded-xl p-5 sk-noise">
          <p className="old-body text-sm text-[#8b7355] mb-4">
            Export your memories, import a backup, or clear all local data. Everything stays on your device.
          </p>
          <button
            onClick={onOpenManageData}
            className="sk-btn old-btn px-5 py-2.5 rounded-lg font-bold text-sm cursor-pointer flex items-center gap-2"
          >
            <Database className="h-4 w-4" /> Open Data Manager
          </button>
        </div>
      </section>

      {/* Account section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest">Account</h2>
        </div>
        <div className="sk-paper rounded-xl p-5 sk-noise">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8b5e3c] flex items-center justify-center text-white font-bold old-title">
                  {(session.user.name || session.user.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="old-heading font-bold text-sm text-[#3d2b1f]">
                    {session.user.name || 'User'}
                  </p>
                  <p className="old-typewriter text-xs text-[#8b7355]">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <p className="old-body text-xs text-[#8b7355]">
                ✅ You&apos;re signed in. Your journal entries can be synced across devices.
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-3xl block mb-2">🔒</span>
              <p className="old-body text-sm text-[#8b7355]">
                You&apos;re browsing as a guest. Sign in to save your insights history and sync journal entries.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}