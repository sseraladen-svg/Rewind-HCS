'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nostalgiaData, NostalgiaItem, DecadeData } from '@/lib/nostalgia-data';
import { getMemoryVaultTitles, setMemoryVaultTitles } from '@/lib/idb-store';
import { Lock, Save, X as XIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types & constants
// ═══════════════════════════════════════════════════════════════

const CATEGORY_KEYS: (keyof DecadeData)[] = [
  'cartoons', 'toys', 'music', 'movies', 'snacks', 'games', 'trends', 'schoolLife', 'tech',
];

interface FlatItem {
  title: string;
  description: string;
  emoji: string;
  category: string;
  decade: string;
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function getAllItems(): FlatItem[] {
  const items: FlatItem[] = [];
  for (const [decadeKey, data] of Object.entries(nostalgiaData)) {
    for (const cat of CATEGORY_KEYS) {
      const arr = data[cat];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          items.push({
            title: item.title,
            description: item.description,
            emoji: item.emoji,
            category: item.category,
            decade: data.decade,
          });
        }
      }
    }
  }
  return items;
}

async function loadVault(): Promise<string[]> {
  return getMemoryVaultTitles();
}

function saveVault(names: string[]) {
  setMemoryVaultTitles(names);
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function VaultDoor({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center mb-6">
      {/* Vault door visual */}
      <div className="relative w-20 h-20 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-[#5c4033]/30" />
        <div className="absolute inset-1 rounded-full border-2 border-[#8b7355]/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock size={28} className="text-[#5c4033]/60" />
        </div>
        {/* Hinge dots */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#5c4033]/30" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#5c4033]/30" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c4033]/30" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c4033]/30" />
      </div>
      <h2 className="old-title text-2xl md:text-3xl text-[#5c4033] text-center">
        ✦ Memory Vault ✦
      </h2>
      <p className="old-label text-[#8b7355] text-xs uppercase tracking-widest mt-1">
        {count} {count === 1 ? 'memory' : 'memories'} saved
      </p>
    </div>
  );
}

const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 0.5, -0.5, 1, 2.5, -2.5];

function PolaroidCard({
  item,
  isSaved,
  onToggle,
  index,
}: {
  item: FlatItem;
  isSaved: boolean;
  onToggle: () => void;
  index: number;
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div
        className={`sk-paper sk-noise p-2 pb-3 shadow-md border border-[#8b7355]/20 cursor-pointer group transition-shadow hover:shadow-lg`}
        style={{
          background: 'linear-gradient(145deg, #faf6f0 0%, #f0e8d8 100%)',
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={onToggle}
      >
        {/* Saved badge */}
        {isSaved && (
          <div className="absolute -top-1.5 -right-1.5 z-10 bg-[#5c4033] text-white text-[10px] old-label px-1.5 py-0.5 rounded-sm shadow">
            ✓ Saved
          </div>
        )}

        {/* Emoji header area (like a Polaroid photo area) */}
        <div className="bg-white/60 rounded-sm flex items-center justify-center h-16 mb-2 border border-[#8b7355]/10">
          <span className="text-3xl">{item.emoji}</span>
        </div>

        {/* Caption area */}
        <div className="px-1">
          <p className="old-typewriter text-[#5c4033] text-xs leading-tight truncate">
            {item.title}
          </p>
          <p className="old-label text-[9px] text-[#8b7355] mt-0.5 uppercase tracking-wide truncate">
            {item.category} · {item.decade}
          </p>
        </div>

        {/* Action button */}
        <div className="mt-1.5 flex justify-center">
          <button
            className={`flex items-center gap-1 text-[10px] old-label uppercase tracking-widest transition-colors ${
              isSaved
                ? 'text-red-400 hover:text-red-600'
                : 'text-[#8b7355] hover:text-[#5c4033]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSaved ? (
              <>
                <XIcon size={10} /> Remove
              </>
            ) : (
              <>
                <Save size={10} /> Save to Vault
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════

export default function MemoryVault() {
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const allItems = useMemo(() => getAllItems(), []);

  useEffect(() => {
    loadVault().then((titles) => {
      setSavedNames(titles);
      setMounted(true);
    });
  }, []);

  const toggleItem = useCallback((title: string) => {
    setSavedNames((prev) => {
      const next = prev.includes(title)
        ? prev.filter((n) => n !== title)
        : [...prev, title];
      saveVault(next);
      return next;
    });
  }, []);

  const savedItems = useMemo(
    () => allItems.filter((item) => savedNames.includes(item.title)),
    [allItems, savedNames],
  );

  if (!mounted) {
    return (
      <section className="py-8">
        <VaultDoor count={0} />
        <p className="old-body text-[#8b7355] text-center text-sm">Loading vault…</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <VaultDoor count={savedNames.length} />

      {/* ── My Vault ── */}
      {savedItems.length > 0 && (
        <div className="mb-8">
          <p className="old-label text-[10px] text-[#8b7355] uppercase tracking-widest text-center mb-4">
            My Vault
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto px-4">
            <AnimatePresence>
              {savedItems.map((item, i) => (
                <PolaroidCard
                  key={item.title}
                  item={item}
                  isSaved={true}
                  onToggle={() => toggleItem(item.title)}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── All Items ── */}
      <div>
        <p className="old-label text-[10px] text-[#8b7355] uppercase tracking-widest text-center mb-4">
          Suggested Memories — click 💾 to save
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto px-4">
          {allItems.map((item, i) => (
            <PolaroidCard
              key={item.title}
              item={item}
              isSaved={savedNames.includes(item.title)}
              onToggle={() => toggleItem(item.title)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}