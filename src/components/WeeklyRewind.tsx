'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, BookOpen, Camera, Gamepad2, Brain } from 'lucide-react';
import { getAllJournalEntries, getAllCameraPhotos, getReelReactions, getVisitCount } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   Weekly Rewind Summary
   Shows a nostalgic summary of the past week's activity.
   ═══════════════════════════════════════════════════ */

interface WeekStats {
  journalEntries: number;
  photosTaken: number;
  reelReactions: number;
  visits: number;
  topMood: string;
  journalTitles: string[];
}

const WEEKLY_MESSAGES = [
  'Another week in the books. Here is what you remembered.',
  'Your weekly rewind is ready. Take a look back.',
  'Seven days of memories, captured in rewind.',
  'Time flies when you are remembering the good old days.',
  'This week in nostalgia, brought to you by you.',
];

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

export default function WeeklyRewind() {
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [message] = useState(() => WEEKLY_MESSAGES[Math.floor(Math.random() * WEEKLY_MESSAGES.length)]);

  const loadStats = useCallback(async () => {
    try {
      const weekStart = getWeekStart().getTime();

      const [journalEntries, photos, reelReactions, visits] = await Promise.all([
        getAllJournalEntries(),
        getAllCameraPhotos(),
        getReelReactions(),
        getVisitCount(),
      ]);

      const weekJournals = journalEntries.filter(e => e.createdAt >= weekStart);
      const weekPhotos = photos.filter(p => p.created_at >= weekStart);

      // Count mood frequency
      const moodCounts: Record<string, number> = {};
      for (const entry of weekJournals) {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
      }
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      setStats({
        journalEntries: weekJournals.length,
        photosTaken: weekPhotos.length,
        reelReactions: Object.keys(reelReactions).length,
        visits,
        topMood,
        journalTitles: weekJournals.slice(0, 3).map(e => e.title),
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (!stats) return null;

  // Don't show if no activity at all
  if (stats.journalEntries === 0 && stats.photosTaken === 0 && stats.reelReactions === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sk-paper rounded-xl p-5 sk-noise relative overflow-hidden"
    >
      {/* Decorative tape */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#c4956a]/30 rounded-sm sk-noise"
        style={{ transform: 'translateX(-50%) rotate(1.5deg)' }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-[#8b5e3c]" />
        <h2 className="old-title text-lg font-black text-[#3d2b1f]">Weekly Rewind</h2>
        <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded">
          {getWeekStart().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – today
        </span>
      </div>

      <p className="old-body text-xs text-[#8b7355] mb-4 italic">"{message}"</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Journal Entries"
          value={String(stats.journalEntries)}
          color="#6b8e6b"
        />
        <StatCard
          icon={<Camera className="h-4 w-4" />}
          label="Photos Taken"
          value={String(stats.photosTaken)}
          color="#c4956a"
        />
        <StatCard
          icon={<Gamepad2 className="h-4 w-4" />}
          label="Reel Reactions"
          value={String(stats.reelReactions)}
          color="#8b5ec8"
        />
        <StatCard
          icon={<Brain className="h-4 w-4" />}
          label="Top Mood"
          value={stats.topMood || '—'}
          color="#b8845a"
        />
      </div>

      {/* Recent journal titles */}
      {stats.journalTitles.length > 0 && (
        <div className="sk-inset rounded-lg p-3">
          <p className="old-label text-[10px] uppercase text-[#8b7355] mb-2">This Week's Entries</p>
          <ul className="space-y-1">
            {stats.journalTitles.map((title, i) => (
              <li key={i} className="old-body text-xs text-[#5c4033] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#c4956a]" />
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="sk-inset rounded-lg p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="old-typewriter text-lg font-bold text-[#3d2b1f]" style={{ color }}>{value}</p>
        <p className="old-typewriter text-[9px] text-[#8b7355]">{label}</p>
      </div>
    </div>
  );
}
