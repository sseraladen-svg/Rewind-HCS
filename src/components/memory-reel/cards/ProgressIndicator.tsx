'use client';

import { motion } from 'framer-motion';

/* ═══════ PROGRESS INDICATOR ═══════ */

export default function ProgressIndicator({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  if (total <= 1) return null;

  // For many cards, use a thin line; for few, use dots
  const useLine = total > 10;
  const progress = total > 1 ? currentIndex / (total - 1) : 0;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
      {useLine ? (
        /* Thin line indicator */
        <div className="w-32 sm:w-48 h-1 rounded-full bg-[#3d2b1f]/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #c4956a, #d4a574)' }}
            animate={{ width: `${Math.max(8, progress * 100)}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      ) : (
        /* Dot indicators */
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3d2b1f]/10 backdrop-blur-sm">
          {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? 10 : 5,
                height: 5,
                background: i === currentIndex ? '#c4956a' : 'rgba(61,43,31,0.25)',
              }}
            />
          ))}
          {total > 12 && <span className="text-[8px] text-[#8b7355] ml-0.5 old-typewriter">...</span>}
        </div>
      )}
    </div>
  );
}