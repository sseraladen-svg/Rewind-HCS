'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nostalgiaData, DecadeData } from '@/lib/nostalgia-data';
import { ChevronDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Era config
// ═══════════════════════════════════════════════════════════════

const ERA_CONFIG: Record<string, { key: string; label: string; emoji: string; vibe: string; bgHint: string }> = {
  "1970s": {
    key: "1970s",
    label: "The 1970s",
    emoji: "🌈",
    vibe: "Bell bottoms, disco balls, and Saturday morning cartoons",
    bgHint: "bg-amber-50/60 border-amber-200/50",
  },
  "1980s": {
    key: "1980s",
    label: "The 1980s",
    emoji: "🕹️",
    vibe: "Neon lights, synth music, and the dawn of gaming",
    bgHint: "bg-fuchsia-50/60 border-fuchsia-200/50",
  },
  "1990s": {
    key: "1990s",
    label: "The 1990s",
    emoji: "🎸",
    vibe: "Grunge, dial-up internet, and the golden age of cartoons",
    bgHint: "bg-emerald-50/60 border-emerald-200/50",
  },
  "2000s": {
    key: "2000s",
    label: "The 2000s",
    emoji: "💿",
    vibe: "Y2K panic, flip phones, and the rise of social media",
    bgHint: "bg-sky-50/60 border-sky-200/50",
  },
  "2010s": {
    key: "2010s",
    label: "The 2010s",
    emoji: "📱",
    vibe: "Smartphones, streaming, and the meme revolution",
    bgHint: "bg-violet-50/60 border-violet-200/50",
  },
};

const CATEGORY_KEYS: (keyof DecadeData)[] = [
  'cartoons', 'toys', 'music', 'movies', 'snacks', 'games', 'trends', 'schoolLife', 'tech',
];

const CATEGORY_LABELS: Record<string, string> = {
  cartoons: 'Cartoons',
  toys: 'Toys',
  music: 'Music',
  movies: 'Movies',
  snacks: 'Snacks',
  games: 'Games',
  trends: 'Trends',
  schoolLife: 'School Life',
  tech: 'Tech',
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function getQuickStats(data: DecadeData) {
  const stats: string[] = [];
  for (const cat of CATEGORY_KEYS) {
    const items = data[cat];
    if (Array.isArray(items) && items.length > 0) {
      stats.push(`${items.length} ${CATEGORY_LABELS[cat]}`);
    }
  }
  return stats;
}

function getCategoryCounts(data: DecadeData) {
  const counts: { label: string; count: number }[] = [];
  for (const cat of CATEGORY_KEYS) {
    const items = data[cat];
    if (Array.isArray(items) && items.length > 0) {
      counts.push({ label: CATEGORY_LABELS[cat], count: items.length });
    }
  }
  return counts;
}

function getTopFive(data: DecadeData) {
  const pool: { title: string; emoji: string; category: string }[] = [];
  for (const cat of CATEGORY_KEYS) {
    const items = data[cat];
    if (Array.isArray(items)) {
      for (const item of items) {
        pool.push({ title: item.title, emoji: item.emoji, category: item.category });
      }
    }
  }
  // Simple deterministic "random" pick — take one from each of the first 5 non-empty categories
  const picked: typeof pool = [];
  const usedCats = new Set<string>();
  for (const item of pool) {
    if (!usedCats.has(item.category) && picked.length < 5) {
      picked.push(item);
      usedCats.add(item.category);
    }
  }
  return picked;
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function EraPods() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const decades = useMemo(() => {
    return Object.keys(ERA_CONFIG).filter((k) => nostalgiaData[k]);
  }, []);

  function toggle(key: string) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  return (
    <section className="py-8">
      <h2 className="old-title text-2xl md:text-3xl text-[#5c4033] text-center mb-2">
        ✦ Era Pods ✦
      </h2>
      <p className="old-label text-[#8b7355] text-center mb-6 text-xs uppercase tracking-widest">
        Click a decade to dive deeper
      </p>

      <div className="space-y-3 max-w-3xl mx-auto px-4">
        {decades.map((key) => {
          const config = ERA_CONFIG[key];
          const data = nostalgiaData[key];
          const isOpen = expanded === key;
          const stats = getQuickStats(data);
          const catCounts = getCategoryCounts(data);
          const topFive = getTopFive(data);

          return (
            <motion.div
              key={key}
              layout
              className={`sk-paper sk-noise rounded-lg border cursor-pointer overflow-hidden transition-colors ${config.bgHint}`}
              onClick={() => toggle(key)}
            >
              {/* Collapsed header */}
              <div className="flex items-center gap-4 p-4 md:p-5 select-none">
                <span className="text-3xl md:text-4xl flex-shrink-0">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="old-title text-lg md:text-xl text-[#5c4033] leading-tight">
                    {config.label}
                  </h3>
                  <p className="old-body text-[#8b7355] text-xs mt-0.5">
                    {stats.slice(0, 4).join(' · ')}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-[#8b7355]"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </div>

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-5 pb-5 border-t border-[#8b7355]/20 pt-4 space-y-4">
                      {/* Vibe check */}
                      <div className="sk-paper-aged rounded-md p-3">
                        <p className="old-label text-[10px] text-[#8b7355] uppercase tracking-widest mb-1">
                          Vibe Check
                        </p>
                        <p className="old-typewriter text-[#5c4033] text-sm italic">
                          &quot;{config.vibe}&quot;
                        </p>
                      </div>

                      {/* Category breakdown */}
                      <div>
                        <p className="old-label text-[10px] text-[#8b7355] uppercase tracking-widest mb-2">
                          Category Breakdown
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {catCounts.map((c) => (
                            <span
                              key={c.label}
                              className="sk-paper rounded px-2 py-1 text-[#5c4033] text-xs old-body"
                            >
                              {c.label}: <strong>{c.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Top 5 */}
                      <div>
                        <p className="old-label text-[10px] text-[#8b7355] uppercase tracking-widest mb-2">
                          Top 5 from this era
                        </p>
                        <ul className="space-y-1.5">
                          {topFive.map((item) => (
                            <li
                              key={item.title}
                              className="flex items-center gap-2 old-body text-[#5c4033] text-sm"
                            >
                              <span className="text-base">{item.emoji}</span>
                              <span className="flex-1">{item.title}</span>
                              <span className="old-label text-[10px] text-[#8b7355] uppercase">
                                {item.category}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}