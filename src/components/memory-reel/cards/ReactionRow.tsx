'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REACTIONS, type ReactionType } from '@/lib/memory-reel/types';

/* ═══════ REACTION ROW ═══════ */

export default function ReactionRow({
  currentReaction,
  onReact,
}: {
  currentReaction?: string;
  onReact: (r: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const current = REACTIONS.find(r => r.type === currentReaction);

  const handleToggle = useCallback((type: ReactionType) => {
    if (currentReaction === type) {
      // Deselect
      onReact('');
    } else {
      onReact(type);
    }
    setExpanded(false);
  }, [currentReaction, onReact]);

  return (
    <div className="relative">
      {/* Current reaction pill (or + button) */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
          text-xs shadow-sm transition-shadow hover:shadow-md cursor-pointer"
        style={{
          background: current
            ? 'rgba(196,149,106,0.15)'
            : 'rgba(232,220,200,0.9)',
          border: `1px solid ${current ? '#c4956a' : '#c4b594'}`,
          color: '#5c4033',
        }}
      >
        {current ? current.emoji : (
          <span className="text-sm">+</span>
        )}
      </button>

      {/* Expanded row */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full right-0 mb-1.5 sk-paper rounded-xl p-1.5
              shadow-lg border border-[#c4b594] flex gap-1 z-20"
          >
            {REACTIONS.map(r => {
              const isActive = currentReaction === r.type;
              return (
                <motion.button
                  key={r.type}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleToggle(r.type)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl
                    transition-colors cursor-pointer relative
                    ${isActive ? 'bg-[#c4956a]/20' : 'hover:bg-[#e8dcc8]'}`}
                  title={r.type}
                >
                  {r.emoji}
                  {isActive && (
                    <motion.div
                      layoutId="reaction-active-ring"
                      className="absolute inset-0 rounded-lg border-2 border-[#c4956a] pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}