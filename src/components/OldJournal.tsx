'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Feather, Plus, Trash2, ChevronLeft, ChevronRight,
  Calendar, Heart, CloudRain, Sun, Moon, Cloud, Zap,
  Bookmark, PenTool, Droplets,
} from 'lucide-react';
import {
  soundTypewriterKey, soundPageTurn, soundSave, soundDelete,
  soundButtonClick, soundFloppyInsert,
} from '@/lib/sounds';

/* ═══════ TYPES ═══════ */
interface JournalEntry {
  id: string;
  date: string;       // ISO date string
  title: string;
  body: string;
  mood: string;       // emoji
  weather: string;    // emoji
  createdAt: number;
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'nostalgic', emoji: '🥺', label: 'Nostalgic' },
  { id: 'peaceful', emoji: '😌', label: 'Peaceful' },
  { id: 'excited', emoji: '🤩', label: 'Excited' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
  { id: 'love', emoji: '❤️', label: 'Love' },
];

const WEATHERS = [
  { id: 'sunny', emoji: '☀️', label: 'Sunny' },
  { id: 'cloudy', emoji: '☁️', label: 'Cloudy' },
  { id: 'rainy', emoji: '🌧️', label: 'Rainy' },
  { id: 'night', emoji: '🌙', label: 'Night' },
  { id: 'stormy', emoji: '⛈️', label: 'Stormy' },
  { id: 'snowy', emoji: '❄️', label: 'Snowy' },
];

import {
  getAllJournalEntries, addJournalEntry, putJournalEntry, deleteJournalEntry,
} from '@/lib/idb-store';

function loadEntriesFromDB() {
  return getAllJournalEntries();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(new Date(ts).toISOString());
}

/* ═══════ INK SPLATTER DECORATIONS ═══════ */
function InkBlot({ className = '' }: { className?: string }) {
  const id = useRef(Math.random().toString(36).slice(2));
  return (
    <svg className={`absolute pointer-events-none opacity-[0.04] ${className}`} width="60" height="60" viewBox="0 0 60 60">
      <filter id={`blur-${id.current}`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
      </filter>
      <circle cx="30" cy="30" r="20" fill="#3d2b1f" filter={`url(#blur-${id.current})`} />
      <circle cx="22" cy="25" r="8" fill="#3d2b1f" filter={`url(#blur-${id.current})`} />
      <circle cx="38" cy="35" r="6" fill="#3d2b1f" filter={`url(#blur-${id.current})`} />
    </svg>
  );
}

/* ═══════ WAX SEAL ═══════ */
function WaxSeal({ emoji = '🔒' }: { emoji?: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #c0392b, #922b21 50%, #7b241c 80%, #641e16)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
        }}
      />
      <div className="absolute inset-[3px] rounded-full border-2 border-[#e74c3c]/30" />
      <span className="relative z-10 text-xl">{emoji}</span>
      {/* Wax drip */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-b-full"
        style={{ background: 'radial-gradient(circle, #c0392b, #7b241c)' }}
      />
    </div>
  );
}

/* ═══════ BOOKMARK RIBBON ═══════ */
function BookmarkRibbon({ color = '#c0392b' }: { color?: string }) {
  return (
    <div className="absolute -top-1 right-6 z-10">
      <div className="relative" style={{ width: 24, height: 50 }}>
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: color,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-2"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }}
        />
      </div>
    </div>
  );
}

/* ═══════ PAGE CORNER FOLD ═══════ */
function PageCornerFold() {
  return (
    <div className="absolute bottom-0 right-0 pointer-events-none">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path d="M0 40 L40 40 L40 0 Z" fill="#e8dcc8" />
        <path d="M0 40 L40 40 L40 0 Z" fill="url(#cornerFoldGrad)" />
        <defs>
          <linearGradient id="cornerFoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4c5a9" />
            <stop offset="100%" stopColor="#c4b594" />
          </linearGradient>
        </defs>
        <path d="M10 40 L40 40 L40 10 Z" fill="#ede0c8" stroke="#c4b594" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

/* ═══════ QUILL PEN CURSOR DECORATION ═══════ */
function QuillDecoration() {
  return (
    <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
      <Feather className="h-8 w-8 text-[#5c4033]" style={{ transform: 'rotate(-30deg)' }} />
    </div>
  );
}

/* ═══════ ENTRY EDITOR (Writing Mode) ═══════ */
function EntryEditor({
  onSave,
  onCancel,
  initialEntry,
}: {
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialEntry?: JournalEntry;
}) {
  const [title, setTitle] = useState(initialEntry?.title ?? '');
  const [body, setBody] = useState(initialEntry?.body ?? '');
  const [mood, setMood] = useState(initialEntry?.mood ?? MOODS[0].id);
  const [weather, setWeather] = useState(initialEntry?.weather ?? WEATHERS[0].id);
  const [date, setDate] = useState(initialEntry?.date ?? new Date().toISOString().split('T')[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moodEmoji = MOODS.find(m => m.id === mood)?.emoji ?? '😊';
  const weatherEmoji = WEATHERS.find(w => w.id === weather)?.emoji ?? '☀️';

  const handleSave = () => {
    if (!body.trim() && !title.trim()) return;
    onSave({ date, title: title.trim() || 'Untitled', body: body.trim(), mood, weather });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="min-h-full"
    >
      {/* Journal Page */}
      <div className="relative sk-paper-aged rounded-lg overflow-hidden mx-auto max-w-lg" style={{ minHeight: 480 }}>
        <BookmarkRibbon />
        <InkBlot className="-top-4 -left-4" />
        <PageCornerFold />

        {/* Page header area */}
        <div className="pt-10 pb-4 px-6 border-b border-dashed border-[#c4b594]/50">
          {/* Date */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-3.5 w-3.5 text-[#8b7355]" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="old-typewriter text-xs text-[#8b7355] bg-transparent border-none outline-none cursor-pointer"
            />
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) soundTypewriterKey(); }}
            placeholder="Dear Diary..."
            className="w-full old-title text-xl font-black text-[#3d2b1f] bg-transparent border-none outline-none placeholder:text-[#c4b594]/60"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
          />

          {/* Mood + Weather row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-[#8b7355]" />
              <span className="old-label text-[9px]">Feeling:</span>
              <div className="flex gap-1">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                      mood === m.id ? 'bg-[#c4956a]/30 scale-125 ring-2 ring-[#8b5e3c]/40' : 'hover:scale-110'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3 w-3 text-[#8b7355]" />
              <span className="old-label text-[9px]">Weather:</span>
              <div className="flex gap-1">
                {WEATHERS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                      weather === w.id ? 'bg-[#c4956a]/30 scale-125 ring-2 ring-[#8b5e3c]/40' : 'hover:scale-110'
                    }`}
                    title={w.label}
                  >
                    {w.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Writing area - lined paper */}
        <div className="relative px-6 py-4" style={{ minHeight: 260 }}>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => { if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) soundTypewriterKey(); }}
            placeholder="Write your thoughts here... Let the ink flow like the old days..."
            className="w-full h-full min-h-[260px] old-handwritten text-sm text-[#3d2b1f] leading-[28px] bg-transparent border-none outline-none resize-none placeholder:text-[#c4b594]/50"
            style={{
              backgroundImage: 'linear-gradient(#c4d8e8 1px, transparent 1px)',
              backgroundSize: '100% 28px',
              backgroundPosition: '0 0',
              backgroundAttachment: 'local',
            }}
          />
          <InkBlot className="-bottom-3 right-8 w-10 h-10" />
          <QuillDecoration />
        </div>

        {/* Page footer */}
        <div className="px-6 py-3 border-t border-dashed border-[#c4b594]/50 flex items-center justify-between">
          <button onClick={onCancel} className="sk-btn old-btn px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-[#8b7355]">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <span className="old-label text-[9px] text-[#8b7355]">
              {moodEmoji} {weatherEmoji}
            </span>
            <button
              onClick={handleSave}
              className="sk-btn old-btn px-5 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <PenTool className="h-3 w-3" /> {initialEntry ? 'Update Entry' : 'Seal & Save'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ ENTRY VIEWER (Reading Mode) ═══════ */
function EntryViewer({
  entry,
  onEdit,
  onDelete,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  index,
  total,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  index: number;
  total: number;
}) {
  const moodEmoji = MOODS.find(m => m.id === entry.mood)?.emoji ?? '';
  const weatherEmoji = WEATHERS.find(w => w.id === entry.weather)?.emoji ?? '';

  return (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, rotateY: -15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: 15 }}
      transition={{ duration: 0.4 }}
      className="min-h-full flex flex-col"
    >
      <div className="relative sk-paper-aged rounded-lg overflow-hidden mx-auto max-w-lg flex-1 flex flex-col" style={{ minHeight: 480 }}>
        <BookmarkRibbon color="#8b5e3c" />
        <InkBlot className="-top-3 right-12 w-12 h-12" />
        <PageCornerFold />

        {/* Page header */}
        <div className="pt-10 pb-3 px-6 border-b border-dashed border-[#c4b594]/50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="old-typewriter text-[10px] text-[#8b7355] tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> {formatDate(entry.date)}
              </p>
              <h2 className="old-title text-xl font-black text-[#3d2b1f] mt-1" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                {entry.title}
              </h2>
            </div>
            <WaxSeal emoji={moodEmoji} />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="old-label text-[9px] flex items-center gap-1">
              <Heart className="h-3 w-3" /> {moodEmoji} {MOODS.find(m => m.id === entry.mood)?.label}
            </span>
            <span className="old-label text-[9px] flex items-center gap-1">
              <Cloud className="h-3 w-3" /> {weatherEmoji} {WEATHERS.find(w => w.id === entry.weather)?.label}
            </span>
            <span className="old-label text-[9px] text-[#c4b594]">
              {formatTimeAgo(entry.createdAt)}
            </span>
          </div>
        </div>

        {/* Body - handwritten on lined paper */}
        <div className="flex-1 px-6 py-5 relative overflow-y-auto sk-scrollbar" style={{ minHeight: 280 }}>
          <div
            className="old-handwritten text-sm text-[#3d2b1f] leading-[28px] whitespace-pre-wrap"
            style={{
              backgroundImage: 'linear-gradient(#c4d8e8 1px, transparent 1px)',
              backgroundSize: '100% 28px',
              backgroundPosition: '0 0',
              backgroundAttachment: 'local',
            }}
          >
            {entry.body}
          </div>
          <InkBlot className="bottom-4 left-4 w-8 h-8" />
          <QuillDecoration />
        </div>

        {/* Page footer - navigation */}
        <div className="px-6 py-3 border-t border-dashed border-[#c4b594]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={onPrev} disabled={!hasPrev} className={`sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${!hasPrev ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <ChevronLeft className="h-3 w-3 inline" /> Prev
              </button>
              <span className="old-typewriter text-[10px] text-[#8b7355]">{index + 1} / {total}</span>
              <button onClick={onNext} disabled={!hasNext} className={`sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${!hasNext ? 'opacity-30 cursor-not-allowed' : ''}`}>
                Next <ChevronRight className="h-3 w-3 inline" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                <PenTool className="h-3 w-3" /> Edit
              </button>
              <button onClick={onDelete} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-red-700 flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ JOURNAL COVER ═══════ */
function JournalCover({ onOpen, entryCount }: { onOpen: () => void; entryCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-8"
    >
      {/* Leather-bound book */}
      <motion.div
        whileHover={{ scale: 1.02, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpen}
        className="cursor-pointer relative"
        style={{ perspective: 800 }}
      >
        {/* Book spine shadow */}
        <div className="absolute -left-3 top-2 bottom-2 w-3 rounded-l" style={{
          background: 'linear-gradient(90deg, #2a1f14, #3d2b1f)',
          boxShadow: '-2px 0 6px rgba(0,0,0,0.3)',
        }} />

        {/* Book cover */}
        <div
          className="relative w-72 sm:w-80 rounded-r-lg overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #6b4226 0%, #5c3a22 30%, #4a2e18 60%, #3d2b1f 100%)',
            boxShadow: '6px 6px 20px rgba(0,0,0,0.4), -1px 0 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
            padding: '2rem 1.5rem',
            minHeight: 380,
          }}
        >
          {/* Leather texture */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
          }} />

          {/* Decorative border */}
          <div className="absolute inset-4 border border-double border-[#8b5e3c]/30 rounded" />
          <div className="absolute inset-6 border border-[#8b5e3c]/20 rounded" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full" style={{ minHeight: 340 }}>
            <div className="text-center mt-4">
              <WaxSeal emoji="📖" />
            </div>

            <div className="text-center my-6">
              <h2 className="old-title text-3xl font-black text-[#d4a574] mb-2" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 20px rgba(196,149,106,0.15)',
              }}>
                My Journal
              </h2>
              <div className="w-24 h-px mx-auto mb-2" style={{
                background: 'linear-gradient(90deg, transparent, #8b5e3c, transparent)',
              }} />
              <p className="old-handwritten text-sm text-[#a08868] italic">
                A collection of thoughts, memories &amp; reflections
              </p>
            </div>

            <div className="text-center mb-4">
              {entryCount > 0 ? (
                <div className="sk-vhs-label px-4 py-1.5 rounded inline-block mb-3">
                  <span className="old-typewriter text-xs font-bold text-[#5c4033]">
                    {entryCount} {entryCount === 1 ? 'Entry' : 'Entries'}
                  </span>
                </div>
              ) : (
                <p className="old-handwritten text-xs text-[#8b7355]/60 mb-3">Your story awaits...</p>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[#a08868]">
                <Feather className="h-4 w-4" style={{ transform: 'rotate(-20deg)' }} />
                <span className="old-typewriter text-[10px] tracking-wider">OPEN TO WRITE</span>
                <Feather className="h-4 w-4" style={{ transform: 'rotate(20deg) scaleX(-1)' }} />
              </div>
            </div>
          </div>

          {/* Corner ornaments */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#8b5e3c]/40 rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#8b5e3c]/40 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#8b5e3c]/40 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#8b5e3c]/40 rounded-br" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ ENTRIES LIST ═══════ */
function EntriesList({
  entries,
  onSelect,
  onNew,
  onBack,
}: {
  entries: JournalEntry[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-lg mx-auto"
    >
      {/* Back button */}
      <button onClick={onBack} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 mb-4">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Journal
      </button>

      <div className="flex items-center justify-between mb-4">
        <h3 className="old-title text-lg font-black text-[#3d2b1f]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
          📜 All Entries
        </h3>
        <button onClick={onNew} className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="sk-paper rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="old-handwritten text-sm text-[#8b7355]">No entries yet. Start writing your first memory.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const moodEmoji = MOODS.find(m => m.id === entry.mood)?.emoji ?? '';
            const weatherEmoji = WEATHERS.find(w => w.id === entry.weather)?.emoji ?? '';
            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(entry.id)}
                className="w-full text-left cursor-pointer"
              >
                <div
                  className="sk-paper rounded-lg p-4 hover:shadow-lg transition-all relative overflow-hidden group"
                  style={{
                    transform: `rotate(${(i % 3 - 1) * 0.5}deg)`,
                  }}
                >
                  <InkBlot className="-top-2 -right-2 w-8 h-8 opacity-[0.03]" />
                  <PageCornerFold />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="old-typewriter text-[9px] text-[#8b7355] tracking-wider uppercase">
                          {formatDate(entry.date)}
                        </span>
                        <span className="text-xs">{moodEmoji} {weatherEmoji}</span>
                      </div>
                      <h4 className="old-title text-sm font-black text-[#3d2b1f] truncate">{entry.title}</h4>
                      <p className="old-handwritten text-xs text-[#8b7355] mt-1 line-clamp-2 leading-relaxed">
                        {entry.body || 'Empty entry...'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#c4b594] mt-1 group-hover:text-[#8b5e3c] transition-colors flex-shrink-0" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════ MAIN JOURNAL COMPONENT ═══════ */
export default function OldJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<'cover' | 'list' | 'write' | 'read'>('cover');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<JournalEntry | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load entries from IndexedDB
  const loadEntries = useMemo(() => loadEntriesFromDB, []);
  useEffect(() => {
    let cancelled = false;
    loadEntries().then(data => {
      if (!cancelled) setEntries(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [loadEntries]);

  const handleSave = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    if (editEntry) {
      soundSave();
      // Update existing
      const updated = { ...editEntry, ...entry };
      setEntries(prev => prev.map(e => e.id === editEntry.id ? updated : e));
      putJournalEntry(updated).catch(() => {});
    } else {
      soundFloppyInsert();
      // Add new
      const newEntry: JournalEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
      };
      setEntries(prev => [newEntry, ...prev]);
      addJournalEntry(newEntry).catch(() => {});
    }
    setEditEntry(undefined);
    setView('read');
  }, [editEntry]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    soundDelete();
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== selectedId);
      deleteJournalEntry(selectedId).catch(() => {});
      return updated;
    });
    setSelectedId(null);
    setView('list');
    setConfirmDelete(false);
  }, [selectedId, confirmDelete]);

  const handleEdit = useCallback(() => {
    if (!selectedId) return;
    const entry = entries.find(e => e.id === selectedId);
    if (entry) {
      setEditEntry(entry);
      setView('write');
    }
  }, [selectedId, entries]);

  const currentEntry = entries.find(e => e.id === selectedId);
  const currentIndex = entries.findIndex(e => e.id === selectedId);

  return (
    <div className="relative min-h-full pb-4">
      <AnimatePresence mode="wait">
        {/* ═══ COVER VIEW ═══ */}
        {view === 'cover' && (
          <JournalCover
            key="cover"
            onOpen={() => { soundPageTurn(); entries.length > 0 ? setView('list') : setView('write'); }}
            entryCount={entries.length}
          />
        )}

        {/* ═══ ENTRIES LIST ═══ */}
        {view === 'list' && (
          <EntriesList
            key="list"
            entries={entries}
            onSelect={id => { soundPageTurn(); setSelectedId(id); setView('read'); }}
            onNew={() => { setEditEntry(undefined); setView('write'); }}
            onBack={() => { soundButtonClick(); setView('cover'); }}
          />
        )}

        {/* ═══ WRITE/EDIT ═══ */}
        {view === 'write' && (
          <EntryEditor
            key={`write-${editEntry?.id ?? 'new'}`}
            onSave={handleSave}
            onCancel={() => {
              soundButtonClick();
              setEditEntry(undefined);
              setView(entries.length > 0 ? 'list' : 'cover');
            }}
            initialEntry={editEntry}
          />
        )}

        {/* ═══ READ ENTRY ═══ */}
        {view === 'read' && currentEntry && (
          <EntryViewer
            key={`read-${currentEntry.id}`}
            entry={currentEntry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setView('list')}
            onPrev={() => {
              soundPageTurn();
              if (currentIndex > 0) setSelectedId(entries[currentIndex - 1].id);
            }}
            onNext={() => {
              soundPageTurn();
              if (currentIndex < entries.length - 1) setSelectedId(entries[currentIndex + 1].id);
            }}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < entries.length - 1}
            index={currentIndex}
            total={entries.length}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation toast */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 sk-paper rounded-lg px-4 py-2 shadow-xl"
          >
            <p className="old-handwritten text-xs text-[#c0392b]">
              Tap &quot;Discard&quot; again to confirm deletion
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}