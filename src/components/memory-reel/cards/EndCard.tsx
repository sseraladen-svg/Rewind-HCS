'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

/* ═══════ END CARD ═══════ */

export default function EndCard() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        {/* Closed book / sealed journal graphic */}
        <div className="relative mb-6">
          {/* Book body */}
          <div
            className="w-40 h-48 rounded-lg relative flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8b5e3c 0%, #6b4226 40%, #5c4033 100%)',
              boxShadow: '4px 4px 12px rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.05) inset',
            }}
          >
            {/* Spine line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-3 rounded-l-lg"
              style={{
                background: 'linear-gradient(90deg, #3d2b1f, #5c4033)',
              }}
            />

            {/* Pages edge (right side) */}
            <div
              className="absolute right-[-2px] top-2 bottom-2 w-2"
              style={{
                background: 'repeating-linear-gradient(180deg, #faf6eb 0px, #faf6eb 2px, #e8dcc8 2px, #e8dcc8 4px)',
                borderRadius: '0 2px 2px 0',
              }}
            />

            {/* Seal / emblem */}
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 40% 35%, #d4a574, #c4956a, #8b5e3c)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              <BookOpen className="h-7 w-7 text-[#faf6eb]" />
            </motion.div>
          </div>

          {/* Wax seal */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full
              flex items-center justify-center text-sm z-10"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #e8c9a0, #c4956a, #8b5e3c)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 -1px 2px rgba(0,0,0,0.2)',
            }}
          >
            ✦
          </div>
        </div>

        {/* Text */}
        <h3 className="old-title text-xl sm:text-2xl font-black text-[#3d2b1f] mb-2">
          You&apos;re all caught up
        </h3>
        <p className="old-body text-sm text-[#8b7355] leading-relaxed max-w-xs">
          Every memory has its moment. Come back later — there&apos;s always more to rediscover.
        </p>

        {/* Decorative pin */}
        <div className="mt-6 sk-pin w-4 h-4 rounded-full shadow-sm" />
      </motion.div>
    </div>
  );
}