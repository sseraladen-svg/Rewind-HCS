'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════ OLD-STYLE TRANSITION LOADER ═══════
   Shows a cassette tape loading animation when switching
   between tabs or opening features. Call `show()` to trigger.
*/

// Singleton state so the loader can be triggered from anywhere
let globalShowFn: ((msg?: string) => void) | null = null;
let globalHideFn: (() => void) | null = null;

export function triggerOldLoader(msg?: string) {
  globalShowFn?.(msg);
}

export function hideOldLoader() {
  globalHideFn?.();
}

const LOADER_MESSAGES = [
  'Rewinding tape...',
  'Loading memories...',
  'Please stand by...',
  'Searching archives...',
  'Dusting off shelves...',
  'Tuning frequencies...',
  'Warming up the tubes...',
  'Loading your past...',
];

export default function OldTransitionLoader() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [reelRotation, setReelRotation] = useState(0);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  const show = useCallback((msg?: string) => {
    setMessage(msg || LOADER_MESSAGES[Math.floor(Math.random() * LOADER_MESSAGES.length)]);
    setProgress(0);
    setDots('');
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setReelRotation(0);
    }, 500);
  }, []);

  useEffect(() => {
    globalShowFn = show;
    globalHideFn = hide;
    return () => {
      globalShowFn = null;
      globalHideFn = null;
    };
  }, [show, hide]);

  // Animate cassette reels (slower, old-school feel)
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setReelRotation(r => r + 8);
    }, 120);
    return () => clearInterval(interval);
  }, [visible]);

  // Animate dots (slower)
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  // Animate progress (slower, chunkier fills like old dial-up)
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 88) return p; // Pause at 88 until hide is called
        return p + Math.random() * 8;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(26, 18, 8, 0.92)' }}
        >
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          }} />

          <div className="relative z-10 flex flex-col items-center">
            {/* Cassette Tape Body */}
            <div
              className="relative w-64 sm:w-72 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #f0e6d3 0%, #e8dcc8 30%, #d4c5a9 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
                border: '2px solid #c4b594',
              }}
            >
              {/* Cassette top section */}
              <div className="px-5 pt-4 pb-3">
                {/* Label area */}
                <div
                  className="sk-vhs-label rounded-lg px-4 py-2 mb-4 text-center"
                >
                  <span className="old-typewriter text-[10px] font-bold text-[#5c4033] tracking-wider uppercase">
                    ⏪ Rewind ⏩
                  </span>
                </div>

                {/* Reels area */}
                <div className="flex items-center justify-center gap-8 mb-3">
                  {/* Left Reel */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                      style={{
                        borderColor: '#a08868',
                        background: 'linear-gradient(145deg, #3d2b1f, #2a1f14)',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.2)',
                        transform: `rotate(${reelRotation}deg)`,
                      }}
                    >
                      {/* Spokes */}
                      <div className="w-10 h-10 rounded-full border-2 border-[#5c4033] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#5c4033]" />
                      </div>
                    </div>
                  </div>

                  {/* Tape window */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-6 rounded"
                      style={{
                        background: 'linear-gradient(180deg, rgba(139,94,60,0.2), rgba(139,94,60,0.1))',
                        border: '1px solid #c4b594',
                      }}
                    />
                    {/* Tape between reels */}
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-1 bg-[#5c4033]/40 rounded" />
                      <div className="w-8 h-px bg-[#5c4033]/20" />
                      <div className="w-0.5 h-1 bg-[#5c4033]/40 rounded" />
                    </div>
                  </div>

                  {/* Right Reel */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                      style={{
                        borderColor: '#a08868',
                        background: 'linear-gradient(145deg, #3d2b1f, #2a1f14)',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.2)',
                        transform: `rotate(${-reelRotation}deg)`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-[#5c4033] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#5c4033]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section - screws & progress */}
              <div className="px-5 pb-4">
                {/* Screw holes */}
                <div className="flex justify-between mb-3">
                  {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{
                      background: 'radial-gradient(circle at 35% 35%, #a08868, #6b5a40)',
                      boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.3)',
                    }} />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(180deg, #e8dcc8, #d4c5a9)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                  border: '1px solid #c4b594',
                }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #8b5e3c, #c4956a)',
                      width: `${Math.min(progress, 100)}%`,
                      transition: 'width 0.2s ease-out',
                    }}
                  />
                </div>

                {/* Message */}
                <div className="text-center mt-2.5">
                  <p className="old-typewriter text-xs text-[#5c4033]">
                    {message}{dots}
                  </p>
                </div>
              </div>
            </div>

            {/* VHS tracking line */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#c4956a]/20" style={{
              animation: 'vhs-track 2.5s ease-in-out infinite',
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════ TYPEWRITER TEXT HOOK ═══════ */
export function useTypewriter(text: string, speed = 30, delay = 0) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDisplayed('');
    setDone(false);

    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return; }
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => { cancelled = true; clearTimeout(startTimeout); };
  }, [text, speed, delay]);

  return { displayed, done };
}

/* ═══════ TYPEWRITER TEXT COMPONENT ═══════ */
export function TypewriterText({ text, speed = 30, delay = 0, className = '', as: Tag = 'span' }: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  const { displayed, done } = useTypewriter(text, speed, delay);
  const Component = Tag as React.ElementType;
  return (
    <Component className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle" style={{ animation: 'blink-cursor 0.6s step-end infinite' }} />
      )}
    </Component>
  );
}