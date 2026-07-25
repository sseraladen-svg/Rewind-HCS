'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Gamepad2, BookOpen, Pin,
  ChevronRight, ArrowLeft, RefreshCw, Brain, User, LogOut, Settings, CheckCircle2,
  Clapperboard, Phone, Film, Camera, ImageIcon, SearchIcon,
} from 'lucide-react';
import {
  nostalgiaData, getDecadeForYear, getPersonalTimeline,
  type DecadeData,
} from '@/lib/nostalgia-data';
import OldJournal from '@/components/OldJournal';

import OldTransitionLoader, { triggerOldLoader, hideOldLoader } from '@/components/OldTransitionLoader';
import SearchOverlay from '@/components/SearchOverlay';
import { MemoryReelFeed } from '@/components/memory-reel';
import LocalDataBadge from '@/components/ui/LocalDataBadge';
import AuthModal from '@/components/AuthModal';
import AiInsightsPanel from '@/components/AiInsightsPanel';
import GamesHub from '@/components/GamesHub';

import ContactsTab from '@/components/ContactsTab';
import MoviesTab from '@/components/MoviesTab';
import MemoryTab from '@/components/MemoryTab';
import VintageCamera from '@/components/VintageCamera';
import ShareRewind from '@/components/ShareRewind';
import ThisDayInHistory from '@/components/ThisDayInHistory';
import SettingsTab from '@/components/SettingsTab';
import RecentMemoriesStrip from '@/components/RecentMemoriesStrip';
import PhotoTimeline from '@/components/PhotoTimeline';
import MemoryBoard from '@/components/MemoryBoard';
import { runMigration } from '@/lib/idb-store/migrate';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useSession, signOut } from 'next-auth/react';
import { useSync } from '@/hooks/useSync';
import { SessionProvider } from 'next-auth/react';
import { getDB } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   CRT / VHS LOADING SCREEN
   ═══════════════════════════════════════════════════ */
function CrtLoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0); // 0=boot, 1=title, 2=fading
  const [bootLines, setBootLines] = useState<string[]>([]);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allBootLines = useMemo(() => [
    'BIOS v2.4 — Nostalgia Systems Inc.',
    'POST: Memory test... 640K OK',
    'Detecting floppy drives... A: OK  B: OK',
    'Loading REWIND.EXE...',
    'Mounting childhood memories... 47% complete',
    'Indexing nostalgia database...',
    'Rewinding time...',
    'Loading good old days... 83% complete',
    'Ready.',
  ], []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Reveal boot lines one by one
    allBootLines.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (i === allBootLines.length - 1) {
          // Last line — show title after a beat
          timers.push(setTimeout(() => setPhase(1), 1000));
        }
      }, 500 + i * 500));
    });

    // Auto-dismiss after title phase
    fadeTimerRef.current = setTimeout(() => {
      setPhase(2);
      setTimeout(onDone, 800);
    }, 7000);

    return () => {
      timers.forEach(clearTimeout);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [allBootLines, onDone]);

  return (
    <div className={`crt-screen ${phase === 2 ? 'crt-fadeout' : 'crt-flicker'}`}>
      <div className="crt-scanlines" />
      <div className="vhs-noise" />
      <div className="vhs-tracking" />
      <div className="vhs-tracking" style={{ animationDelay: '1.2s', opacity: 0.5 }} />

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 w-full max-w-xl">
        {/* Boot lines */}
        <div className="space-y-1 sm:space-y-1.5 min-h-[120px] sm:min-h-[180px] w-full">
          {bootLines.map((line, i) => (
            <div
              key={i}
              className="boot-line text-[10px] sm:text-xs md:text-[0.75rem]"
              style={{ animationDelay: '0s' }}
            >
              {line}
              {i === bootLines.length - 1 && (
                <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-3.5 bg-[#c4956a] ml-0.5 align-middle"
                  style={{ animation: 'blink-cursor 0.6s step-end infinite' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0 }}
            className="text-center mt-1 sm:mt-2 w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black crt-glow old-title tracking-wider" style={{ color: '#c4956a' }}>
              REWIND
            </h1>
            <div className="loading-bar-track sm:loading-bar-track-md mt-3 sm:mt-4 mx-auto">
              <div className="loading-bar-fill" style={{ animationDuration: '3.5s' }} />
            </div>
            <p className="old-typewriter text-[8px] sm:text-[10px] mt-2 sm:mt-3" style={{ color: 'rgba(196,149,106,0.5)' }}>
              <span style={{ animation: 'blink-cursor 0.8s step-end infinite' }}>_</span>
              {' '}press any key to continue_
            </p>
          </motion.div>
        )}
      </div>

      {/* VHS timestamp corner */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
        <span className="old-typewriter text-[8px] sm:text-[10px]" style={{ color: 'rgba(196,149,106,0.35)' }}>
          SP 0:00:00
        </span>
      </div>
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" style={{ animation: 'blink-cursor 1s step-end infinite' }} />
        <span className="old-typewriter text-[8px] sm:text-[10px]" style={{ color: 'rgba(196,149,106,0.4)' }}>
          REC
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DUST MOTES (hydration-safe, uses useEffect)
   ═══════════════════════════════════════════════════ */
function DustMotes() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const motes = useMemo(() => {
    if (!mounted) return [];
    const colors = ['#c4956a', '#8b5e3c', '#d4a574', '#e8c9a0', '#b8845a'];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      w: 2 + Math.random() * 6,
      h: 2 + Math.random() * 6,
      l: Math.random() * 100,
      t: Math.random() * 100,
      bg: colors[i % 5],
      delay: Math.random() * 25,
      dur: 20 + Math.random() * 20,
    }));
  }, [mounted]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute rounded-full opacity-15 animate-[float_25s_infinite_linear]"
          style={{
            width: `${m.w}px`,
            height: `${m.h}px`,
            left: `${m.l}%`,
            top: `${m.t}%`,
            background: m.bg,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO / LANDING (SKEUOMORPHIC)
   ═══════════════════════════════════════════════════ */
function HeroSection({ onSubmit }: { onSubmit: (year: number) => void }) {
  const [year, setYear] = useState('');
  const [hoveredDecade, setHoveredDecade] = useState<string | null>(null);
  const [tapeRotate] = useState(() => -2 + Math.random() * 4);

  const handleSubmit = () => {
    const y = parseInt(year);
    if (y >= 1970 && y <= 2019) onSubmit(y);
  };

  const decades = Object.values(nostalgiaData);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <DustMotes />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 z-10"
      >
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl md:text-8xl mb-3"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
        >
          📼
        </motion.div>
        <h1 className="old-title text-5xl md:text-7xl font-black tracking-tight mb-3 text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(180deg, #5c4033 0%, #8b5e3c 40%, #c4956a 100%)',
          }}
        >
          Rewind
        </h1>
        <p className="old-body text-base md:text-lg text-[#8b7355] max-w-md mx-auto leading-relaxed">
          Take a trip back to the days when life was simple.
          <br className="hidden md:block" />
          Remember who you were before the world told you who to be.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
        className="z-10 w-full max-w-sm"
      >
        <div className="sk-paper rounded-lg p-6 sk-tape relative overflow-hidden sk-noise" style={{ '--tape-rotate': `${tapeRotate}deg` } as React.CSSProperties}>
          <label className="old-label block text-sm font-bold text-[#5c4033] mb-3 text-center">
            When were you born?
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1970}
              max={2019}
              placeholder="e.g. 1992"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="sk-inset old-typewriter flex-1 text-center text-2xl font-bold rounded-lg p-3 text-[#5c4033] focus:outline-none transition-shadow focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_0_2px_#8b5e3c]"
              aria-label="Birth year"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="sk-leather old-btn w-full mt-4 text-[#faf6eb] font-bold text-lg py-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
          >
            <Clock className="h-5 w-5" />
            Take Me Back
          </button>
          <p className="old-typewriter text-xs text-center text-[#8b7355] mt-3 font-medium">
            1970 – 2019 &nbsp;·&nbsp; Your memories, your era
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-3 mt-8 z-10 max-w-lg"
      >
        {decades.map((d, i) => (
          <motion.button
            key={d.decade}
            onMouseEnter={() => setHoveredDecade(d.decade)}
            onMouseLeave={() => setHoveredDecade(null)}
            onClick={() => {
              const y = parseInt(d.years.split('–')[0]);
              setYear(String(y));
              onSubmit(y);
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="sk-paper old-typewriter rounded-lg px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-200 relative overflow-hidden sk-noise"
            style={{
              borderColor: hoveredDecade === d.decade ? d.color : '#c4b594',
              color: hoveredDecade === d.decade ? '#5c4033' : '#8b7355',
              boxShadow: hoveredDecade === d.decade
                ? `0 4px 16px ${d.color}40, 0 1px 3px rgba(0,0,0,0.1)`
                : '0 2px 6px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.06)',
            }}
          >
            {d.decade}
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="old-body text-center text-[#8b7355] text-sm mt-8 z-10 max-w-sm leading-relaxed"
      >
        Everybody is running for jobs, money, markets…
        <br />but you&apos;re still <span className="old-title font-extrabold text-[#5c4033]">human</span>. Take a breath. Remember the good days.
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   QUOTE BANNER
   ═══════════════════════════════════════════════════ */
function QuoteBanner({ quotes }: { quotes: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 8000);
    return () => clearInterval(t);
  }, [quotes.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="sk-lined p-4 rounded-lg old-quote text-[#5c4033] text-sm md:text-base text-center"
      >
        &ldquo;{quotes[idx]}&rdquo;
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   PERSONAL TIMELINE
   ═══════════════════════════════════════════════════ */
function PersonalTimeline({ birthYear }: { birthYear: number }) {
  const timeline = getPersonalTimeline(birthYear);
  return (
    <div className="space-y-4">
      {timeline.map((entry, i) => {
        const d = nostalgiaData[entry.decade];
        return (
          <motion.div
            key={entry.decade}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="sk-paper rounded-lg p-4 flex items-center gap-4 sk-noise relative overflow-hidden" style={{ '--tape-rotate': `${-3 + i * 2}deg` } as React.CSSProperties}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 old-title"
                style={{
                  background: `linear-gradient(135deg, ${d.color}, ${d.color}cc)`,
                  boxShadow: `0 3px 8px ${d.color}50, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              >
                {entry.age.replace('Age ', '')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="old-heading font-extrabold text-sm text-[#3d2b1f]">{entry.decade}</span>
                  <span className="sk-vhs-label old-label text-[10px] font-bold text-[#8b7355] px-2 py-0.5 rounded">{entry.age}</span>
                </div>
                <p className="old-body text-xs text-[#8b7355] mt-0.5">{entry.label}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#b8a888]" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */
function getDecadeTheme(birthYear: number): string {
  const decade = Math.floor(birthYear / 10) * 10;
  if (decade === 1980) return '80s';
  if (decade === 1990) return '90s';
  if (decade === 2000) return '2000s';
  return '';
}

const DECADE_BG: Record<string, string> = {
  '80s': '#0a0a0a',
  '90s': '#c0c0c0',
  '2000s': '#d6eaff',
};

function Dashboard({ birthYear, onBack }: { birthYear: number; onBack: () => void }) {
  const decadeKey = getDecadeForYear(birthYear);
  const data = nostalgiaData[decadeKey];
  const decadeTheme = getDecadeTheme(birthYear);
  const [activeTab, setActiveTab] = useState('journal');
  const [showReel, setShowReel] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showShareRewind, setShowShareRewind] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { data: session } = useSession();
  const { syncStatus, syncNow } = useSync();

  // Keyboard shortcut: Cmd+K / Ctrl+K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger old-style cassette loader when switching tabs
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    // Reel opens as a fullscreen overlay instead of tab switch
    if (tabId === 'reel') {
      triggerOldLoader('Threading the reel...');
      const timer = setTimeout(() => {
        setShowReel(true);
        hideOldLoader();
      }, 750);
      return;
    }
    triggerOldLoader();
    const timer = setTimeout(() => {
      setActiveTab(tabId);
      setTimeout(() => hideOldLoader(), 300);
    }, 900 + Math.random() * 600);
    // Cleanup — stored in a ref so it can be cancelled on unmount
    const ref = { current: timer };
    return () => clearTimeout(ref.current);
  }, [activeTab]);

  const tabs = [
    { id: 'reel', label: 'Reel', icon: <Clapperboard className="h-4 w-4" /> },
    { id: 'movies', label: 'Movies', icon: <Film className="h-4 w-4" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 className="h-4 w-4" /> },
    { id: 'contacts', label: 'Contacts', icon: <Phone className="h-4 w-4" /> },
    { id: 'memory', label: 'Memory', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      data-decade-theme={decadeTheme || undefined}
      style={{ position: 'relative' as const, background: DECADE_BG[decadeTheme || ''] || undefined, overflowX: 'hidden' as const }}
    >
      {/* Header - wood grain */}
      <header className="sticky top-0 z-30 sk-wood px-2 py-0">
        <div className="max-w-5xl mx-auto py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <div className="h-4 w-px bg-[#a08868]" />
            <h2 className="old-title font-black text-base text-[#faf6eb] tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Rewind
            </h2>
            <button
              onClick={() => setShowSearch(true)}
              className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Search (⌘K)"
            >
              <SearchIcon className="h-3.5 w-3.5 text-[#5c4033]" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="sk-vhs-label old-typewriter text-[10px] font-bold px-3 py-1 rounded" style={{ color: data.color, borderColor: data.color }}>
              {data.decade} &middot; Born {birthYear}
            </div>
            <button
                onClick={() => setShowCamera(true)}
                className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Camera"
              >
                <Camera className="h-3.5 w-3.5 text-[#5c4033]" />
              </button>
            {/* Cloud sync button */}
            {session?.user && (
              <button
                  onClick={syncNow}
                  className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
                  title={syncStatus === 'synced' ? 'Synced!' : syncStatus === 'error' ? 'Sync failed' : 'Cloud sync'}
                >
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="h-3.5 w-3.5 text-[#5c4033] animate-spin" />
                  ) : syncStatus === 'synced' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : syncStatus === 'error' ? (
                    <RefreshCw className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-[#5c4033]" />
                  )}
                </button>
            )}

            <button
                onClick={() => setShowSettings(true)}
                className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5 text-[#5c4033]" />
              </button>
            {/* Auth button */}
            {session?.user ? (
              <div className="flex items-center gap-1.5">
                <span className="old-typewriter text-[9px] text-[#6b6b6b] hidden sm:inline max-w-[80px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#5c4033]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="sk-btn old-btn px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 sk-cork min-h-0">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-5 pb-20">
          {/* Hero */}
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
            <div className="sk-paper rounded-xl p-5 text-center sk-noise relative overflow-hidden">
              <h1 className="old-title text-3xl md:text-4xl font-black mb-1" style={{ color: data.color, textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                {data.decade}
              </h1>
              <p className="old-body text-sm text-[#8b7355] font-medium">{data.tagline}</p>
            </div>
          </motion.section>

          {/* Quote */}
          <section className="mb-6">
            <QuoteBanner quotes={data.quotes} />
          </section>

          {/* This Day in History */}
          <section className="mb-6">
            <ThisDayInHistory birthYear={birthYear} />
          </section>

          {/* Recent Memories Strip (only shows if photos exist) */}
          <RecentMemoriesStrip onOpenMemory={() => handleTabChange('memory')} />

          {/* Tab bar - metal */}
          <div className="sk-metal rounded-xl p-1 mb-6 flex gap-1 shadow-[0_3px_8px_rgba(0,0,0,0.2)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer old-typewriter ${
                  activeTab === tab.id
                    ? 'sk-paper shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] text-[#3d2b1f]'
                    : 'text-[#6b6b6b] hover:text-[#3d2b1f] hover:bg-white/20'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ═══ MOVIES TAB ═══ */}
          {activeTab === 'movies' && (
            <AnimatePresence mode="wait">
              <motion.div key="movies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MoviesTab birthYear={birthYear} />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ JOURNAL TAB ═══ */}
          {activeTab === 'journal' && (
            <AnimatePresence mode="wait">
              <motion.div key="journal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-5">
                  <p className="old-body text-sm text-[#5c4033] font-medium">Put pen to paper. Let your memories breathe in ink.</p>
                </div>
                <OldJournal />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ GAMES TAB ═══ */}
          {activeTab === 'games' && (
            <AnimatePresence mode="wait">
              <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GamesHub data={data} />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ CONTACTS TAB ═══ */}
          {activeTab === 'contacts' && (
            <AnimatePresence mode="wait">
              <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ContactsTab />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ MEMORY TAB ═══ */}
          {activeTab === 'memory' && (
            <AnimatePresence mode="wait">
              <motion.div key="memory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MemoryTab onOpenCamera={() => setShowCamera(true)} onOpenShareRewind={() => setShowShareRewind(true)} />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ TIMELINE TAB ═══ (includes AI Insights) */}
          {activeTab === 'timeline' && (
            <AnimatePresence mode="wait">
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: data.color }} /> Your Life Timeline
                </h2>
                <PersonalTimeline birthYear={birthYear} />

                <div className="mt-10 mb-4">
                  <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Camera className="h-4 w-4" style={{ color: data.color }} /> Photo Timeline
                  </h2>
                  <PhotoTimeline />
                  </div>

                {/* Memory Board */}
                <div className="mt-10 mb-4">
                  <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Pin className="h-4 w-4" style={{ color: data.color }} /> Shared Memory Board
                  </h2>
                  <MemoryBoard />
                </div>

                <div className="mt-10 mb-4">
                  <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Brain className="h-4 w-4" style={{ color: data.color }} /> AI Insights
                  </h2>
                  <AiInsightsPanel birthYear={birthYear} />
                  <div className="mt-4 sk-paper rounded-xl p-4 sk-noise text-center">
                    <p className="old-body text-xs text-[#8b7355]">
                      {session?.user
                        ? 'Insights are generated locally using AI. They never leave your device.'
                        : 'Sign in to save your insights history and access them from any device.'}
                    </p>
                    {!session?.user && (
                      <button
                        onClick={() => setShowAuth(true)}
                        className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold mt-3 cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <User className="h-3.5 w-3.5" /> Create Account
                      </button>
                    )}
                  </div>
                </div>

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
                  <div className="sk-paper rounded-xl p-6 sk-noise relative overflow-hidden max-w-md mx-auto">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-5xl mb-3"
                    >🫂</motion.div>
                    <h3 className="old-title text-lg font-black text-[#3d2b1f] mb-2">You made it through.</h3>
                    <p className="old-body text-xs text-[#8b7355] leading-relaxed">
                      Every memory on this page is a piece of who you are. The world moves fast, but your roots are deep. You came from simpler times, and that strength lives in you still. Take care of yourself.
                    </p>
                    <button onClick={onBack} className="sk-btn old-btn px-5 py-2.5 rounded-lg font-bold mt-4 cursor-pointer inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Start Over
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      <footer className="sk-leather px-4 py-3 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-2">
          <p className="old-typewriter text-[10px] text-[#d4a574] font-medium" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>
            Rewind — because you&apos;re human, not a machine. Take it easy.
          </p>
          <LocalDataBadge />
          <button
            onClick={() => setShowSettings(true)}
            className="old-typewriter text-[9px] text-[#a89878] hover:text-[#d4a574]
              transition-colors cursor-pointer underline underline-offset-2 decoration-dotted"
          >
            Settings
          </button>
        </div>
      </footer>

      {/* ═══ MEMORY REEL OVERLAY ═══ */}
      <AnimatePresence>
        {showReel && <MemoryReelFeed birthYear={birthYear} onClose={() => setShowReel(false)} />}
      </AnimatePresence>

      {/* ═══ CAMERA OVERLAY ═══ */}
      <AnimatePresence>
        {showCamera && <VintageCamera onClose={() => setShowCamera(false)} />}
      </AnimatePresence>

      {/* ═══ SHARE REWIND OVERLAY ═══ */}
      <AnimatePresence>
        {showShareRewind && <ShareRewind open={showShareRewind} onClose={() => setShowShareRewind(false)} />}
      </AnimatePresence>

      {/* ═══ AUTH MODAL OVERLAY ═══ */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            isOpen={showAuth}
            onClose={() => setShowAuth(false)}
            onAuthSuccess={() => {}}
          />
        )}
      </AnimatePresence>

      {/* ═══ SETTINGS OVERLAY ═══ */}
      <AnimatePresence>
        {showSettings && (
          <SettingsTab
            onOpenAuth={() => { setShowSettings(false); setShowAuth(true); }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ SEARCH OVERLAY ═══ */}
      <SearchOverlay
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={(tab) => {
          handleTabChange(tab);
          setShowSearch(false);
        }}
      />

      {/* Old-style cassette transition loader (global) */}
      <OldTransitionLoader />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════ */
export default function Home() {
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Run one-time localStorage → IndexedDB migration on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      runMigration().catch(err => console.warn('[rewind] Migration error:', err));
      // Check if onboarding was completed
      (async () => {
        try {
          const db = await getDB();
          const record: any = await db.get('era_skin', 'onboarding');
          if (record?.complete) {
            // Restore persisted birth year
            if (record.birthYear) setBirthYear(record.birthYear);
          } else {
            setShowOnboarding(true);
          }
        } catch {
          setShowOnboarding(true);
        }
        setOnboardingChecked(true);
      })();
    }
  }, []);

  const handleLoadingDone = useCallback(() => {
    setLoading(false);
  }, []);

  const handleSubmit = useCallback((year: number) => {
    triggerOldLoader('Tuning into your era...');
    setTimeout(() => {
      setBirthYear(year);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideOldLoader();
    }, 1100);
  }, []);

  const handleOnboardingComplete = useCallback((data: { birthYear: number; eraSkin: string }) => {
    setShowOnboarding(false);
    triggerOldLoader('Tuning into your era...');
    setTimeout(() => {
      setBirthYear(data.birthYear);
      hideOldLoader();
    }, 1100);
  }, []);

  const handleBack = useCallback(() => {
    triggerOldLoader('Rewinding...');
    setTimeout(() => {
      setBirthYear(null);
      hideOldLoader();
    }, 850);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f5edd6 0%, #ede0c8 40%, #e8d8b8 100%)' }}>
      {/* CRT Boot Loading Screen */}
      {loading && <CrtLoadingScreen onDone={handleLoadingDone} />}

      {/* Onboarding (first visit only) */}
      <AnimatePresence>
        {showOnboarding && onboardingChecked && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showOnboarding && birthYear === null && onboardingChecked ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ opacity: loading ? 0 : 1 }}
          >
            <HeroSection onSubmit={handleSubmit} />
          </motion.div>
        ) : birthYear !== null ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <Dashboard birthYear={birthYear} onBack={handleBack} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}