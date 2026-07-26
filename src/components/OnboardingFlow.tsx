'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  BookOpen,
  Phone,
  Gamepad2,
  PartyPopper,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getDB, setEraSkinId, getEraSkinId } from '@/lib/idb-store';
import { soundButtonClick, soundChime, soundTabSwitch } from '@/lib/sounds';

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface OnboardingFlowProps {
  onComplete: (data: { birthYear: number; eraSkin: string }) => void;
}

interface OnboardingRecord {
  id: string;
  birthYear: number | null;
  eraSkin: string | null;
  complete: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_STEPS = 4;
const ONBOARDING_ID = 'onboarding';
const STEP_DIRECTION = { forward: 1, backward: -1 } as const;

const DECADE_QUICK_PICKS = [
  { label: "80s Kid", emoji: "📺", year: 1985, decadeRange: "1980–1989" },
  { label: "90s Kid", emoji: "🎧", year: 1995, decadeRange: "1990–1999" },
  { label: "2000s Kid", emoji: "💿", year: 2005, decadeRange: "2000–2009" },
  { label: "2010s Kid", emoji: "📱", year: 2012, decadeRange: "2010–2015" },
] as const;

const ERA_OPTIONS = [
  {
    id: '80s-neon',
    name: '80s',
    subtitle: 'Neon Nights',
    description: 'Synthwave vibes, Miami sunsets, and electric dreams',
    colors: ['#1a1a2e', '#ff00ff', '#00d4ff', '#ff4488'],
    accent: '#ff00ff',
    bg: '#1a1a2e',
    emoji: '🦹',
  },
  {
    id: '90s-grunge',
    name: '90s',
    subtitle: 'Grunge & Flannel',
    description: 'Flannel shirts, coffee shops, and raw authenticity',
    colors: ['#2d2d2d', '#8b4513', '#6b8e23', '#d4c8b0'],
    accent: '#8b4513',
    bg: '#2d2d2d',
    emoji: '🎸',
  },
  {
    id: '2000s-y2k',
    name: '2000s',
    subtitle: 'Y2K Future',
    description: 'Frosted glass, iMac colors, and the digital dawn',
    colors: ['#e8f0fe', '#0066cc', '#6699cc', '#f0f5ff'],
    accent: '#0066cc',
    bg: '#e8f0fe',
    emoji: '💿',
  },
  {
    id: 'mixed',
    name: 'Mixed',
    subtitle: 'A Bit of Everything',
    description: 'The best of all eras — nostalgia without borders',
    colors: ['#f5edd6', '#8b5e3c', '#c4956a', '#d4a574'],
    accent: '#c4956a',
    bg: '#f5edd6',
    emoji: '📼',
  },
] as const;

const FEATURE_CARDS = [
  {
    icon: Camera,
    emoji: '📸',
    title: 'Memory Reel',
    description: 'Your memories, retro style',
  },
  {
    icon: BookOpen,
    emoji: '📔',
    title: 'Journal',
    description: "Write like it's 1999",
  },
  {
    icon: Phone,
    emoji: '📞',
    title: 'Contacts',
    description: 'Rotary phones & AIM chat',
  },
  {
    icon: Gamepad2,
    emoji: '🎮',
    title: 'Games',
    description: 'Classic games, classic vibes',
  },
] as const;

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-30%' : '30%',
    opacity: 0,
  }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ═══════════════════════════════════════════════════════════════
   Progress Dots
   ═══════════════════════════════════════════════════════════════ */

function ProgressDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 24 : 8,
            height: 8,
            backgroundColor: i === current ? '#8b5e3c' : '#d4c5a9',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 1: Welcome
   ═══════════════════════════════════════════════════════════════ */

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Retro Illustration — CSS art with emojis */}
      <motion.div
        variants={staggerItem}
        className="relative mb-8"
      >
        <motion.div
          className="sk-paper rounded-2xl p-8 relative overflow-hidden"
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ '--tape-rotate': `${-3}deg` } as React.CSSProperties}
        >
          {/* Decorative tape strip */}
          <div className="sk-tape" />

          {/* CSS art — a retro TV / VCR scene */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              {/* TV body */}
              <div className="w-36 h-28 rounded-lg border-4 border-[#5c4033] bg-[#1a1a2e] relative overflow-hidden">
                {/* Screen content */}
                <div className="absolute inset-1.5 rounded-sm bg-[#0d0d1a] flex items-center justify-center">
                  <motion.span
                    className="text-4xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    📼
                  </motion.span>
                </div>
                {/* Scanlines overlay */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                  }}
                />
                {/* Screen glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(0,212,255,0.15)',
                  }}
                />
              </div>
              {/* TV antenna */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="w-0.5 h-5 bg-[#5c4033] origin-bottom rotate-[-20deg]" />
                <div className="w-0.5 h-5 bg-[#5c4033] origin-bottom rotate-[20deg]" />
              </div>
              {/* TV knobs */}
              <div className="absolute -bottom-3 right-2 flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#8b5e3c] border border-[#5c4033]" />
                <div className="w-3 h-3 rounded-full bg-[#c4956a] border border-[#5c4033]" />
              </div>
            </div>

            {/* Decorative stars / sparkles */}
            <div className="flex gap-2 text-lg opacity-60">
              <span>✦</span>
              <span>★</span>
              <span>✦</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Welcome text */}
      <motion.h1
        variants={staggerItem}
        className="old-title text-4xl sm:text-5xl font-black tracking-tight mb-3"
        style={{
          backgroundImage: 'linear-gradient(180deg, #5c4033 0%, #8b5e3c 40%, #c4956a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Welcome to Rewind
      </motion.h1>

      <motion.p
        variants={staggerItem}
        className="old-body text-lg text-[#8b7355] mb-10 max-w-xs"
      >
        Your personal time machine.
        <br />
        Let&apos;s set up your era.
      </motion.p>

      {/* Let's Go button */}
      <motion.button
        variants={staggerItem}
        onClick={onNext}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="sk-leather old-btn text-[#faf6eb] font-bold text-lg px-10 py-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center gap-2"
      >
        <Sparkles className="h-5 w-5" />
        Let&apos;s Go
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 2: Birth Year
   ═══════════════════════════════════════════════════════════════ */

function BirthYearStep({
  birthYear,
  setBirthYear,
  onNext,
  onBack,
  canContinue,
}: {
  birthYear: string;
  setBirthYear: (y: string) => void;
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
}) {
  const [tapeRotate] = useState(() => -2 + Math.random() * 4);

  const handleSubmit = () => {
    const y = parseInt(birthYear);
    if (y >= 1970 && y <= 2015) onNext();
  };

  const yearNum = parseInt(birthYear);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Heading */}
      <motion.div variants={staggerItem} className="mb-6">
        <Clock className="h-8 w-8 mx-auto mb-3 text-[#8b5e3c]" />
        <h2 className="old-title text-3xl sm:text-4xl font-black tracking-tight text-[#5c4033]">
          When did you grow up?
        </h2>
        <p className="old-body text-base text-[#8b7355] mt-2">
          Pick the year you were born
        </p>
      </motion.div>

      {/* Year input card */}
      <motion.div
        variants={staggerItem}
        className="w-full max-w-xs"
      >
        <div
          className="sk-paper rounded-lg p-6 relative overflow-hidden sk-noise"
          style={{ '--tape-rotate': `${tapeRotate}deg` } as React.CSSProperties}
        >
          <div className="sk-tape" />
          <label className="old-label block text-sm font-bold text-[#5c4033] mb-3">
            Birth Year
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1970}
              max={2015}
              placeholder="e.g. 1992"
              value={birthYear}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d{0,4}$/.test(val)) {
                  setBirthYear(val);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="sk-inset old-typewriter flex-1 text-center text-2xl font-bold rounded-lg p-3 text-[#5c4033] focus:outline-none transition-shadow focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_0_2px_#8b5e3c]"
              aria-label="Birth year"
              autoFocus
            />
          </div>

          {/* Quick pick decade buttons */}
          <p className="old-typewriter text-[10px] text-[#8b7355] mt-4 mb-2 uppercase tracking-wider">
            or pick your decade
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DECADE_QUICK_PICKS.map((decade) => (
              <motion.button
                key={decade.year}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setBirthYear(String(decade.year))}
                className={`sk-btn old-typewriter rounded-lg px-3 py-2.5 text-sm font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                  yearNum === decade.year
                    ? 'ring-2 ring-[#8b5e3c] ring-offset-2 ring-offset-[#faf6eb]'
                    : ''
                }`}
              >
                <span>{decade.emoji}</span>
                <span>{decade.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Range hint */}
          <p className="old-typewriter text-[10px] text-[#8b7355] mt-3 opacity-60">
            1970 – 2015
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3 mt-6 w-full max-w-xs"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sk-btn old-btn rounded-lg px-4 py-2.5 text-sm cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </motion.button>
        <motion.button
          whileHover={canContinue ? { scale: 1.03, y: -1 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          onClick={canContinue ? onNext : undefined}
          disabled={!canContinue}
          className={`sk-leather old-btn flex-1 text-[#faf6eb] font-bold text-base py-2.5 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            canContinue
              ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 3: Era Skin
   ═══════════════════════════════════════════════════════════════ */

function EraSkinStep({
  selectedEra,
  setSelectedEra,
  onNext,
  onBack,
}: {
  selectedEra: string | null;
  setSelectedEra: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Heading */}
      <motion.div variants={staggerItem} className="mb-6">
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-[#8b5e3c]" />
        <h2 className="old-title text-3xl sm:text-4xl font-black tracking-tight text-[#5c4033]">
          What&apos;s your era?
        </h2>
        <p className="old-body text-base text-[#8b7355] mt-2">
          Pick a vibe that speaks to you
        </p>
      </motion.div>

      {/* Era cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-3 w-full max-w-sm"
      >
        {ERA_OPTIONS.map((era) => {
          const isSelected = selectedEra === era.id;
          return (
            <motion.button
              key={era.id}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { soundTabSwitch(); setSelectedEra(era.id); }}
              className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative ${
                isSelected
                  ? 'ring-2 ring-offset-2'
                  : 'ring-1 ring-[#c4b594]'
              }`}
              style={{
                background: era.bg,
                ringColor: era.accent,
                '--tw-ring-color': era.accent,
                '--tw-ring-offset-color': '#f5edd6',
              } as React.CSSProperties}
            >
              {/* Glow effect for selected */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    boxShadow: `0 0 16px ${era.accent}60, 0 0 32px ${era.accent}30, inset 0 0 12px ${era.accent}20`,
                  }}
                />
              )}

              {/* Color palette preview */}
              <div className="flex h-10">
                {era.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-transform duration-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Card content */}
              <div
                className="p-3 text-left"
                style={{ color: era.id === '2000s-y2k' ? '#333366' : era.id === '90s-grunge' ? '#d4c8b0' : '#3d2b1f' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{era.emoji}</span>
                  <span className="old-title font-bold text-sm">{era.name}</span>
                </div>
                <p
                  className="old-typewriter text-[10px] mt-0.5 opacity-70 leading-tight"
                >
                  {era.subtitle}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-1.5 right-1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: era.accent }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Era description */}
      {selectedEra && (
        <motion.p
          key={selectedEra}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="old-body text-sm text-[#8b7355] mt-4 max-w-xs"
        >
          {ERA_OPTIONS.find((e) => e.id === selectedEra)?.description}
        </motion.p>
      )}

      {/* Action buttons */}
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3 mt-6 w-full max-w-xs"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sk-btn old-btn rounded-lg px-4 py-2.5 text-sm cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </motion.button>
        <motion.button
          whileHover={selectedEra ? { scale: 1.03, y: -1 } : {}}
          whileTap={selectedEra ? { scale: 0.97 } : {}}
          onClick={selectedEra ? onNext : undefined}
          disabled={!selectedEra}
          className={`sk-leather old-btn flex-1 text-[#faf6eb] font-bold text-base py-2.5 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedEra
              ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 4: Feature Tour
   ═══════════════════════════════════════════════════════════════ */

function FeatureTourStep({
  currentFeature,
  setCurrentFeature,
  onNext,
  onBack,
}: {
  currentFeature: number;
  setCurrentFeature: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const feature = FEATURE_CARDS[currentFeature];
  const FeatureIcon = feature.icon;

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Heading */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="old-title text-3xl sm:text-4xl font-black tracking-tight text-[#5c4033]">
          Here&apos;s what awaits
        </h2>
        <p className="old-body text-base text-[#8b7355] mt-2">
          Swipe through your toolkit
        </p>
      </motion.div>

      {/* Feature card */}
      <motion.div variants={staggerItem} className="w-full max-w-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sk-paper rounded-xl p-8 relative overflow-hidden sk-noise"
          >
            <div className="sk-tape" />

            {/* Feature icon + emoji */}
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8b5e3c]/10 flex items-center justify-center"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <FeatureIcon className="h-8 w-8 text-[#8b5e3c]" />
            </motion.div>

            <div className="text-4xl mb-3">{feature.emoji}</div>

            <h3 className="old-title text-2xl font-bold text-[#5c4033] mb-2">
              {feature.title}
            </h3>
            <p className="old-body text-base text-[#8b7355] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Swipe dots */}
      <motion.div variants={staggerItem} className="flex items-center gap-2 mt-5">
        {FEATURE_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentFeature(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentFeature
                ? 'w-6 h-2.5 bg-[#8b5e3c]'
                : 'w-2.5 h-2.5 bg-[#d4c5a9] hover:bg-[#b8a888]'
            }`}
            aria-label={`Feature ${i + 1}`}
          />
        ))}
      </motion.div>

      {/* Swipe hint */}
      <motion.div variants={staggerItem} className="flex items-center gap-2 mt-2">
        {currentFeature > 0 && (
          <button
            onClick={() => setCurrentFeature(currentFeature - 1)}
            className="old-typewriter text-xs text-[#8b7355] cursor-pointer hover:text-[#5c4033] transition-colors"
          >
            ← Prev
          </button>
        )}
        {currentFeature < FEATURE_CARDS.length - 1 && (
          <button
            onClick={() => setCurrentFeature(currentFeature + 1)}
            className="old-typewriter text-xs text-[#8b7355] cursor-pointer hover:text-[#5c4033] transition-colors"
          >
            Next →
          </button>
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3 mt-5 w-full max-w-xs"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sk-btn old-btn rounded-lg px-4 py-2.5 text-sm cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="sk-leather old-btn flex-1 text-[#faf6eb] font-bold text-base py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
        >
          <PartyPopper className="h-4 w-4" />
          Start Rewinding!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main OnboardingFlow Component
   ═══════════════════════════════════════════════════════════════ */

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>(STEP_DIRECTION.forward);
  const [birthYear, setBirthYearState] = useState('');
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  /* ───── Check IndexedDB on mount ───── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const db = await getDB();
        if (cancelled) return;

        const record: any = await db.get('era_skin', ONBOARDING_ID);
        if (cancelled) return;

        if (record?.complete) {
          // Already onboarded — restore state and skip
          const savedBirthYear = record.birthYear ?? null;
          const savedEra = record.eraSkin ?? null;

          if (savedBirthYear && savedEra) {
            onComplete({ birthYear: savedBirthYear, eraSkin: savedEra });
            return;
          }
        }
        setIsLoaded(true);
      } catch {
        // If IDB fails, still show onboarding
        setIsLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [onComplete]);

  /* ───── Persistence helpers ───── */
  const saveOnboardingData = useCallback(
    async (year: number, era: string) => {
      const db = await getDB();
      const record: OnboardingRecord = {
        id: ONBOARDING_ID,
        birthYear: year,
        eraSkin: era,
        complete: true,
      };
      await db.put('era_skin', record as any);
      // Also set the era skin in the standard location
      if (era !== 'mixed') {
        await setEraSkinId(era);
      }
    },
    [],
  );

  /* ───── Navigation helpers ───── */
  const goNext = useCallback(() => {
    soundButtonClick();
    setDirection(STEP_DIRECTION.forward);
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    soundButtonClick();
    setDirection(STEP_DIRECTION.backward);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const setBirthYear = useCallback((val: string) => {
    setBirthYearState(val);
  }, []);

  const canContinueBirthYear = useMemo(() => {
    const y = parseInt(birthYear);
    return y >= 1970 && y <= 2015;
  }, [birthYear]);

  /* ───── Handle final completion ───── */
  const handleComplete = useCallback(() => {
    soundChime();
    const year = parseInt(birthYear);
    const era = selectedEra || 'mixed';
    setIsCompleting(true);

    // Small delay for the exit animation to feel natural
    setTimeout(async () => {
      try {
        await saveOnboardingData(year, era);
      } catch (err) {
        console.warn('[Onboarding] Failed to persist:', err);
      }
      onComplete({ birthYear: year, eraSkin: era });
    }, 600);
  }, [birthYear, selectedEra, saveOnboardingData, onComplete]);

  /* ───── Loading state while checking IDB ───── */
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5edd6]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-3">📼</div>
          <p className="old-typewriter text-sm text-[#8b7355]">Loading...</p>
        </motion.div>
      </div>
    );
  }

  /* ───── Render current step ───── */
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={goNext} />;
      case 1:
        return (
          <BirthYearStep
            birthYear={birthYear}
            setBirthYear={setBirthYear}
            onNext={goNext}
            onBack={goBack}
            canContinue={canContinueBirthYear}
          />
        );
      case 2:
        return (
          <EraSkinStep
            selectedEra={selectedEra}
            setSelectedEra={setSelectedEra}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <FeatureTourStep
            currentFeature={currentFeature}
            setCurrentFeature={setCurrentFeature}
            onNext={handleComplete}
            onBack={goBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isCompleting ? (
        <motion.div
          key="onboarding-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="min-h-screen flex flex-col"
          style={{
            background:
              'linear-gradient(180deg, #f5edd6 0%, #ede0c8 40%, #e8d8b8 100%)',
          }}
        >
          {/* Main step area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots — fixed at bottom */}
          <div className="pb-8 pt-4">
            <ProgressDots current={currentStep} total={TOTAL_STEPS} />
          </div>
        </motion.div>
      ) : (
        /* Completion celebration overlay */
        <motion.div
          key="onboarding-complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center bg-[#f5edd6]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center px-6"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              🎉
            </motion.div>
            <h2 className="old-title text-3xl font-black text-[#5c4033] mb-2">
              All Set!
            </h2>
            <p className="old-body text-[#8b7355]">
              Rewinding to your era...
            </p>
            <motion.div
              className="mt-6 mx-auto"
              style={{ width: 120, height: 4, borderRadius: 2 }}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #8b5e3c, #c4956a, #8b5e3c)',
                  backgroundSize: '200% 100%',
                  animation: 'rewind-shimmer 1.5s ease-in-out infinite',
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
