'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Music, Sticker, Camera, CloudRain, Sun, Moon, Cloud, CloudLightning, Snowflake } from 'lucide-react';
import type { MemoryCardData } from '@/lib/memory-reel/types';
import { MOODS } from '@/lib/memory-reel/types';
import { saveMoodTag } from '@/lib/memory-reel/generateFeed';
import ReactionRow from './ReactionRow';

/* ───── Helpers ───── */

const sourceIcons: Record<string, React.ReactNode> = {
  journal: <BookOpen className="h-3.5 w-3.5" />,
  camera: <Camera className="h-3.5 w-3.5" />,
  mixtape: <Music className="h-3.5 w-3.5" />,
  sticker: <Sticker className="h-3.5 w-3.5" />,
};

const weatherIcons: Record<string, React.ReactNode> = {
  '☀️': <Sun className="h-3.5 w-3.5" />,
  '☁️': <Cloud className="h-3.5 w-3.5" />,
  '🌧️': <CloudRain className="h-3.5 w-3.5" />,
  '🌙': <Moon className="h-3.5 w-3.5" />,
  '⛈️': <CloudLightning className="h-3.5 w-3.5" />,
  '❄️': <Snowflake className="h-3.5 w-3.5" />,
};

/* ───── Inline Mood Picker ───── */

function InlineMoodPicker({
  currentMood,
  onSelect,
}: {
  currentMood?: string;
  onSelect: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs old-typewriter
          bg-[#e8dcc8] border border-[#c4b594] text-[#5c4033] shadow-sm hover:shadow-md
          transition-shadow cursor-pointer"
      >
        {currentMood || 'Add mood'}
        <span className="text-[8px] opacity-60">▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            className="absolute top-full left-0 mt-1 sk-paper rounded-xl p-2 shadow-lg z-10
              border border-[#c4b594] flex gap-1.5 flex-wrap max-w-[200px]"
          >
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.emoji); setOpen(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg
                  hover:bg-[#e8dcc8] transition-colors cursor-pointer"
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ MEMORY CARD ═══════ */

export default function MemoryCard({
  card,
  reaction,
  onReact,
}: {
  card: MemoryCardData;
  reaction?: string;
  onReact?: (r: string) => void;
}) {
  const [localMood, setLocalMood] = useState(card.mood);

  const handleMoodSelect = useCallback((emoji: string) => {
    setLocalMood(emoji);
    saveMoodTag(card.sourceId, card.sourceType, emoji);
  }, [card.sourceId, card.sourceType]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-6 relative">
      <div
        className="w-full max-w-md sk-paper-aged rounded-2xl p-5 sm:p-6 shadow-lg
          relative overflow-hidden sk-noise flex flex-col gap-3"
        style={{ minHeight: '60vh', maxHeight: '85vh' }}
      >
        {/* Top row: mood + source icon + date */}
        <div className="flex items-center justify-between">
          {/* Mood badge — top-left */}
          <div className="flex items-center gap-2">
            {localMood ? (
              <span
                className="text-2xl drop-shadow-sm"
                title="Mood"
              >
                {localMood}
              </span>
            ) : (
              <InlineMoodPicker onSelect={handleMoodSelect} />
            )}
            {/* Source type indicator */}
            <span className="flex items-center gap-1 text-[#8b7355] old-label text-[9px] uppercase tracking-wider">
              {sourceIcons[card.sourceType]}
              {card.sourceType}
            </span>
          </div>

          {/* Weather (journal only) */}
          {card.weather && weatherIcons[card.weather] && (
            <span className="text-[#8b7355]">{weatherIcons[card.weather]}</span>
          )}

          {/* Date + ago */}
          <div className="text-right">
            <p className="old-typewriter text-[10px] text-[#8b7355]">
              {new Date(card.date).toLocaleDateString()}
            </p>
            <p className="old-label text-[9px] text-[#c4956a] uppercase tracking-wider">
              {card.agoLabel}
            </p>
          </div>
        </div>

        {/* Decorative tape strip */}
        <div className="sk-tape w-20 h-5 mx-auto -my-1 rounded-sm opacity-60" />

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center overflow-auto">
          {/* Photo (camera source) */}
          {card.photoUrl && (
            <div
              className="sk-polaroid rounded-lg overflow-hidden mb-3 mx-auto"
              style={{ maxWidth: '280px' }}
            >
              <img
                src={card.photoUrl}
                alt={card.title}
                className="w-full h-auto"
                style={{ filter: 'sepia(0.3) contrast(1.05) brightness(0.95)' }}
              />
            </div>
          )}

          {/* Sticker cluster */}
          {card.sourceType === 'sticker' && (
            <div className="flex justify-center gap-2 text-4xl my-4 flex-wrap">
              {card.title.split(' ').filter(Boolean).map((emoji, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: (i % 2 === 0 ? -3 : 3) }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="old-heading text-lg sm:text-xl text-[#3d2b1f] mb-1">
            {card.title}
          </h3>

          {/* Body (journal) */}
          {card.body && (
            <p className="old-body text-sm text-[#5c4033] leading-relaxed whitespace-pre-line">
              {card.body.length > 280 ? card.body.slice(0, 280) + '...' : card.body}
            </p>
          )}

          {/* Mixtape context */}
          {card.sourceType === 'mixtape' && card.body && (
            <p className="old-typewriter text-xs text-[#8b7355] mt-2 italic">
              🎵 {card.body}
            </p>
          )}
        </div>

        {/* Reaction row — bottom-right */}
        {onReact && (
          <div className="flex justify-end mt-2">
            <ReactionRow currentReaction={reaction} onReact={onReact} />
          </div>
        )}
      </div>
    </div>
  );
}