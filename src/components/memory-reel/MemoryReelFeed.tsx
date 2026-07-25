'use client';

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { generateFeed, saveThenVsNowReflection, saveMoodTag } from '@/lib/memory-reel/generateFeed';
import type { FeedCard, CardReaction } from '@/lib/memory-reel/types';
import { getReelReactions, setReelReaction } from '@/lib/idb-store';
import MemoryCard from './cards/MemoryCard';
import ThenVsNowCard from './cards/ThenVsNowCard';
import GrowthSignalCard from './cards/GrowthSignalCard';
import DiscoveryCard from './cards/DiscoveryCard';
import EndCard from './cards/EndCard';
import ProgressIndicator from './cards/ProgressIndicator';

/* ───── Reaction persistence ───── */

function loadReactions() {
  return getReelReactions();
}
function persistReaction(cardId: string, reaction: string) {
  setReelReaction(cardId, reaction).catch(() => {});
}

/* ───── Card key helper ───── */
function cardKey(card: FeedCard, index: number): string {
  if (card.type === 'end') return 'end';
  if (card.type === 'growth') return `growth_${index}`;
  if (card.type === 'discovery') return card.entryId;
  return `${card.type}_${card.sourceId}`;
}

/* ═══════ MEMORY REEL FEED ═══════ */

export default function MemoryReelFeed({
  birthYear,
  onClose,
}: {
  birthYear: number;
  onClose: () => void;
}) {
  const [feed, setFeed] = useState<FeedCard[]>([]);
  useEffect(() => {
    generateFeed({ birthYear }).then(setFeed).catch(() => setFeed([{ type: 'end' as const }]));
  }, [birthYear]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragDelta = useRef(0);

  // Load reactions from IDB
  useEffect(() => {
    getReelReactions().then(setReactions).catch(() => {});
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex(i => Math.min(i + 1, feed.length - 1));
  }, [feed.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(i => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  // Touch / mouse drag
  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    dragDelta.current = 0;
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    dragDelta.current = clientY - dragStartY.current;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 60;
    if (dragDelta.current < -threshold) {
      goNext();
    } else if (dragDelta.current > threshold) {
      goPrev();
    }
    dragDelta.current = 0;
  }, [goNext, goPrev]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    const onMouseMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onMouseUp = () => {
      handleDragEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  // Wheel
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (wheelTimer.current) return; // debounce
    if (e.deltaY > 20) goNext();
    else if (e.deltaY < -20) goPrev();
    wheelTimer.current = setTimeout(() => { wheelTimer.current = null; }, 400);
  }, [goNext, goPrev]);

  // Reaction handler
  const handleReact = useCallback((index: number, reaction: string) => {
    const card = feed[index];
    if (!card || card.type === 'end') return;
    const key = cardKey(card, index);
    setReactions(prev => {
      const next = { ...prev };
      if (reaction) next[key] = reaction;
      else delete next[key];
      persistReaction(key, reaction);
      return next;
    });
  }, [feed]);

  const currentCard = feed[activeIndex];

  // Direction for animation (derived from ref, no extra render)
  const directionRef = useRef(0);
  const [direction, setDirection] = useState(0);
  const prevIndexRef = useRef(activeIndex);
  // Update direction synchronously when activeIndex changes (during render, not in effect)
  if (activeIndex !== prevIndexRef.current) {
    directionRef.current = activeIndex > prevIndexRef.current ? 1 : -1;
    setDirection(directionRef.current);
    prevIndexRef.current = activeIndex;
  }

  const variants = {
    enter: (d: number) => ({
      y: d >= 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
    exit: (d: number) => ({
      y: d >= 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #f5edd6 0%, #ede0c8 40%, #e8d8b8 100%)',
      }}
    >
      {/* Cork texture overlay */}
      <div className="absolute inset-0 sk-cork opacity-30 pointer-events-none" />

      {/* Progress indicator */}
      <ProgressIndicator currentIndex={activeIndex} total={feed.length} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-40 w-9 h-9 rounded-full sk-btn flex items-center
          justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow"
      >
        <X className="h-4 w-4 text-[#3d2b1f]" />
      </button>

      {/* Keyboard hint (desktop) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-3
        px-3 py-1.5 rounded-full bg-[#3d2b1f]/8 backdrop-blur-sm">
        <span className="flex items-center gap-1 text-[9px] old-typewriter text-[#8b7355]">
          <ArrowUp className="h-3 w-3" /> / <ArrowDown className="h-3 w-3" />
          or J / K to navigate
        </span>
        <span className="text-[9px] text-[#c4b594]">|</span>
        <span className="text-[9px] old-typewriter text-[#8b7355]">ESC to close</span>
      </div>

      {/* Card viewport */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {currentCard?.type === 'memory' && (
              <MemoryCard
                card={currentCard}
                reaction={reactions[cardKey(currentCard, activeIndex)]}
                onReact={(r) => handleReact(activeIndex, r)}
              />
            )}
            {currentCard?.type === 'then_vs_now' && (
              <ThenVsNowCard
                card={currentCard}
                reaction={reactions[cardKey(currentCard, activeIndex)]}
                onReact={(r) => handleReact(activeIndex, r)}
              />
            )}
            {currentCard?.type === 'growth' && (
              <GrowthSignalCard
                card={currentCard}
                reaction={reactions[cardKey(currentCard, activeIndex)]}
                onReact={(r) => handleReact(activeIndex, r)}
              />
            )}
            {currentCard?.type === 'discovery' && (
              <DiscoveryCard
                card={currentCard}
                reaction={reactions[cardKey(currentCard, activeIndex)]}
                onReact={(r) => handleReact(activeIndex, r)}
              />
            )}
            {currentCard?.type === 'end' && <EndCard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}