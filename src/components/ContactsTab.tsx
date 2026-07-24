'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceMessages from '@/components/VoiceMessages';
import RotaryPhoneFolder from '@/components/contacts/RotaryPhoneFolder';
import RetroChatFolder from '@/components/contacts/RetroChatFolder';

/* ═══════════════════════════════════════════════════════════════
   Contacts Tab — Subfolder navigation for:
     1. Rotary Phone (spin + ring shake)
     2. Voice Messages (record/playback + audio visualization)
     3. Retro Chat (dial-up animation + typing + emoji + AI buddy)
   ═══════════════════════════════════════════════════════════════ */

type FolderKey = 'phone' | 'voice' | 'chat';

interface FolderDef {
  key: FolderKey;
  icon: string;
  label: string;
  desc: string;
  badge?: string;
}

const FOLDERS: FolderDef[] = [
  {
    key: 'phone',
    icon: '📞',
    label: 'Rotary Phone',
    desc: 'Dial a number the old-fashioned way',
  },
  {
    key: 'voice',
    icon: '🎙️',
    label: 'Voice Messages',
    desc: 'Record & playback voice notes',
    badge: 'MIC',
  },
  {
    key: 'chat',
    icon: '💬',
    label: 'Retro Chat',
    desc: 'AIM-style chat with dial-up connection',
  },
];

export default function ContactsTab() {
  const [openFolder, setOpenFolder] = useState<FolderKey | null>(null);

  const toggleFolder = useCallback((key: FolderKey) => {
    setOpenFolder((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="old-title text-2xl md:text-3xl mb-2"
        >
          ✦ CONTACTS ✦
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="old-body text-sm text-muted-foreground"
        >
          Reach out the old-fashioned way. Open a folder to explore.
        </motion.p>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {FOLDERS.map((folder) => {
          const isOpen = openFolder === folder.key;
          return (
            <motion.button
              key={folder.key}
              onClick={() => toggleFolder(folder.key)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative sk-paper rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group ${
                isOpen ? 'ring-2 ring-[#8b5e3c]' : ''
              }`}
            >
              {/* Badge */}
              {folder.badge && (
                <span className="absolute -top-2 -right-2 old-label text-[8px] tracking-wider bg-[#8b5e3c] text-white px-2 py-0.5 rounded-full shadow-sm">
                  {folder.badge}
                </span>
              )}

              {/* Folder icon with hover pop */}
              <motion.div
                animate={{ rotate: isOpen ? 0 : [0, -2, 0] }}
                transition={{ duration: 0.3 }}
                className="text-4xl mb-3"
              >
                {folder.icon}
              </motion.div>

              {/* Label */}
              <h3 className="old-heading text-sm font-semibold mb-1">{folder.label}</h3>
              <p className="old-label text-[10px] opacity-70">{folder.desc}</p>

              {/* Open indicator */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#8b5e3c] shadow-md"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Folder Content */}
      <AnimatePresence mode="wait">
        {openFolder && (
          <motion.div
            key={openFolder}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Back button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setOpenFolder(null)}
                className="sk-btn rounded-lg px-4 py-2 old-btn text-xs flex items-center gap-2"
              >
                <span className="text-sm">â©</span>
                Back to Folders
              </button>
            </div>

            {/* Section title for open folder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-4"
            >
              <span className="text-2xl mr-2">{FOLDERS.find(f => f.key === openFolder)?.icon}</span>
              <span className="old-heading text-lg">{FOLDERS.find(f => f.key === openFolder)?.label}</span>
            </motion.div>

            {/* Content */}
            {openFolder === 'phone' && <RotaryPhoneFolder />}
            {openFolder === 'voice' && <VoiceMessages />}
            {openFolder === 'chat' && <RetroChatFolder />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
