'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, HelpCircle, BookOpen, Gamepad2, CheckCircle2, XCircle } from 'lucide-react';
import type { DiscoveryCardData } from '@/lib/memory-reel/types';
import ReactionRow from './ReactionRow';

const formatConfig: Record<string, { icon: React.ReactNode; label: string; bgColor: string }> = {
  song:    { icon: <Music className="h-4 w-4" />,       label: 'Mixtape Pick',   bgColor: 'rgba(139,94,60,0.06)' },
  trivia:  { icon: <HelpCircle className="h-4 w-4" />,  label: 'Did You Remember?', bgColor: 'rgba(139,94,60,0.06)' },
  fact:    { icon: <BookOpen className="h-4 w-4" />,     label: 'Era Flashback',   bgColor: 'rgba(139,94,60,0.06)' },
  minigame:{ icon: <Gamepad2 className="h-4 w-4" />,    label: 'Quick Round',     bgColor: 'rgba(196,149,106,0.06)' },
};

/* ═══════ DISCOVERY CARD ═══════ */

export default function DiscoveryCard({
  card,
  reaction,
  onReact,
}: {
  card: DiscoveryCardData;
  reaction?: string;
  onReact?: (r: string) => void;
}) {
  const config = formatConfig[card.format] || formatConfig.fact;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = useCallback((idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 2500);
  }, [showResult]);

  const isCorrect = selectedOption === card.triviaCorrect;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-6">
      <div
        className="w-full max-w-md sk-paper rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden
          sk-noise flex flex-col gap-4"
        style={{ minHeight: '60vh', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] old-label
              uppercase tracking-widest text-[#8b5e3c]"
            style={{ background: config.bgColor, border: '1px solid rgba(139,94,60,0.15)' }}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Emoji + Title */}
        <div className="flex items-start gap-3">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-4xl sm:text-5xl shrink-0 mt-0.5"
          >
            {card.emoji}
          </motion.span>
          <div>
            <h3 className="old-heading text-lg sm:text-xl text-[#3d2b1f] leading-tight">
              {card.title}
            </h3>
            {card.format !== 'minigame' && (
              <p className="old-body text-sm text-[#5c4033] mt-1.5 leading-relaxed">
                {card.description}
              </p>
            )}
          </div>
        </div>

        {/* Tape decoration */}
        <div className="sk-tape w-16 h-4 mx-auto -my-1 rounded-sm opacity-40" />

        {/* Trivia / Mini-game options */}
        {(card.format === 'trivia' || card.format === 'minigame') && card.triviaOptions && (
          <div className="flex flex-col gap-2">
            {card.triviaQuestion && (
              <p className="old-typewriter text-xs text-[#8b7355] mb-1">
                {card.triviaQuestion}
              </p>
            )}
            {card.triviaOptions.map((opt, i) => {
              let optionStyle = 'sk-inset old-typewriter text-sm border-0 rounded-lg p-3 text-left cursor-pointer transition-all w-full';
              if (showResult) {
                if (i === card.triviaCorrect) {
                  optionStyle += ' bg-green-100 border-2 border-green-400 text-green-800';
                } else if (i === selectedOption && !isCorrect) {
                  optionStyle += ' bg-red-100 border-2 border-red-400 text-red-800';
                } else {
                  optionStyle += ' opacity-50';
                }
              } else {
                optionStyle += ' text-[#3d2b1f] hover:bg-[#e8dcc8] active:scale-[0.98]';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  disabled={showResult}
                  className={optionStyle}
                >
                  <span className="flex items-center gap-2">
                    {showResult && i === card.triviaCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {showResult && i === selectedOption && !isCorrect && i !== card.triviaCorrect && (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Song format — inline player look */}
        {card.format === 'song' && (
          <div className="flex items-center gap-3 p-3 rounded-xl sk-vhs-label">
            <div className="w-10 h-10 rounded-full flex items-center justify-center sk-leather">
              <Music className="h-5 w-5 text-[#d4a574]" />
            </div>
            <div className="flex-1">
              <p className="old-typewriter text-xs text-[#3d2b1f] font-bold">{card.title}</p>
              <p className="old-body text-[11px] text-[#8b7355] mt-0.5">{card.description}</p>
            </div>
            <div className="flex gap-0.5">
              {[0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 0.4, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 h-4 bg-[#8b5e3c] rounded-full origin-bottom"
                />
              ))}
            </div>
          </div>
        )}

        {/* Fact format — large quote style */}
        {card.format === 'fact' && (
          <div className="text-center py-3">
            <p className="old-quote text-base sm:text-lg text-[#5c4033] italic leading-relaxed">
              &ldquo;{card.description}&rdquo;
            </p>
            <p className="old-typewriter text-[10px] text-[#c4956a] mt-3 uppercase tracking-widest">
              From the archives
            </p>
          </div>
        )}

        {/* Reaction */}
        {onReact && (
          <div className="flex justify-end mt-auto pt-2">
            <ReactionRow currentReaction={reaction} onReact={onReact} />
          </div>
        )}
      </div>
    </div>
  );
}