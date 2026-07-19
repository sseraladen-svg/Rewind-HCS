'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, PenTool } from 'lucide-react';
import type { ThenVsNowCardData } from '@/lib/memory-reel/types';
import { MOODS } from '@/lib/memory-reel/types';
import { saveThenVsNowReflection } from '@/lib/memory-reel/generateFeed';
import ReactionRow from './ReactionRow';

/* ═══════ THEN VS NOW CARD ═══════ */

export default function ThenVsNowCard({
  card,
  reaction,
  onReact,
}: {
  card: ThenVsNowCardData;
  reaction?: string;
  onReact?: (r: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [reflection, setReflection] = useState(card.reflection || '');
  const [reflectionMood, setReflectionMood] = useState(card.reflectionMood || '');
  const [showInput, setShowInput] = useState(!card.reflection);
  const [saved, setSaved] = useState(!!card.reflection);

  const handleSave = useCallback(() => {
    if (!reflection.trim() && !reflectionMood) return;
    saveThenVsNowReflection(card.sourceId, reflection.trim(), reflectionMood);
    setSaved(true);
    setShowInput(false);
  }, [card.sourceId, reflection, reflectionMood]);

  const handleMoodOnly = useCallback((emoji: string) => {
    setReflectionMood(emoji);
    saveThenVsNowReflection(card.sourceId, '', emoji);
    setSaved(true);
    setShowInput(false);
  }, [card.sourceId]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-6 relative">
      <div
        className="w-full max-w-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col"
        style={{
          minHeight: '60vh',
          maxHeight: '85vh',
          perspective: '800px',
        }}
      >
        {/* THEN half — top */}
        <motion.div
          className="flex-1 sk-paper-aged p-5 sm:p-6 flex flex-col justify-center overflow-auto relative sk-noise"
          style={{
            transformStyle: 'preserve-3d',
            rotateX: flipped ? 90 : 0,
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="old-label text-[9px] uppercase tracking-widest text-[#8b5e3c]">
              Then
            </span>
            <div className="flex-1 h-px bg-[#c4b594]/50" />
            <span className="old-typewriter text-[10px] text-[#8b7355]">
              {card.thenAgoLabel}
            </span>
          </div>

          {/* Original content */}
          <h3 className="old-heading text-lg sm:text-xl text-[#3d2b1f] mb-2">
            {card.thenTitle}
          </h3>
          {card.thenBody && (
            <p className="old-body text-sm text-[#5c4033] leading-relaxed">
              {card.thenBody.length > 200 ? card.thenBody.slice(0, 200) + '...' : card.thenBody}
            </p>
          )}

          {/* Flip button */}
          <button
            onClick={() => setFlipped(true)}
            className="mt-4 self-center sk-btn old-btn px-4 py-2 rounded-lg text-xs
              flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            How does this feel now?
          </button>
        </motion.div>

        {/* NOW half — appears on flip */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#faf6eb] flex flex-col p-5 sm:p-6 justify-center sk-noise z-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="old-label text-[9px] uppercase tracking-widest text-[#c4956a]">
                  Now
                </span>
                <div className="flex-1 h-px bg-[#c4b594]/50" />
              </div>

              <p className="old-body text-sm text-[#5c4033] mb-4 text-center italic">
                &ldquo;How does this feel looking back?&rdquo;
              </p>

              {showInput ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder="Write a short reflection..."
                    maxLength={200}
                    rows={3}
                    className="sk-inset old-typewriter text-sm border-0 resize-none rounded-lg p-3
                      text-[#3d2b1f] placeholder-[#a89878] w-full"
                  />

                  {/* Mood-only quick response */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {MOODS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleMoodOnly(m.emoji)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base
                            transition-all cursor-pointer border
                            ${reflectionMood === m.emoji
                              ? 'border-[#c4956a] bg-[#c4956a]/10 scale-110'
                              : 'border-transparent hover:bg-[#e8dcc8]'
                            }`}
                          title={m.label}
                        >
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={!reflection.trim() && !reflectionMood}
                      className="sk-btn old-btn px-4 py-2 rounded-lg text-xs cursor-pointer
                        flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-default"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {saved && reflectionMood && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-4xl mb-3"
                    >
                      {reflectionMood}
                    </motion.div>
                  )}
                  {saved && reflection && (
                    <p className="old-handwritten text-base text-[#5c4033] mb-3">
                      &ldquo;{reflection}&rdquo;
                    </p>
                  )}
                  {saved && (
                    <p className="old-typewriter text-[10px] text-[#c4956a] uppercase tracking-widest">
                      Reflection saved
                    </p>
                  )}
                  <button
                    onClick={() => setFlipped(false)}
                    className="mt-4 sk-btn old-btn px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    ← Back to memory
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction row */}
        {onReact && !flipped && (
          <div className="absolute bottom-3 right-3 z-20">
            <ReactionRow currentReaction={reaction} onReact={onReact} />
          </div>
        )}
      </div>
    </div>
  );
}