'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen } from 'lucide-react';
import { getAllJournalEntries } from '@/lib/idb-store';
import type { JournalEntryRecord } from '@/lib/idb-store/types';
import { soundChime, soundPageTurn } from '@/lib/sounds';

interface HistoryItem {
  year: number;
  type: string;
  title: string;
  description: string;
  emoji: string;
}

interface ApiResponse {
  date: string;
  decade: string;
  birthYear: number;
  items: HistoryItem[];
}

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  movies:  { label: 'Movies',  bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-800 dark:text-amber-300' },
  music:   { label: 'Music',   bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-800 dark:text-rose-300' },
  tv:      { label: 'TV',      bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-800 dark:text-violet-300' },
  tech:    { label: 'Tech',    bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-800 dark:text-cyan-300' },
  culture: { label: 'Culture', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300' },
  toys:    { label: 'Toys',    bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
};

function getTypeStyle(type: string) {
  return TYPE_STYLES[type] || TYPE_STYLES.culture;
}

function formatDateTitle(dateStr: string): string {
  const [month, day] = dateStr.split('/').map(Number);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${months[(month || 1) - 1]} ${day || 1}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
};

export default function ThisDayInHistory({ birthYear }: { birthYear: number }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [personalMemories, setPersonalMemories] = useState<JournalEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch historical events
    fetch(`/api/this-day?birthYear=${birthYear}`)
      .then(res => res.json())
      .then(json => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });

    // Fetch personal journal entries from this month/day in previous years
    getAllJournalEntries().then((entries) => {
      if (cancelled) return;
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `-${month}-${day}`;
      const sameDayEntries = entries.filter(e => e.date.includes(todayStr));
      setPersonalMemories(sameDayEntries);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [birthYear]);

  // Play a nostalgic chime when the component first loads
  useEffect(() => {
    soundChime();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="sk-leather sk-noise relative rounded-xl p-4 sm:p-5 mb-6 overflow-hidden">
        <div className="flex items-center gap-2.5 mb-3">
          <CalendarDays className="h-5 w-5 text-amber-300" />
          <h2 className="old-typewriter text-amber-200 text-sm sm:text-base tracking-wider uppercase">
            On This Day
          </h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="sk-paper flex-shrink-0 w-64 sm:w-72 h-40 rounded-lg animate-pulse"
              style={{ opacity: 0.5 + i * 0.1 }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.items.length === 0) return null;

  return (
    <section className="sk-leather sk-noise relative rounded-xl p-4 sm:p-5 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-5 w-5 text-amber-300" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <h2 className="old-typewriter text-amber-200 text-sm sm:text-base tracking-wider uppercase">
              On This Day
            </h2>
            <span className="old-typewriter text-amber-300/70 text-xs">
              — {formatDateTitle(data.date)}, the {data.decade}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { soundPageTurn(); scroll('left'); }}
            className="p-1.5 rounded-md bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { soundPageTurn(); scroll('right'); }}
            className="p-1.5 rounded-md bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards scroll */}
      <motion.div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto sk-scrollbar pb-2 -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.items.map((item, idx) => {
          const style = getTypeStyle(item.type);
          return (
            <motion.article
              key={`${item.year}-${idx}`}
              className="sk-paper relative flex-shrink-0 w-64 sm:w-72 rounded-lg p-4 flex flex-col gap-2 cursor-default"
              style={{ scrollSnapAlign: 'start' }}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Year + type badge */}
              <div className="flex items-center justify-between">
                <span className="old-typewriter text-xs text-amber-700 dark:text-amber-500 font-bold">
                  {item.year}
                </span>
                <span
                  className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
                >
                  {style.label}
                </span>
              </div>

              {/* Emoji + title */}
              <div className="flex items-start gap-2.5">
                <span className="text-2xl mt-0.5 flex-shrink-0 leading-none" role="img" aria-label={item.type}>
                  {item.emoji}
                </span>
                <h3 className="old-title text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-tight">
                  {item.title}
                </h3>
              </div>

              {/* Description */}
              <p className="old-body text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </motion.article>
          );
        })}

        {/* Personal memories from this day */}
        {personalMemories.map((entry, idx) => (
          <motion.article
            key={`personal-${entry.id}`}
            className="sk-paper relative flex-shrink-0 w-64 sm:w-72 rounded-lg p-4 flex flex-col gap-2 cursor-default border-2 border-[#c4956a]/30"
            style={{ scrollSnapAlign: 'start' }}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-between">
              <span className="old-typewriter text-xs text-[#8b5e3c] font-bold">
                {entry.date.slice(0, 4)}
              </span>
              <span className="text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#c4956a]/15 text-[#8b5e3c]">
                Your Memory
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl mt-0.5 flex-shrink-0 leading-none">{entry.mood || '📝'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="old-title text-sm sm:text-base text-[#3d2b1f] leading-tight truncate">
                  {entry.title}
                </h3>
              </div>
            </div>
            <p className="old-body text-xs text-[#8b7355] leading-relaxed line-clamp-3">
              {entry.body}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
