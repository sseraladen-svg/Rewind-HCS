'use client';

import { motion } from 'framer-motion';
import { Sparkles, Flame, Calendar } from 'lucide-react';
import type { GrowthSignalCardData } from '@/lib/memory-reel/types';
import ReactionRow from './ReactionRow';

const signalIcons: Record<string, React.ReactNode> = {
  streak: <Flame className="h-6 w-6" />,
  milestone: <Calendar className="h-6 w-6" />,
  activity: <Sparkles className="h-6 w-6" />,
};

const signalLabels: Record<string, string> = {
  streak: 'Mood Streak',
  milestone: 'Milestone',
  activity: 'Activity Streak',
};

/* ═══════ GROWTH SIGNAL CARD ═══════ */

export default function GrowthSignalCard({
  card,
  reaction,
  onReact,
}: {
  card: GrowthSignalCardData;
  reaction?: string;
  onReact?: (r: string) => void;
}) {
  const Icon = signalIcons[card.signalType] || <Sparkles className="h-6 w-6" />;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center
          relative overflow-hidden"
        style={{
          minHeight: '50vh',
          maxHeight: '70vh',
          background: 'linear-gradient(135deg, #faf6eb 0%, #f5edd6 50%, #ede0c8 100%)',
          border: '2px solid #c4956a',
          boxShadow: '0 0 30px rgba(196,149,106,0.15), 0 8px 24px rgba(61,43,31,0.1), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {/* Warm gold glow orb */}
        <div
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(196,149,106,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Label badge */}
        <div
          className="mb-4 px-3 py-1 rounded-full text-[10px] old-label uppercase tracking-widest
            flex items-center gap-1.5"
          style={{
            color: '#c4956a',
            border: '1px solid rgba(196,149,106,0.4)',
            background: 'rgba(196,149,106,0.08)',
          }}
        >
          {Icon}
          {signalLabels[card.signalType]}
        </div>

        {/* Main message */}
        <h3 className="old-title text-2xl sm:text-3xl font-black text-[#3d2b1f] mb-3 leading-tight">
          {card.message}
        </h3>

        {/* Detail */}
        {card.detail && (
          <p className="old-body text-sm text-[#8b7355] leading-relaxed max-w-sm">
            {card.detail}
          </p>
        )}

        {/* Decorative seal */}
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'radial-gradient(circle at 40% 40%, #d4a574, #c4956a, #8b5e3c)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          ✦
        </motion.div>

        {/* Reaction */}
        {onReact && (
          <div className="mt-4">
            <ReactionRow currentReaction={reaction} onReact={onReact} />
          </div>
        )}
      </motion.div>
    </div>
  );
}