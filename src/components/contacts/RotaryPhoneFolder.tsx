'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import { soundDialPulse, soundPhoneRing, soundButtonClick } from '@/lib/sounds';

/* ═══════════════════════════════════════════════════════════════
   Rotary Phone Section — Interactive rotary dial with spin & ring shake
   ═══════════════════════════════════════════════════════════════ */

const PHONE_MESSAGES = [
  "Nobody's home! Leave a message after the beep.",
  'The number you have dialed... is your childhood. Please try again.',
  'Connection established. Rewinding memories...',
  'Sorry, the number you have reached is not in service... just kidding, hey!',
  'Ring ring! Hi! You reached the Rewind hotline.',
  'Please hold... *elevator music plays* ...still holding? Ok, hi!',
];

export default function RotaryPhoneFolder() {
  const [dialed, setDialed] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [callMsg, setCallMsg] = useState('');
  const [ringCount, setRingCount] = useState(0);
  const dialRef = useRef<HTMLDivElement>(null);

  const dialNumber = useCallback((n: number) => {
    if (spinning) return;
    soundDialPulse();
    setSpinning(true);
    setDialed((prev) => [...prev, n]);

    // Spin the dial: rotate clockwise to the finger stop, then snap back
    if (dialRef.current) {
      const rotationAngle = (10 - n) * 30 + 30;
      dialRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)';
      dialRef.current.style.transform = `rotate(${rotationAngle}deg)`;
      setTimeout(() => {
        if (dialRef.current) {
          dialRef.current.style.transition = 'transform 0.35s cubic-bezier(0.5, 0, 0.5, 1)';
          dialRef.current.style.transform = 'rotate(0deg)';
        }
      }, 550);
    }

    setTimeout(() => setSpinning(false), 950);
  }, [spinning]);

  const handleCall = useCallback(() => {
    if (dialed.length === 0 || ringing) return;
    setRinging(true);
    soundPhoneRing();
    setRingCount(0);
    setCallMsg('');

    const ringInterval = setInterval(() => {
      setRingCount((prev) => prev + 1);
    }, 800);

    setTimeout(() => {
      clearInterval(ringInterval);
      setCallMsg(PHONE_MESSAGES[Math.floor(Math.random() * PHONE_MESSAGES.length)]);
      setRinging(false);
    }, 2800);
  }, [dialed, ringing]);

  const handleClear = useCallback(() => {
    soundButtonClick();
    setDialed([]);
    setCallMsg('');
    setRingCount(0);
  }, []);

  const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const getAngle = (i: number) => (i * 30 + 150) * (Math.PI / 180);

  return (
    <section className="scroll-mt-8">
      <div className="max-w-xs mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: ringing ? [0, 8, -8, 6, -6, 4, -4, 2, -2, 0] : 0,
          }}
          transition={
            ringing
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.4, type: 'spring' }
          }
          className="sk-paper rounded-xl p-6 relative overflow-visible"
        >
          {/* Phone receiver that shakes */}
          <div className={`mb-4 ${ringing ? 'phone-ring' : ''}`}>
            <motion.div
              animate={ringing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={ringing ? { duration: 0.4, repeat: Infinity } : { duration: 0.2 }}
              className="inline-block"
            >
              <span className="text-4xl">ð</span>
            </motion.div>
          </div>

          {/* Rotary Dial */}
          <div
            className="mx-auto w-52 h-52 rounded-full relative mb-4 p-4"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #3d2b1f 0%, #2a1f14 60%, #1a1410 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.05), 0 0 0 4px #5c4033, 0 0 0 6px #3d2b1f',
            }}
          >
            {/* Finger stop bump */}
            <div
              className="absolute"
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: '#5c4033',
                top: 4, right: 28,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.3)',
              }}
            />

            <div
              ref={dialRef}
              className="w-full h-full rounded-full relative"
              style={{ willChange: 'transform' }}
            >
              {holes.map((n, i) => {
                const a = getAngle(i);
                const r = 68;
                const x = 100 + r * Math.cos(a) - 16;
                const y = 100 + r * Math.sin(a) - 16;
                return (
                  <button
                    key={n}
                    onClick={() => dialNumber(n)}
                    disabled={spinning || ringing}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center old-typewriter text-sm font-bold text-[#3d2b1f] cursor-pointer transition-all duration-150 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      left: x, top: y,
                      background: 'radial-gradient(circle at 40% 35%, #faf6eb, #e8dcc8 60%, #d4c5a9)',
                      border: '2px solid #a89878',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    {n}
                  </button>
                );
              })}
              {/* Center cap */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #8b7355, #5c4033 60%, #3d2b1f)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#1a1410', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}
                />
              </div>
            </div>
          </div>

          {/* Dialed number display - LED style */}
          <div className="sk-inset rounded-lg px-4 py-2.5 mb-3 flex items-center justify-center gap-0.5">
            {dialed.length > 0 ? (
              dialed.map((n, i) => (
                <motion.span
                  key={`${i}-${n}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="old-typewriter text-lg tracking-[0.3em] text-[#5c4033] font-bold"
                >
                  {n}
                </motion.span>
              ))
            ) : (
              <span className="old-typewriter text-sm tracking-[0.2em] text-[#8b7355] opacity-50">
                DIAL A NUMBER
              </span>
            )}
          </div>

          {/* Ringing indicator */}
          <AnimatePresence>
            {ringing && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex items-center justify-center gap-2"
              >
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ð
                </motion.span>
                <span className="old-typewriter text-xs text-[#8b5e3c]">
                  Ringing... ({ringCount})
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call message */}
          <AnimatePresence>
            {callMsg && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="sk-paper rounded-lg p-3 mb-3"
              >
                <p className="old-body text-sm text-[#8b5e3c] italic">&ldquo;{callMsg}&rdquo;</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCall}
              disabled={dialed.length === 0 || ringing}
              className="sk-btn rounded-lg px-5 py-2.5 old-btn text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </button>
            <button
              onClick={handleClear}
              className="sk-btn rounded-lg px-5 py-2.5 old-btn text-xs flex items-center gap-2"
            >
              <span className="text-sm">✕</span>
              Clear
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
