'use client';

import { useState, useCallback, useSyncExternalStore, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  MessageSquare,
  User,
  Send,
  Music,
  Save,
  Trash2,
  HelpCircle,
  Eye,
  Sparkles,
  ChevronRight,
  Gamepad2,
  Phone,
  Sticker,
  Minimize2,
  X,
  SmilePlus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ThrowbackLibrary from '@/components/ThrowbackLibrary';
import EraPods from '@/components/EraPods';
import MemoryVault from '@/components/MemoryVault';
import EraSkins from '@/components/EraSkins';
import VoiceMessages from '@/components/VoiceMessages';
import {
  getAllGuestbookEntries, putAllGuestbookEntries,
  getAllMixtapes, clearMixtapes, addMixtape,
  getTamagotchiState, saveTamagotchiState,
  getFloppySavesCount, addFloppySave,
  getAllStickers, putAllStickers,
  getAllChatMessages, putAllChatMessages,
  incrementVisitCount, getVisitCount,
} from '@/lib/idb-store/index';
import type { TamagotchiStateRecord } from '@/lib/idb-store/types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  date: string;
  emoji: string;
}

interface Mixtape {
  id: string;
  to: string;
  from: string;
  side: 'A' | 'B';
  tracks: string[];
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const AVATAR_EMOJIS = [
  '🎭', '🤠', '🦊', '🐱', '🌸', '🎸', '🕶️', '🎮',
  '👾', '🌈', '🦄', '🐶', '🎨', '🎪', '🚀', '🍕',
  '🎵', '🐻', '🌟', '🎃', '🦋', '🐙', '🪐', '🎯',
];

const EIGHT_BALL_ANSWERS = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes, definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
];

const MAX_GUESTBOOK_ENTRIES = 8;
const MIXTAPE_TRACK_SLOTS = 8;

// Stable initial values (module-level to avoid ref/render-path lint issues)
const INITIAL_GUESTBOOK: GuestbookEntry[] = [];
const INITIAL_MIXTAPES: Mixtape[] = [];

function getRandomEmoji(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

function getRandomAnswer(): string {
  return EIGHT_BALL_ANSWERS[Math.floor(Math.random() * EIGHT_BALL_ANSWERS.length)];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ═══════════════════════════════════════════════════════════════
// useIsClient — detects client-side rendering via useSyncExternalStore
// ═══════════════════════════════════════════════════════════════

const emptySubscribe = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// ═══════════════════════════════════════════════════════════════
// useDBState — IndexedDB-backed state
// ═══════════════════════════════════════════════════════════════

function useDBState<T>(
  loader: () => Promise<T>,
  saver: (val: T) => Promise<void>,
  initial: T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    loader().then((loaded) => setValue(loaded)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
        saver(next).catch(() => {});
        return next;
      });
    },
    [saver], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return [value, set];
}

// ═══════════════════════════════════════════════════════════════
// useVisitCounter — auto-incrementing visit counter
// ═══════════════════════════════════════════════════════════════

function useVisitCounter(): number {
  const [count, setCount] = useState(1); // default to 1 during load
  useEffect(() => {
    getVisitCount().then(c => setCount(Math.max(c, 1)));
    incrementVisitCount();
  }, []);
  return count;
}

// ═══════════════════════════════════════════════════════════════
// Section Header Component
// ═══════════════════════════════════════════════════════════════

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-8 text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full sk-leather mb-4">
        <Icon className="w-7 h-7 text-[#d4a574]" />
      </div>
      <h2 className="old-title text-3xl md:text-4xl text-foreground mb-2">{title}</h2>
      <p className="old-body text-muted-foreground text-sm md:text-base max-w-md mx-auto">
        {subtitle}
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. Guestbook Section
// ═══════════════════════════════════════════════════════════════

function GuestbookSection({ visitorCount }: { visitorCount: number }) {
  const [entries, setEntries] = useDBState<GuestbookEntry[]>(
    () => getAllGuestbookEntries() as Promise<GuestbookEntry[]>,
    (val) => putAllGuestbookEntries(val as any).catch(() => {}),
    INITIAL_GUESTBOOK,
  );
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;

    const newEntry: GuestbookEntry = {
      id: generateId(),
      name: trimmedName,
      message: trimmedMessage,
      date: new Date().toISOString(),
      emoji: getRandomEmoji(),
    };

    setEntries((prev) => [newEntry, ...prev].slice(0, MAX_GUESTBOOK_ENTRIES));
    setName('');
    setMessage('');
  }, [name, message, setEntries]);

  const rotations = [-2, 1.5, -1, 2, -0.5, 1, -1.5, 0.5];

  return (
    <section id="guestbook" className="scroll-mt-8">
      <SectionHeader
        icon={BookOpen}
        title="Guestbook"
        subtitle="Sign my guestbook! Just like the good old GeoCities days."
      />

      {/* Visitor Counter Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="flex justify-center mb-8"
      >
        <div className="sk-metal rounded-lg px-5 py-2.5 flex items-center gap-3">
          <Eye className="w-4 h-4 text-[#5c4033]" />
          <span className="old-label text-[#3d2b1f]">You are visitor #</span>
          <span className="old-typewriter text-lg font-bold text-[#8b5e3c] tracking-widest">
            {String(visitorCount).padStart(6, '0')}
          </span>
        </div>
      </motion.div>

      {/* Sign Guestbook Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="max-w-lg mx-auto mb-10"
      >
        <div className="sk-paper rounded-xl p-6 relative sk-tape">
          <h3 className="old-heading text-xl text-foreground mb-4 text-center">
            ✍️ Leave a Note
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                maxLength={40}
                className="sk-inset old-typewriter text-sm border-0"
              />
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something nice..."
                maxLength={200}
                rows={3}
                className="sk-inset old-typewriter text-sm border-0 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || !message.trim()}
                className="sk-btn old-btn text-xs px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Sign!
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Guestbook Entries */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="old-handwritten text-center text-muted-foreground text-lg py-8"
            >
              Be the first to sign the guestbook! 📝
            </motion.p>
          )}
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, scale: 0.8, rotate: rotations[index % rotations.length] - 5 }}
              animate={{ opacity: 1, scale: 1, rotate: rotations[index % rotations.length] }}
              exit={{ opacity: 0, scale: 0.7, y: -20 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 150 }}
              className="sk-paper-aged rounded-lg p-4 mb-4 relative sk-pin cursor-default"
              style={
                { '--rotate': `${rotations[index % rotations.length]}deg` } as React.CSSProperties
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="old-heading text-sm font-semibold text-foreground truncate">
                      {entry.name}
                    </span>
                    <span className="old-label text-[10px] shrink-0 ml-2">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="old-body text-sm text-foreground/80 leading-relaxed">
                    {entry.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. Mixtape Creator Section
// ═══════════════════════════════════════════════════════════════

function MixtapeSection() {
  const [savedMixtapes, setSavedMixtapes] = useDBState<Mixtape[]>(
    () => getAllMixtapes() as Promise<Mixtape[]>,
    (val) => clearMixtapes().then(() => Promise.all(val.map(m => addMixtape(m as any)))).then(() => {}).catch(() => {}),
    INITIAL_MIXTAPES,
  );
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [side, setSide] = useState<'A' | 'B'>('A');
  const [tracks, setTracks] = useState<string[]>(Array(MIXTAPE_TRACK_SLOTS).fill(''));
  const [showSaved, setShowSaved] = useState(false);

  const handleTrackChange = useCallback((index: number, value: string) => {
    setTracks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleSave = useCallback(() => {
    const filledTracks = tracks.filter((t) => t.trim() !== '');
    if (!to.trim() || filledTracks.length === 0) return;

    const mixtape: Mixtape = {
      id: generateId(),
      to: to.trim(),
      from: from.trim() || 'Anonymous',
      side,
      tracks: filledTracks.map((t) => t.trim()),
      createdAt: new Date().toISOString(),
    };

    setSavedMixtapes((prev) => [mixtape, ...prev]);
    setTo('');
    setFrom('');
    setTracks(Array(MIXTAPE_TRACK_SLOTS).fill(''));
  }, [to, from, side, tracks, setSavedMixtapes]);

  const handleDelete = useCallback(
    (id: string) => {
      setSavedMixtapes((prev) => prev.filter((m) => m.id !== id));
    },
    [setSavedMixtapes],
  );

  return (
    <section id="mixtape" className="scroll-mt-8">
      <SectionHeader
        icon={Music}
        title="Mixtape Creator"
        subtitle="Make a mixtape for that special someone, just like the old days."
      />

      <div className="max-w-lg mx-auto">
        {/* Cassette Tape Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative"
        >
          <div className="sk-metal rounded-2xl p-1">
            {/* Cassette body */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-xl p-5 relative overflow-hidden">
              {/* Noise overlay */}
              <div className="absolute inset-0 sk-noise pointer-events-none" />

              {/* Top section: reels */}
              <div className="flex items-center justify-center gap-10 mb-4 relative z-10">
                {/* Left reel */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#444] bg-[#222] flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#555] bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#555] border border-[#666]" />
                    </div>
                  </div>
                  {/* Spinning spokes */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={side === 'A' ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      side === 'A'
                        ? { duration: 3, repeat: Infinity, ease: 'linear' }
                        : { duration: 0 }
                    }
                  >
                    <div className="w-16 h-16">
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <div
                          key={deg}
                          className="absolute top-1/2 left-1/2 w-px h-7 bg-[#444]"
                          style={{
                            transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                            transformOrigin: 'bottom center',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Center window / label area */}
                <div className="sk-vhs-label rounded-md px-4 py-3 text-center min-w-[140px] relative">
                  <p className="old-label text-[10px] text-[#8b7355] mb-1">★ HIGH BIAS ★</p>
                  <p className="old-title text-lg text-foreground leading-tight">My Mixtape</p>
                  <p className="old-typewriter text-[10px] text-muted-foreground mt-1">CHROME 90</p>

                  {/* Side A/B indicator */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${side === 'A' ? 'bg-[#e85d5d]' : 'bg-[#555]'}`}
                      animate={side === 'A' ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="old-label text-[8px]">
                      {side === 'A' ? '▶ PLAYING' : '■ STOPPED'}
                    </span>
                  </div>
                </div>

                {/* Right reel */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#444] bg-[#222] flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#555] bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#555] border border-[#666]" />
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={side === 'A' ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      side === 'A'
                        ? { duration: 4, repeat: Infinity, ease: 'linear' }
                        : { duration: 0 }
                    }
                  >
                    <div className="w-16 h-16">
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <div
                          key={deg}
                          className="absolute top-1/2 left-1/2 w-px h-7 bg-[#444]"
                          style={{
                            transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                            transformOrigin: 'bottom center',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Tape window strip */}
              <div className="bg-[#111] rounded h-6 mx-8 mb-4 flex items-center justify-center overflow-hidden relative z-10">
                <div className="flex gap-0.5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 h-3 bg-[#3a2a1a] rounded-full"
                      animate={
                        side === 'A'
                          ? { x: [0, 8, 0] }
                          : {}
                      }
                      transition={
                        side === 'A'
                          ? {
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: i * 0.05,
                            }
                          : { duration: 0 }
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Form area */}
              <div className="relative z-10 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="old-label text-[10px] block mb-1">To:</label>
                    <Input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="A special someone..."
                      maxLength={30}
                      className="sk-inset old-typewriter text-xs border-0 h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="old-label text-[10px] block mb-1">From:</label>
                    <Input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Your name..."
                      maxLength={30}
                      className="sk-inset old-typewriter text-xs border-0 h-9"
                    />
                  </div>
                </div>

                {/* Side toggle */}
                <div className="flex items-center justify-center gap-2">
                  <span className="old-label text-[10px]">SIDE</span>
                  <button
                    onClick={() => setSide(side === 'A' ? 'B' : 'A')}
                    className="sk-btn old-btn text-xs px-4 py-1.5 rounded-md flex items-center gap-2"
                  >
                    <span
                      className={`font-bold transition-colors ${
                        side === 'A' ? 'text-[#8b5e3c]' : 'text-[#8b7355]'
                      }`}
                    >
                      A
                    </span>
                    <span className="text-[#8b7355]">/</span>
                    <span
                      className={`font-bold transition-colors ${
                        side === 'B' ? 'text-[#8b5e3c]' : 'text-[#8b7355]'
                      }`}
                    >
                      B
                    </span>
                  </button>
                </div>

                {/* Track slots */}
                <div className="space-y-1.5 mt-3">
                  {tracks.map((track, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-2"
                    >
                      <span className="old-typewriter text-[10px] text-[#888] w-5 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <Input
                        value={track}
                        onChange={(e) => handleTrackChange(i, e.target.value)}
                        placeholder={`Track ${i + 1}...`}
                        maxLength={60}
                        className="sk-inset old-typewriter text-[11px] border-0 h-7"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Save button */}
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={!to.trim() || tracks.filter((t) => t.trim()).length === 0}
                    className="sk-btn old-btn text-xs px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-40"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Mixtape
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Saved Mixtapes */}
        <div className="mt-8">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="sk-btn old-btn text-xs px-4 py-2 rounded-lg mx-auto flex items-center gap-2 w-full justify-center mb-4"
          >
            <span className="text-sm">📼</span>
            {showSaved ? 'Hide' : 'Show'} Saved Mixtapes
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${showSaved ? 'rotate-90' : ''}`}
            />
            {savedMixtapes.length > 0 && (
              <span className="bg-[#8b5e3c] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {savedMixtapes.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 max-h-96 overflow-y-auto sk-scrollbar pr-1">
                  {savedMixtapes.length === 0 && (
                    <p className="old-handwritten text-center text-muted-foreground py-4">
                      No mixtapes saved yet. Make one above! 🎶
                    </p>
                  )}
                  {savedMixtapes.map((mixtape) => (
                    <motion.div
                      key={mixtape.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="sk-paper-aged rounded-lg p-4 relative sk-tape"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="old-heading text-sm">
                            To: <span className="text-[#8b5e3c]">{mixtape.to}</span>
                          </p>
                          <p className="old-typewriter text-[11px] text-muted-foreground">
                            From: {mixtape.from} · Side {mixtape.side} ·{' '}
                            {formatDate(mixtape.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(mixtape.id)}
                          className="text-[#8b7355] hover:text-[#e85d5d] transition-colors p-1"
                          aria-label="Delete mixtape"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <ol className="space-y-0.5">
                        {mixtape.tracks.map((track, i) => (
                          <li
                            key={i}
                            className="old-typewriter text-xs text-foreground/80 flex items-baseline gap-1.5"
                          >
                            <span className="text-[#8b7355] shrink-0">{i + 1}.</span>
                            <span>{track}</span>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. Magic 8-Ball Section
// ═══════════════════════════════════════════════════════════════

function Magic8BallSection() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleShake = useCallback(() => {
    if (!question.trim() || isShaking) return;

    setIsShaking(true);
    setIsRevealed(false);
    setAnswer('');

    setTimeout(() => {
      setAnswer(getRandomAnswer());
      setIsShaking(false);
      setIsRevealed(true);
    }, 1500);
  }, [question, isShaking]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleShake();
      }
    },
    [handleShake],
  );

  return (
    <section id="eightball" className="scroll-mt-8">
      <SectionHeader
        icon={Sparkles}
        title="Magic 8-Ball"
        subtitle="Ask the mystic 8-Ball a yes-or-no question and shake for your fate."
      />

      <div className="max-w-sm mx-auto text-center">
        {/* The 8-Ball */}
        <motion.div
          className="relative mx-auto mb-8"
          style={{ width: 220, height: 220 }}
        >
          {/* Shadow */}
          <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-40 h-6 bg-black/20 rounded-full blur-md" />

          {/* Ball */}
          <motion.div
            animate={
              isShaking
                ? {
                    x: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
                    y: [-4, -8, -2, -6, 0, -4, 2, -1, 0],
                    rotate: [-3, 3, -2, 2, -1, 1, -0.5, 0.5, 0],
                  }
                : {}
            }
            transition={
              isShaking
                ? { duration: 1.4, ease: 'easeInOut' }
                : { duration: 0.3, ease: 'easeOut' }
            }
            className="relative w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] via-[#111] to-[#000] shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)]"
          >
            {/* Shine highlight */}
            <div className="absolute top-5 left-7 w-16 h-8 rounded-full bg-gradient-to-br from-white/20 to-transparent rotate-[-30deg]" />

            {/* Triangle window */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: 100, height: 100 }}>
                {/* Triangle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: '50px solid transparent',
                      borderRight: '50px solid transparent',
                      borderBottom: '87px solid #1a3a5c',
                      filter: 'drop-shadow(0 0 8px rgba(26, 58, 92, 0.5))',
                    }}
                  />
                </div>

                {/* Answer text overlay on triangle */}
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  <AnimatePresence mode="wait">
                    {isRevealed && answer && (
                      <motion.p
                        key={answer}
                        initial={{ opacity: 0, scale: 0.5, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                        className="old-typewriter text-white text-[10px] leading-tight text-center max-w-[70px] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                      >
                        {answer}
                      </motion.p>
                    )}
                    {!isRevealed && !isShaking && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        className="old-typewriter text-white text-[10px] text-center"
                      >
                        8
                      </motion.p>
                    )}
                    {isShaking && (
                      <motion.div
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-white/40"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom shadow curve */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full bg-black/30 blur-sm" />
          </motion.div>
        </motion.div>

        {/* Question Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative">
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a yes-or-no question..."
              maxLength={100}
              disabled={isShaking}
              className="sk-inset old-typewriter text-sm border-0 pl-9"
            />
          </div>

          <Button
            onClick={handleShake}
            disabled={!question.trim() || isShaking}
            className="sk-btn old-btn text-sm px-8 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 w-full"
          >
            {isShaking ? (
              <motion.span
                animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="inline-block"
              >
                🔮 Shaking...
              </motion.span>
            ) : (
              <>🔮 Shake the 8-Ball</>
            )}
          </Button>

          {isRevealed && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="old-quote text-muted-foreground text-sm mt-2"
            >
              The 8-Ball has spoken...
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. Visit Counter Section
// ═══════════════════════════════════════════════════════════════

function VisitCounterSection({ count }: { count: number }) {
  const digits = String(count).padStart(6, '0').split('');

  return (
    <section id="counter" className="scroll-mt-8">
      <SectionHeader
        icon={Eye}
        title="Visit Counter"
        subtitle="Remember those hit counters on every homepage? Here's yours."
      />

      <div className="max-w-md mx-auto text-center">
        {/* Odometer Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex gap-1 p-3 sk-cork rounded-xl"
        >
          {digits.map((digit, i) => (
            <motion.div
              key={`${digit}-${i}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.1 * i,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="relative w-11 h-14 md:w-13 md:h-16 sk-metal rounded-md flex items-center justify-center overflow-hidden"
              style={{
                boxShadow:
                  'inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              {/* Digit background slot */}
              <div className="absolute inset-1 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-sm" />
              {/* The digit */}
              <span
                className="relative z-10 font-bold text-2xl md:text-3xl text-[#e85d5d] tracking-wider"
                style={{
                  fontFamily: "'Courier New', 'Special Elite', monospace",
                  textShadow: '0 0 6px rgba(232, 93, 93, 0.4)',
                }}
              >
                {digit}
              </span>
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-sm pointer-events-none" />
              {/* Divider line */}
              <div className="absolute top-1/2 left-1 right-1 h-px bg-black/40" />
            </motion.div>
          ))}
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="old-typewriter text-sm md:text-base text-muted-foreground mt-6"
        >
          This page has been visited{' '}
          <span className="text-[#8b5e3c] font-bold">{count.toLocaleString()}</span>{' '}
          time{count !== 1 ? 's' : ''}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="old-body text-xs text-[#8b7355] mt-2"
        >
          ✨ Every visit counts. Just like the old days. ✨
        </motion.p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. Tamagotchi Virtual Pet Section
// ═══════════════════════════════════════════════════════════════

interface PetState { hunger: number; happiness: number; energy: number; }

function TamagotchiSection() {
  const [pet, setPet] = useDBState<PetState>(
    async () => {
      const r = await getTamagotchiState();
      if (!r) return { hunger: 80, happiness: 80, energy: 80 };
      return { hunger: r.hunger, happiness: r.happiness, energy: r.energy };
    },
    (val: PetState) => saveTamagotchiState({
      id: 'pet-1', hunger: val.hunger, happiness: val.happiness, energy: val.energy,
      last_updated: Date.now(), is_alive: !(val.hunger === 0 && val.happiness === 0 && val.energy === 0),
    }),
    { hunger: 80, happiness: 80, energy: 80 },
  );
  const [ejecting, setEjecting] = useState(false);

  const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
  const isDead = pet.hunger === 0 && pet.happiness === 0 && pet.energy === 0;
  const face = isDead ? '🪦' : avg > 70 ? '😊' : avg > 40 ? '🐣' : '😢';

  useEffect(() => {
    if (isDead) return;
    const interval = setInterval(() => {
      setPet((prev: PetState) => {
        const keys: (keyof PetState)[] = ['hunger', 'happiness', 'energy'];
        const k = keys[Math.floor(Math.random() * keys.length)];
        return { ...prev, [k]: Math.max(0, prev[k] - 5) };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isDead, setPet]);

  const doAction = (stat: keyof PetState, amt: number) => {
    if (isDead) return;
    setPet((prev: PetState) => ({ ...prev, [stat]: Math.min(100, prev[stat] + amt) }));
    setEjecting(true);
    setTimeout(() => setEjecting(false), 400);
  };

  const restart = () => setPet({ hunger: 80, happiness: 80, energy: 80 });

  const StatBar = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center gap-2">
      <span className="tamagotchi-pixel-text text-xs w-20">{label}</span>
      <div className="flex-1 h-3 bg-[#306230]/30 rounded-sm overflow-hidden">
        <div className="h-full bg-[#306230] rounded-sm transition-all duration-300" style={{ width: `${value}%` }} />
      </div>
      <span className="tamagotchi-pixel-text text-xs w-8 text-right">{value}</span>
    </div>
  );

  return (
    <section id="tamagotchi" className="scroll-mt-8">
      <SectionHeader icon={Gamepad2} title="Tamagotchi" subtitle="Keep your virtual pet alive! Stats drop every 5 seconds." />
      <div className="max-w-xs mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[#8b5e3c] rounded-3xl p-3 shadow-lg" style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Egg shape top */}
          <div className="bg-[#c4956a] rounded-t-2xl h-3 mx-4" />
          {/* Screen */}
          <div className="tamagotchi-screen rounded-xl p-4 mx-2 mb-3">
            <div className={`text-center text-5xl mb-3 ${ejecting ? 'scale-110 transition-transform' : ''}`}>{face}</div>
            {isDead ? (
              <div className="text-center">
                <p className="tamagotchi-pixel-text text-sm mb-2">GAME OVER</p>
                <button onClick={restart} className="sk-btn rounded px-3 py-1 text-xs old-btn">Restart</button>
              </div>
            ) : (
              <div className="space-y-2">
                <StatBar label="Hunger" value={pet.hunger} />
                <StatBar label="Happy" value={pet.happiness} />
                <StatBar label="Energy" value={pet.energy} />
              </div>
            )}
          </div>
          {/* Buttons */}
          {!isDead && (
            <div className="grid grid-cols-4 gap-2 px-2 pb-3">
              {([['🍔', 'hunger', 15], ['🎮', 'happiness', 15], ['💤', 'energy', 20], ['🧹', 'happiness', 10]] as const).map(([emoji, stat, amt]) => (
                <button key={String(emoji)} onClick={() => doAction(stat as keyof PetState, amt)}
                  className="sk-btn rounded-lg py-2 text-xl flex flex-col items-center gap-0.5">
                  <span>{emoji}</span>
                  <span className="text-[8px] old-label">{String(emoji) === '🍔' ? 'Feed' : String(emoji) === '🎮' ? 'Play' : String(emoji) === '💤' ? 'Sleep' : 'Clean'}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. Floppy Disk Save Counter Section
// ═══════════════════════════════════════════════════════════════

const FLOPPY_MESSAGES = [
  "Don't forget to label your disk!",
  'Saving to A:\\...',
  'Please wait... writing to disk',
  'Disk full! Just kidding.',
  'Make sure the write-protect tab is off!',
];

function FloppyDiskSection() {
  const [count, setCount] = useDBState<number>(
    getFloppySavesCount,
    () => addFloppySave('Save').catch(() => {}),
    0,
  );
  const [ejecting, setEjecting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleSave = () => {
    setEjecting(true);
    setStatusText('Saving...');
    setTimeout(() => {
      setCount((prev: number) => prev + 1);
      setStatusText('Saved!');
      setTimeout(() => {
        setStatusText(FLOPPY_MESSAGES[Math.floor(Math.random() * FLOPPY_MESSAGES.length)]);
        setEjecting(false);
      }, 800);
    }, 600);
  };

  return (
    <section id="floppy" className="scroll-mt-8">
      <SectionHeader icon={Save} title="Floppy Disk Saver" subtitle="Save your progress like it's 1995." />
      <div className="max-w-xs mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={`sk-paper rounded-xl p-6 relative ${ejecting ? 'floppy-eject' : ''}`}>
          {/* CSS Floppy Disk */}
          <div className="mx-auto w-36 h-44 bg-[#1a1a2e] rounded-lg relative mb-4"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            {/* Metal slider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-8 bg-[#b0b0b0] rounded-b-md"
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-[#1a1a2e] rounded-t-sm" />
            </div>
            {/* Label area */}
            <div className="absolute top-12 left-3 right-3 bottom-3 sk-vhs-label rounded p-2 flex flex-col items-center justify-center">
              <span className="old-label text-[8px] mb-1">REWIND.DAT</span>
              <span className="old-typewriter text-xs text-[#8b5e3c]">Saves: {count}</span>
            </div>
          </div>
          {/* Save button */}
          <button onClick={handleSave} disabled={ejecting}
            className="sk-btn rounded-xl px-8 py-3 old-btn text-sm mb-3 disabled:opacity-60">
            💾 Save
          </button>
          <p className="old-typewriter text-xs text-muted-foreground h-4">{statusText}</p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. Rotary Phone Dial Section
// ═══════════════════════════════════════════════════════════════

const PHONE_MESSAGES = [
  "Nobody's home! Leave a message after the beep.",
  'The number you have dialed... is your childhood. Please try again.',
  'Connection established. Rewinding memories...',
];

function RotaryPhoneSection() {
  const [dialed, setDialed] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [callMsg, setCallMsg] = useState('');
  const dialRef = useRef<HTMLDivElement>(null);

  const dialNumber = (n: number) => {
    if (spinning) return;
    setSpinning(true);
    setDialed((prev) => [...prev, n]);
    if (dialRef.current) {
      dialRef.current.classList.remove('dial-spin');
      void dialRef.current.offsetWidth;
      dialRef.current.classList.add('dial-spin');
    }
    setTimeout(() => setSpinning(false), 500);
  };

  const handleCall = () => {
    if (dialed.length === 0 || ringing) return;
    setRinging(true);
    setTimeout(() => {
      setCallMsg(PHONE_MESSAGES[Math.floor(Math.random() * PHONE_MESSAGES.length)]);
      setRinging(false);
    }, 1000);
  };

  const handleClear = () => { setDialed([]); setCallMsg(''); };

  const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const getAngle = (i: number) => (i * 30 + 150) * (Math.PI / 180);

  return (
    <section id="phone" className="scroll-mt-8">
      <SectionHeader icon={Phone} title="Rotary Phone" subtitle="Dial a number the old-fashioned way." />
      <div className="max-w-xs mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="sk-paper rounded-xl p-6 relative">
          {/* Dial */}
          <div className="mx-auto w-48 h-48 rounded-full bg-[#2a1f14] relative mb-4 p-4"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.05)' }}>
            <div ref={dialRef} className="w-full h-full rounded-full relative" style={{ transition: 'transform 0.5s cubic-bezier(0.2,0,0.2,1)' }}>
              {holes.map((n, i) => {
                const a = getAngle(i);
                const r = 60;
                const x = 96 + r * Math.cos(a) - 14;
                const y = 96 + r * Math.sin(a) - 14;
                return (
                  <button key={n} onClick={() => dialNumber(n)} disabled={spinning}
                    className="absolute w-7 h-7 rounded-full bg-[#f0e6d3] border border-[#a89878] flex items-center justify-center old-typewriter text-xs font-bold text-[#3d2b1f] hover:bg-[#faf6eb] disabled:opacity-50 cursor-pointer"
                    style={{ left: x, top: y, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.2)' }}>
                    {n}
                  </button>
                );
              })}
              {/* Center cap */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#5c4033]"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
          {/* Dialed number display */}
          <div className="sk-inset rounded-lg px-4 py-2 mb-3">
            <span className="old-typewriter text-lg tracking-[0.3em] text-[#5c4033]">
              {dialed.length > 0 ? dialed.join('') : '—'}
            </span>
          </div>
          {/* Ring animation */}
          {ringing && <div className="text-3xl mb-2 phone-ring inline-block">📞</div>}
          {/* Call message */}
          {callMsg && <p className="old-body text-sm text-[#8b5e3c] mb-3">{callMsg}</p>}
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button onClick={handleCall} className="sk-btn rounded-lg px-5 py-2 old-btn text-xs">📞 Call</button>
            <button onClick={handleClear} className="sk-btn rounded-lg px-5 py-2 old-btn text-xs">✕ Clear</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. Retro Sticker Wall Section
// ═══════════════════════════════════════════════════════════════

const STICKER_EMOJIS = [
  '⭐', '🎸', '🎮', '🎭', '🎬', '🎵', '📺', '📻', '📱', '📸',
  '🍔', '🧸', '🎪', '🚀', '🌈', '💯', '👀', '🔥', '💎', '🍇',
  '🌙', '🍀', '🏀', '🎨', '🎧',
];

interface PlacedSticker { id: string; emoji: string; x: number; y: number; rotation: number; }

function StickerWallSection() {
  const [stickers, setStickers] = useDBState<PlacedSticker[]>(
    () => getAllStickers() as Promise<PlacedSticker[]>,
    (val) => putAllStickers(val as any).catch(() => {}),
    [],
  );
  const [pickedEmoji, setPickedEmoji] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  const placeSticker = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pickedEmoji || !wallRef.current) return;
    const rect = wallRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotation = (Math.random() - 0.5) * 30;
    setStickers((prev: PlacedSticker[]) => [...prev, { id: generateId(), emoji: pickedEmoji, x, y, rotation }]);
  };

  const clearWall = () => { setStickers([]); setPickedEmoji(null); };

  return (
    <section id="stickers" className="scroll-mt-8">
      <SectionHeader icon={Sticker} title="Sticker Wall" subtitle="Pick a sticker, then click the board to place it." />
      <div className="max-w-lg mx-auto">
        {/* Emoji picker */}
        <div className="sk-paper rounded-xl p-3 mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {STICKER_EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => setPickedEmoji(pickedEmoji === emoji ? null : emoji)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all ${
                  pickedEmoji === emoji ? 'sk-sticker scale-110 bg-[#faf6eb]' : 'hover:bg-[#faf6eb]/60'
                }`}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
        {/* Cork board */}
        <div ref={wallRef} onClick={placeSticker}
          className="sk-cork rounded-xl relative overflow-hidden cursor-crosshair"
          style={{ height: pickedEmoji ? '300px' : '200px', transition: 'height 0.3s' }}>
          {stickers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center old-handwritten text-[#8b7355] text-sm opacity-50 pointer-events-none">
              {pickedEmoji ? 'Click here to place your sticker!' : 'Pick a sticker above to get started'}
            </div>
          )}
          {stickers.map((s) => (
            <div key={s.id} className="absolute text-2xl sticker-pop cursor-grab active:cursor-grabbing select-none"
              style={{ left: s.x - 16, top: s.y - 16, '--sticker-rotate': `${s.rotation}deg` } as React.CSSProperties}>
              {s.emoji}
            </div>
          ))}
        </div>
        {stickers.length > 0 && (
          <div className="flex justify-center mt-3">
            <button onClick={clearWall} className="sk-btn rounded-lg px-4 py-2 old-btn text-xs flex items-center gap-1.5">
              <Trash2 className="w-3 h-3" /> Clear Wall
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. Retro Chat (AIM / MSN Messenger style)
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  from: 'me' | 'buddy';
  text: string;
  time: string;
  color: string;
}

const BUDDY_REPLIES = [
  "hey!! whats up?? :D",
  "omg remember when we used to stay up late chatting??",
  "haha yeah that was so fun",
  "did u watch that cartoon yesterday?? it was so good!!",
  "brb my mom is calling me for dinner",
  "back! sorry about that lol",
  "i cant believe its already 11pm... time flies when ur having fun",
  "u still have that mixtape i made u??",
  "LOL thats hilarious",
  "wanna come over tomorrow? we can play n64",
  "my dad said we can rent a movie from blockbuster!!",
  "a/s/l? lol jk",
  "brb phone is ringing... its probably jessica",
  "ok back. it was jessica. she said shes coming over too!",
  "remember that time we snuck out at night?? so scary but fun",
  "my mom made cookies!! chocolate chip :D",
  "u online?? hello??",
  "gtg its getting late. ttyl!!",
  "omg i just heard the best song on the radio",
  "check this out -> I just found the coolest website",
  "haha ur so funny",
  "wait wait wait... did u see that episode??",
  "i love these smileys :) ;) :P :D >:( 8-)",
  "summer vacation is gonna be so awesome this year!!",
  "school is almost over!!! YESSS",
  "do u have aol or msn?? add me!!",
  "my screen name is NostalgiaKid2000 add me",
  "gtg bye!! *waves*",
];

const BUDDY_NAMES = [
  { name: 'CoolDude99', color: '#ff0000' },
  { name: 'SunshineGal', color: '#ff69b4' },
  { name: 'Sk8rBoi2000', color: '#0000ff' },
  { name: 'xXDarkAngelXx', color: '#800080' },
  { name: 'PizzaLover42', color: '#008080' },
];

function RetroChatSection() {
  const [messages, setMessages] = useDBState<ChatMessage[]>(
    () => getAllChatMessages() as Promise<ChatMessage[]>,
    (val) => putAllChatMessages(val as any).catch(() => {}),
    [],
  );
  const [inputText, setInputText] = useState('');
  const [buddyName] = useState(() => BUDDY_NAMES[Math.floor(Math.random() * BUDDY_NAMES.length)]);
  const [statusText, setStatusText] = useState('Online');
  const [showEmojis, setShowEmojis] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const myColor = '#000080';

  const emojis = [':)', ';)', ':P', ':D', ':(', '>:(', '8-)', 'O:)', ':O', '<3', 'XD', 'LOL'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Buddy auto-replies
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.from !== 'me') return;

    // Show typing indicator
    const typingDelay = 800 + Math.random() * 1200;
    const replyDelay = typingDelay + 1000 + Math.random() * 1500;

    const t1 = setTimeout(() => setStatusText('typing...'), typingDelay);
    const t2 = setTimeout(() => {
      const reply = BUDDY_REPLIES[Math.floor(Math.random() * BUDDY_REPLIES.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newMsg: ChatMessage = {
        id: generateId(),
        from: 'buddy',
        text: reply,
        time: timeStr,
        color: buddyName.color,
      };
      setMessages((prev: ChatMessage[]) => [...prev, newMsg]);
      setStatusText('Online');
    }, replyDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages.length, buddyName.color, setMessages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newMsg: ChatMessage = {
      id: generateId(),
      from: 'me',
      text,
      time: timeStr,
      color: myColor,
    };
    setMessages((prev: ChatMessage[]) => [...prev, newMsg]);
    setInputText('');
    setShowEmojis(false);
  };

  const insertEmoji = (emoji: string) => {
    setInputText(prev => prev + ' ' + emoji);
    setShowEmojis(false);
  };

  const clearChat = () => {
    setMessages([]);
    setStatusText('Online');
  };

  return (
    <section id="chat" className="scroll-mt-8">
      <SectionHeader icon={MessageSquare} title="Retro Chat" subtitle="Chat like it's 2001. AIM style." />

      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-sm overflow-hidden"
          style={{
            border: '2px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            boxShadow: '2px 2px 0 #000',
          }}
        >
          {/* Window title bar - AIM style */}
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{
              background: 'linear-gradient(180deg, #3168d5 0%, #2456b5 40%, #1a3f8a 100%)',
              borderBottom: '1px solid #000',
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-white/80" />
              <span style={{ fontFamily: 'Tahoma, Verdana, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                AIM - Instant Message
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 text-[10px]">
                <Minimize2 className="w-3 h-3" />
              </button>
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 text-[10px]">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center gap-1 px-2 py-1"
            style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}
          >
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: '#000' }}>
              To:
            </span>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: 'bold', color: buddyName.color }}>
              {buddyName.name}
            </span>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080', marginLeft: '8px' }}>
              ({statusText})
            </span>
          </div>

          {/* Chat area */}
          <div
            className="relative"
            style={{
              height: '320px',
              background: '#ffffff',
              fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
              fontSize: '12px',
              overflowY: 'auto',
            }}
          >
            {messages.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#808080]">
                <span className="text-3xl mb-2">💬</span>
                <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>
                  Start a conversation with <b style={{ color: buddyName.color }}>{buddyName.name}</b>
                </p>
                <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0', marginTop: '4px' }}>
                  Type something below and hit Send
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="px-3 py-1 hover:bg-[#f0f0ff]/50" style={{ lineHeight: '1.5' }}>
                <span style={{ fontWeight: 'bold', color: msg.color, fontSize: '12px' }}>
                  {msg.from === 'me' ? 'Me' : buddyName.name}:
                </span>{' '}
                <span style={{ color: '#000', fontSize: '12px' }}>{msg.text}</span>
                <span className="ml-2" style={{ color: '#808080', fontSize: '10px' }}>{msg.time}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div
            className="px-2 py-2"
            style={{ background: '#c0c0c0', borderTop: '1px solid #808080' }}
          >
            {/* Emoji picker */}
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 flex flex-wrap gap-1 p-2 overflow-hidden"
                  style={{ background: '#ffffff', border: '1px solid #808080' }}
                >
                  {emojis.map(e => (
                    <button key={e} onClick={() => insertEmoji(e)}
                      className="px-1.5 py-0.5 text-sm hover:bg-[#e0e0ff] cursor-pointer"
                      style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '13px' }}>
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div
                className="flex-1"
                style={{
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Type a message..."
                  className="w-full px-2 py-1.5 text-[12px] outline-none"
                  style={{
                    fontFamily: 'Tahoma, Verdana, sans-serif',
                    background: '#ffffff',
                    color: '#000',
                  }}
                />
              </div>
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="px-2 py-1.5 cursor-pointer"
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #808080 #808080 #ffffff',
                  fontSize: '14px',
                }}
                title="Emoticons"
              >
                <SmilePlus className="w-4 h-4 text-[#000]" />
              </button>
              <button
                onClick={sendMessage}
                className="px-3 py-1.5 cursor-pointer font-bold"
                style={{
                  fontFamily: 'Tahoma, sans-serif',
                  fontSize: '11px',
                  background: 'linear-gradient(180deg, #e8e8e8, #c0c0c0)',
                  border: '2px solid',
                  borderColor: '#ffffff #808080 #808080 #ffffff',
                  color: '#000',
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Bottom bar with clear */}
          <div
            className="flex items-center justify-between px-3 py-1"
            style={{ background: '#c0c0c0', borderTop: '1px solid #ffffff' }}
          >
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080' }}>
              {messages.length > 0 ? `${messages.length} message${messages.length > 1 ? 's' : ''}` : 'No messages yet'}
            </span>
            {messages.length > 0 && (
              <button onClick={clearChat}
                style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080', textDecoration: 'underline' }}
                className="hover:text-[#000] cursor-pointer">
                Clear Chat
              </button>
            )}
          </div>
        </motion.div>

        {/* Fun AIM-era info */}
        <div className="mt-4 text-center space-y-1">
          <p className="old-handwritten text-xs text-[#8b7355]">
            Chatting with <b style={{ color: buddyName.color }}>{buddyName.name}</b> on AIM
          </p>
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0' }}>
            &quot;You&apos;ve Got Mail!&quot; 📬
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component — NostalgiaFeatures
// ═══════════════════════════════════════════════════════════════

export default function NostalgiaFeatures() {
  const isClient = useIsClient();
  const visitCount = useVisitCounter();

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="old-typewriter text-muted-foreground text-sm"
        >
          Loading... please wait...
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Decorative noise overlay */}
      <div className="fixed inset-0 sk-noise pointer-events-none z-50" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-16 md:space-y-20">
        {/* ── Guestbook ── */}
        <GuestbookSection visitorCount={visitCount} />

        <Separator className="opacity-30" />

        {/* ── Mixtape Creator ── */}
        <MixtapeSection />

        <Separator className="opacity-30" />

        {/* ── Magic 8-Ball ── */}
        <Magic8BallSection />

        <Separator className="opacity-30" />

        {/* ── Visit Counter ── */}
        <VisitCounterSection count={visitCount} />

        <Separator className="opacity-30" />

        {/* ── Tamagotchi ── */}
        <TamagotchiSection />

        <Separator className="opacity-30" />

        {/* ── Floppy Disk Saver ── */}
        <FloppyDiskSection />

        <Separator className="opacity-30" />

        {/* ── Rotary Phone ── */}
        <RotaryPhoneSection />

        <Separator className="opacity-30" />

        {/* ── Sticker Wall ── */}
        <StickerWallSection />

        <Separator className="opacity-30" />
        <EraSkins />

        {/* ── Era Pods ── */}
        <EraPods />

        <Separator className="opacity-30" />

        {/* ── Memory Vault ── */}
        <MemoryVault />

        <Separator className="opacity-30" />

        {/* ── Voice Messages ── */}
        <VoiceMessages />

        <Separator className="opacity-30" />

        {/* ── Retro Chat ── */}
        <RetroChatSection />

        <Separator className="opacity-30" />

        {/* ── Throwback Library ── */}
        <ThrowbackLibrary />

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <Separator className="opacity-20 mb-6" />
          <p className="old-handwritten text-muted-foreground text-sm">
            ~ made with 💾 and nostalgia ~
          </p>
          <p className="old-label text-[10px] text-[#8b7355] mt-2">
            REWIND © {new Date().getFullYear()} · BEST VIEWED IN NETSCAPE NAVIGATOR 4.0
          </p>
        </footer>
      </div>
    </main>
  );
}