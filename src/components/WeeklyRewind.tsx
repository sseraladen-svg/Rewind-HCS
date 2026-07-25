'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  BookOpen,
  Camera,
  Flame,
  Share2,
  Quote,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CircleDot,
} from 'lucide-react';
import {
  getAllJournalEntries,
  getAllCameraPhotos,
  getReelReactions,
  getVisitCount,
  getDB,
} from '@/lib/idb-store';
import { toast } from '@/hooks/use-toast';

/* ═══════════════════════════════════════════════════
   Weekly Rewind — Enhanced Nostalgia Summary
   Always visible. Never returns null.
   ═══════════════════════════════════════════════════ */

// ─── Data constants ─────────────────────────────────

const NOSTALGIA_FACTS = [
  'In 1998, Google received its first search query about the number of zeros in a googol.',
  'The first SMS was sent in December 1992. It said "Merry Christmas."',
  'In 1999, the Y2K bug panic caused $300 billion in preventative spending worldwide.',
  'The original PlayStation sold over 100 million units -- more than any Nintendo console at the time.',
  'AOL CDs were once so common that over 50% of all CDs produced worldwide were AOL trial discs.',
  'The Tamagotchi was invented by Aki Maita in 1996. Over 82 million have been sold.',
  'In 1997, Netflix was founded as a DVD-by-mail service. Blockbuster declined to buy it for $50M.',
  'The Furby, released in 1998, was so popular it sold 1.8 million units in its first year.',
  'In 1995, eBay was founded as "AuctionWeb." The first item sold was a broken laser pointer.',
  'The average American child in the 90s spent 3 hours a day watching TV -- twice today\'s average.',
];

const WEEKLY_QUOTES = [
  { text: 'Nostalgia is a file that removes the rough edges from the good old days.', author: 'Doug Larson' },
  { text: 'The best things in life are the people you love, the places you\'ve been, and the memories you\'ve made along the way.', author: 'Unknown' },
  { text: 'We do not remember days, we remember moments.', author: 'Cesare Pavese' },
  { text: 'Memory is the diary that we all carry about with us.', author: 'Oscar Wilde' },
  { text: 'The past is never dead. It\'s not even past.', author: 'William Faulkner' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOOD_COLORS: Record<string, string> = {
  happy: '#6b8e6b',
  sad: '#6b7e9e',
  excited: '#c4956a',
  calm: '#8b9e6b',
  nostalgic: '#b8845a',
  grateful: '#9e6b8e',
  anxious: '#9e8b6b',
  angry: '#9e6b6b',
  tired: '#8b8b6b',
  loved: '#c46b8e',
  hopeful: '#6b9e8e',
  lonely: '#7b7b9e',
  confused: '#9e9e6b',
  proud: '#8e6b9e',
  inspired: '#c46b6b',
};

const ENCOURAGING_MESSAGES = [
  'Room to grow this week!',
  'A fresh start awaits!',
  'Even quiet weeks tell a story.',
  'The best memories are still ahead.',
  'Every rewind starts somewhere.',
];

// ─── Helpers ────────────────────────────────────────

function getWeekStart(date?: Date): Date {
  const d = date ?? new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek);
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isSameDay(ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isYesterday(ts: number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(ts, yesterday.getTime());
}

function isToday(ts: number): boolean {
  return isSameDay(ts, Date.now());
}

// ─── Types ───────────────────────────────────────────

interface WeekStats {
  thisWeek: {
    journalCount: number;
    photoCount: number;
    reelReactions: number;
  };
  lastWeek: {
    journalCount: number;
    photoCount: number;
  };
  visits: number;
  topMood: string;
  moodByDay: { day: number; mood: string; label: string }[];
  journalTitles: string[];
  loaded: boolean;
}

interface VisitStreak {
  days: number;
  lastVisit: number;
}

// ─── Visit Streak Logic ──────────────────────────────

async function getVisitStreak(): Promise<VisitStreak> {
  try {
    const db = await getDB();
    const record = await db.get('era_skin', 'visit_streak');
    if (record) {
      try {
        const data = JSON.parse(record.skin_id);
        return { days: data.days ?? 0, lastVisit: data.lastVisit ?? 0 };
      } catch {
        return { days: 0, lastVisit: 0 };
      }
    }
  } catch {
    // silent
  }
  return { days: 0, lastVisit: 0 };
}

async function updateVisitStreak(): Promise<VisitStreak> {
  try {
    const db = await getDB();
    const record = await db.get('era_skin', 'visit_streak');
    let streak: VisitStreak;

    if (record) {
      try {
        const data = JSON.parse(record.skin_id);
        streak = { days: data.days ?? 0, lastVisit: data.lastVisit ?? 0 };
      } catch {
        streak = { days: 0, lastVisit: 0 };
      }
    } else {
      streak = { days: 0, lastVisit: 0 };
    }

    const now = Date.now();

    if (isToday(streak.lastVisit)) {
      // Already visited today, no change
      return streak;
    } else if (isYesterday(streak.lastVisit)) {
      // Consecutive day
      streak.days += 1;
      streak.lastVisit = now;
    } else {
      // Streak broken or first visit
      streak.days = 1;
      streak.lastVisit = now;
    }

    await db.put('era_skin', {
      id: 'visit_streak',
      skin_id: JSON.stringify({ days: streak.days, lastVisit: streak.lastVisit }),
    });

    return streak;
  } catch {
    return { days: 0, lastVisit: 0 };
  }
}

// ─── Component ──────────────────────────────────────

export default function WeeklyRewind() {
  const [stats, setStats] = useState<WeekStats>({
    thisWeek: { journalCount: 0, photoCount: 0, reelReactions: 0 },
    lastWeek: { journalCount: 0, photoCount: 0 },
    visits: 0,
    topMood: '',
    moodByDay: [],
    journalTitles: [],
    loaded: false,
  });
  const [streak, setStreak] = useState<VisitStreak>({ days: 0, lastVisit: 0 });

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const weekStart = startOfDay(getWeekStart(now));
      const lastWeekStart = startOfDay(new Date(weekStart));
      const twoWeeksAgo = lastWeekStart - 7 * 86400000;

      const [journalEntries, photos, reelReactions, visits] = await Promise.all([
        getAllJournalEntries(),
        getAllCameraPhotos(),
        getReelReactions(),
        getVisitCount(),
      ]);

      // This week counts
      const weekJournals = journalEntries.filter((e) => e.createdAt >= weekStart);
      const weekPhotos = photos.filter((p) => p.created_at >= weekStart);

      // Last week counts
      const lastWeekJournals = journalEntries.filter(
        (e) => e.createdAt >= twoWeeksAgo && e.createdAt < weekStart,
      );
      const lastWeekPhotos = photos.filter(
        (p) => p.created_at >= twoWeeksAgo && p.created_at < weekStart,
      );

      // Mood frequency
      const moodCounts: Record<string, number> = {};
      for (const entry of weekJournals) {
        if (entry.mood) {
          const key = entry.mood.toLowerCase();
          moodCounts[key] = (moodCounts[key] || 0) + 1;
        }
      }
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

      // Mood by day of week (Mon=0 .. Sun=6)
      const moodByDayMap: Record<number, { mood: string; label: string }> = {};
      for (const entry of weekJournals) {
        if (entry.mood) {
          const d = new Date(entry.createdAt);
          const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
          if (!moodByDayMap[dow]) {
            moodByDayMap[dow] = {
              mood: entry.mood.toLowerCase(),
              label: DAY_LABELS[dow],
            };
          }
        }
      }
      const moodByDay = DAY_LABELS.map((label, i) => moodByDayMap[i] ?? { day: i, mood: '', label });
      // Convert to array form
      const moodByDayArr = moodByDay.map((item) => ({
        day: DAY_LABELS.indexOf(item.label),
        mood: item.mood,
        label: item.label,
      }));

      setStats({
        thisWeek: {
          journalCount: weekJournals.length,
          photoCount: weekPhotos.length,
          reelReactions: Object.keys(reelReactions).length,
        },
        lastWeek: {
          journalCount: lastWeekJournals.length,
          photoCount: lastWeekPhotos.length,
        },
        visits,
        topMood,
        moodByDay: moodByDayArr,
        journalTitles: weekJournals.slice(0, 3).map((e) => e.title),
        loaded: true,
      });
    } catch {
      setStats((prev) => ({ ...prev, loaded: true }));
    }
  }, []);

  const loadStreak = useCallback(async () => {
    const updated = await updateVisitStreak();
    setStreak(updated);
  }, []);

  useEffect(() => {
    loadData();
    loadStreak();
  }, [loadData, loadStreak]);

  // ─── Computed values ─────────────────────────────

  const { thisWeek, lastWeek } = stats;

  const hasActivity =
    thisWeek.journalCount > 0 ||
    thisWeek.photoCount > 0 ||
    thisWeek.reelReactions > 0;

  // Nostalgia score 0-100
  const nostalgiaScore = useMemo(() => {
    if (!hasActivity) {
      // Playful base score when no activity
      return Math.floor(Math.random() * 16) + 10; // 10-25
    }
    let score = 0;
    score += Math.min(thisWeek.journalCount * 20, 60);
    score += Math.min(thisWeek.photoCount * 10, 30);
    score += Math.min(thisWeek.reelReactions * 5, 10);
    if (streak.days >= 3) score += 10;
    return Math.min(score, 100);
  }, [hasActivity, thisWeek, streak.days]);

  const scoreLabel = useMemo(() => {
    if (nostalgiaScore >= 80) return 'Nostalgia Master';
    if (nostalgiaScore >= 60) return 'Memory Keeper';
    if (nostalgiaScore >= 40) return 'Rewind Explorer';
    if (nostalgiaScore >= 20) return 'Fresh Starter';
    return 'Room to grow this week!';
  }, [nostalgiaScore]);

  // Rotating weekly fact
  const weeklyFact = useMemo(
    () => NOSTALGIA_FACTS[getWeekNumber() % NOSTALGIA_FACTS.length],
    [],
  );

  // Rotating weekly quote
  const weeklyQuote = useMemo(
    () => WEEKLY_QUOTES[getWeekNumber() % WEEKLY_QUOTES.length],
    [],
  );

  // Week range label
  const weekRangeLabel = useMemo(() => {
    const ws = getWeekStart();
    const today = new Date();
    const end = today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const start = ws.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${start} \u2013 ${end}`;
  }, []);

  // ─── Share handler ──────────────────────────────

  const handleShare = () => {
    toast({
      title: 'Weekly Rewind shared!',
      description: 'Your nostalgia summary has been shared.',
      duration: 2500,
    });
  };

  // ─── Render ──────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sk-paper rounded-xl p-5 sk-noise relative overflow-hidden"
    >
      {/* Decorative tape */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#c4956a]/30 rounded-sm sk-noise"
        style={{ transform: 'translateX(-50%) rotate(1.5deg)' }}
      />

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="h-5 w-5 text-[#8b5e3c]" />
        <h2 className="old-title text-lg font-black text-[#3d2b1f]">Weekly Rewind</h2>
        <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded ml-auto">
          {weekRangeLabel}
        </span>
      </div>

      {/* ── Nostalgia Score Circle ──────────────────── */}
      <div className="flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-32 h-32 flex items-center justify-center"
        >
          {/* SVG circular progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#d4c5a9"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset="0"
              className="opacity-40"
            />
            {/* Score arc */}
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={nostalgiaScore >= 60 ? '#6b8e6b' : nostalgiaScore >= 30 ? '#c4956a' : '#8b7355'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 56 * (1 - nostalgiaScore / 100),
              }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            />
          </svg>
          {/* Score number */}
          <div className="flex flex-col items-center z-10">
            <motion.span
              className="old-title text-3xl font-black"
              style={{
                color: nostalgiaScore >= 60 ? '#6b8e6b' : nostalgiaScore >= 30 ? '#c4956a' : '#8b7355',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {nostalgiaScore}
            </motion.span>
            <span className="old-label text-[8px] uppercase text-[#8b7355]">Nostalgia Score</span>
          </div>
        </motion.div>
        <motion.p
          className="old-typewriter text-xs text-[#8b5e3c] mt-2 font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {scoreLabel}
        </motion.p>
      </div>

      {/* ── Streak + Stats Row ──────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Visit Streak */}
        <motion.div
          className="sk-inset rounded-lg p-3 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#c46b3a15' }}
          >
            <Flame className="h-4 w-4" style={{ color: '#c46b3a' }} />
          </div>
          <div>
            <p className="old-typewriter text-lg font-bold" style={{ color: '#c46b3a' }}>
              {streak.days}
            </p>
            <p className="old-typewriter text-[9px] text-[#8b7355]">Day Streak</p>
          </div>
        </motion.div>

        {/* Journal Entries */}
        <motion.div
          className="sk-inset rounded-lg p-3 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#6b8e6b15' }}
          >
            <BookOpen className="h-4 w-4" style={{ color: '#6b8e6b' }} />
          </div>
          <div>
            <p className="old-typewriter text-lg font-bold" style={{ color: '#6b8e6b' }}>
              {thisWeek.journalCount}
            </p>
            <p className="old-typewriter text-[9px] text-[#8b7355]">Journal Entries</p>
          </div>
        </motion.div>

        {/* Photos */}
        <motion.div
          className="sk-inset rounded-lg p-3 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#c4956a15' }}
          >
            <Camera className="h-4 w-4" style={{ color: '#c4956a' }} />
          </div>
          <div>
            <p className="old-typewriter text-lg font-bold" style={{ color: '#c4956a' }}>
              {thisWeek.photoCount}
            </p>
            <p className="old-typewriter text-[9px] text-[#8b7355]">Photos Taken</p>
          </div>
        </motion.div>

        {/* Top Mood */}
        <motion.div
          className="sk-inset rounded-lg p-3 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#b8845a15' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#b8845a' }} />
          </div>
          <div>
            <p className="old-typewriter text-lg font-bold capitalize" style={{ color: '#b8845a' }}>
              {stats.topMood || '--'}
            </p>
            <p className="old-typewriter text-[9px] text-[#8b7355]">Top Mood</p>
          </div>
        </motion.div>
      </div>

      {/* ── This Week vs Last Week Comparison ────────── */}
      <motion.div
        className="sk-inset rounded-lg p-4 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="old-label text-[10px] uppercase text-[#8b7355] mb-3">This Week vs Last Week</p>

        {/* Journals comparison */}
        <ComparisonBar
          label="Journal Entries"
          thisWeek={thisWeek.journalCount}
          lastWeek={lastWeek.journalCount}
          color="#6b8e6b"
          delay={0.8}
        />

        {/* Photos comparison */}
        <ComparisonBar
          label="Photos"
          thisWeek={thisWeek.photoCount}
          lastWeek={lastWeek.photoCount}
          color="#c4956a"
          delay={0.9}
        />
      </motion.div>

      {/* ── Mood Tracker Mini Chart ────────────────── */}
      {stats.moodByDay.some((d) => d.mood) && (
        <motion.div
          className="sk-inset rounded-lg p-4 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <p className="old-label text-[10px] uppercase text-[#8b7355] mb-3">Mood Tracker</p>
          <div className="flex items-center justify-between gap-1">
            {stats.moodByDay.map((entry, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="old-typewriter text-[8px] text-[#8b7355]">{entry.label}</span>
                {entry.mood ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.06, type: 'spring', stiffness: 300 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: MOOD_COLORS[entry.mood] || '#8b7355',
                      boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${MOOD_COLORS[entry.mood] || '#8b7355'}40`,
                    }}
                  >
                    <CircleDot className="w-3 h-3 text-white/80" />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-dashed border-[#d4c5a9] opacity-40" />
                )}
                {entry.mood && (
                  <span className="old-typewriter text-[7px] text-[#8b7355] capitalize truncate max-w-[36px]">
                    {entry.mood}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent journal titles ──────────────────── */}
      <AnimatePresence>
        {stats.journalTitles.length > 0 && (
          <motion.div
            className="sk-inset rounded-lg p-3 mb-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="old-label text-[10px] uppercase text-[#8b7355] mb-2">This Week&apos;s Entries</p>
            <ul className="space-y-1">
              {stats.journalTitles.map((title, i) => (
                <li key={i} className="old-body text-xs text-[#5c4033] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a] flex-shrink-0" />
                  {title}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nostalgia Fact Card ─────────────────────── */}
      <motion.div
        className="sk-inset rounded-lg p-4 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#8b5ec815' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#8b5ec8' }} />
          </div>
          <div>
            <p className="old-label text-[10px] uppercase text-[#8b7355] mb-1">Nostalgia Fact of the Week</p>
            <p className="old-body text-xs text-[#5c4033] leading-relaxed italic">
              &ldquo;{weeklyFact}&rdquo;
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Weekly Quote Card ───────────────────────── */}
      <motion.div
        className="sk-inset rounded-lg p-4 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#b8845a15' }}
          >
            <Quote className="h-3.5 w-3.5" style={{ color: '#b8845a' }} />
          </div>
          <div>
            <p className="old-label text-[10px] uppercase text-[#8b7355] mb-1">Weekly Rewind Quote</p>
            <p className="old-body text-xs text-[#5c4033] leading-relaxed italic">
              &ldquo;{weeklyQuote.text}&rdquo;
            </p>
            <p className="old-typewriter text-[9px] text-[#8b7355] mt-1">-- {weeklyQuote.author}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Share Button ────────────────────────────── */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          onClick={handleShare}
          className="sk-btn old-btn px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-semibold"
        >
          <Share2 className="h-4 w-4" />
          Share Weekly Rewind
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════ */

function ComparisonBar({
  label,
  thisWeek,
  lastWeek,
  color,
  delay,
}: {
  label: string;
  thisWeek: number;
  lastWeek: number;
  color: string;
  delay: number;
}) {
  const maxVal = Math.max(thisWeek, lastWeek, 1);
  const thisPct = (thisWeek / maxVal) * 100;
  const lastPct = (lastWeek / maxVal) * 100;

  const TrendIcon =
    thisWeek > lastWeek ? TrendingUp : thisWeek < lastWeek ? TrendingDown : Minus;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="old-typewriter text-[9px] text-[#5c4033] font-bold">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="old-typewriter text-[8px] text-[#8b7355]">
            This: {thisWeek} | Last: {lastWeek}
          </span>
          <TrendIcon className="w-3 h-3" style={{ color: thisWeek >= lastWeek ? '#6b8e6b' : '#9e6b6b' }} />
        </div>
      </div>

      {/* This week bar */}
      <div className="h-2 rounded-full bg-[#e8dcc8] mb-1 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(thisPct, thisWeek > 0 ? 8 : 0)}%` }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Last week bar (lighter) */}
      <div className="h-1.5 rounded-full bg-[#e8dcc8] overflow-hidden">
        <motion.div
          className="h-full rounded-full opacity-40"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(lastPct, lastWeek > 0 ? 8 : 0)}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
