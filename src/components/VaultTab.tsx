'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BookOpen, Radio } from 'lucide-react';
import MemoryVault from '@/components/MemoryVault';
import ThrowbackLibrary from '@/components/ThrowbackLibrary';
import EraPods from '@/components/EraPods';

const SUB_TABS = [
  { id: 'vault' as const, label: 'Memory Vault', icon: <Star className="h-3.5 w-3.5" /> },
  { id: 'library' as const, label: 'Library', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'pods' as const, label: 'Era Pods', icon: <Radio className="h-3.5 w-3.5" /> },
];

type SubTabId = typeof SUB_TABS[number]['id'];

export default function VaultTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('vault');

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="sk-metal rounded-xl p-1 mb-6 flex gap-1 shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer old-typewriter ${
              activeSubTab === tab.id
                ? 'sk-paper shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] text-[#3d2b1f]'
                : 'text-[#6b6b6b] hover:text-[#3d2b1f] hover:bg-white/20'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <MemoryVault />
          </motion.div>
        )}
        {activeSubTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ThrowbackLibrary />
          </motion.div>
        )}
        {activeSubTab === 'pods' && (
          <motion.div
            key="pods"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <EraPods />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}