'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getDB } from '@/lib/idb-store';
import { soundChime, soundButtonClick } from '@/lib/sounds';

/* ═══════════════════════════════════════════════════
   Daily Nostalgia Prompt
   Shows a different thought-provoking question each day.
   Stored in IDB so the same prompt shows all day.
   ═══════════════════════════════════════════════════ */

const PROMPTS: Record<string, string[]> = {
  '1970s': [
    'What was your favorite Saturday morning cartoon?',
    'Do you remember the first time you saw color TV?',
    'What was the neighborhood hangout spot when you were a kid?',
    'Who was your first childhood best friend?',
    'What school lunch did you look forward to the most?',
    'What song played at your school dance?',
    'What was your favorite thing to do after school?',
    'Do you remember your first bike?',
    'What did your bedroom walls look like growing up?',
    'What was the first movie you saw in a theater?',
    'What did you collect as a kid — baseball cards, stamps, something else?',
    'What was your favorite holiday tradition?',
    'Who was the coolest person you knew as a child?',
    'What did you want to be when you grew up?',
    'What smell instantly takes you back to childhood?',
  ],
  '1980s': [
    'What was your favorite arcade game?',
    'Do you remember recording songs off the radio?',
    'What was your first video game console?',
    'Who was your favorite MTV VJ?',
    'What was the best part about summer vacation?',
    'Do you remember your first Walkman?',
    'What was your favorite Saturday morning cartoon?',
    'What did you think of the future when you were a kid?',
    'What was your favorite candy from the corner store?',
    'Who was your first celebrity crush?',
    'What was your favorite playground game?',
    'Do you remember staying up late to watch movies on TV?',
    'What was the first album you bought with your own money?',
    'What was your favorite back-to-school item?',
    'What TV show did your whole family watch together?',
  ],
  '1990s': [
    'What was your favorite Tamagotchi memory?',
    'Do you remember the sound of dial-up internet?',
    'What was your favorite boy band or girl group?',
    'What was the best part about Blockbuster Friday nights?',
    'Do you remember your first screen name / AIM handle?',
    'What was your favorite lunchbox item?',
    'What was the first website you ever visited?',
    'Who was your favorite Rugrat or Nickelodeon character?',
    'What was your favorite thing about the mall?',
    'Do you remember trading Pokémon cards at school?',
    'What was your favorite Disney movie growing up?',
    'What was the coolest thing about having a Game Boy?',
    'What did you do when the power went out?',
    'What was your favorite cereal?',
    'Who taught you how to ride a bike or swim?',
  ],
  '2000s': [
    'What was your first cell phone?',
    'Do you remember making mix CDs?',
    'What was your favorite YouTube video growing up?',
    'What was your first social media profile?',
    'What was the best thing about having an iPod?',
    'Do you remember your first MP3 download?',
    'What was your favorite cartoon on Cartoon Network or Nickelodeon?',
    'What was the first movie you watched on DVD?',
    'What was your favorite thing to do on the computer?',
    'What was your first gaming console?',
    'Do you remember the release of a major tech gadget?',
    'What was your favorite school field trip?',
    'What was the trend everyone at school followed?',
    'What was your favorite post-school snack?',
    'What song was "your song" in middle school?',
  ],
  '2010s': [
    'What was your first smartphone?',
    'Do you remember your first Instagram post?',
    'What was your favorite app as a kid?',
    'What was the first movie you saw in 3D?',
    'What was your favorite Minecraft memory?',
    'What was your first YouTube channel subscription?',
    'What was the coolest thing about your first tablet?',
    'What was your favorite game on mobile?',
    'Do you remember your first video call?',
    'What was your favorite show on Netflix?',
    'What was the biggest trend at your school?',
    'What was your first experience with streaming music?',
    'What was your favorite superhero movie?',
    'What did you do for fun before social media?',
    'What was the best birthday party you remember?',
  ],
};

function getDecadeKey(birthYear: number): string {
  const decade = Math.floor(birthYear / 10) * 10;
  if (decade >= 2010) return '2010s';
  if (decade >= 2000) return '2000s';
  if (decade >= 1990) return '1990s';
  if (decade >= 1980) return '1980s';
  return '1970s';
}

function getDayIndex(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function getTodayPrompt(decadeKey: string): string {
  const prompts = PROMPTS[decadeKey] || PROMPTS['1990s'];
  return prompts[getDayIndex() % prompts.length];
}

const PROMPT_STORE_ID = 'daily-prompt';
const PROMPT_DATE_ID = 'date';
const PROMPT_TEXT_ID = 'text';

async function getStoredPrompt(): Promise<string | null> {
  try {
    const db = await getDB();
    const record: any = await db.get('era_skin', PROMPT_STORE_ID);
    if (record && record.date === getDayIndex()) {
      return record.text;
    }
    return null;
  } catch {
    return null;
  }
}

async function storePrompt(text: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put('era_skin', { id: PROMPT_STORE_ID, skin_id: 'prompt', date: getDayIndex(), text } as any);
  } catch {
    // silently fail
  }
}

export default function DailyPrompt({ birthYear }: { birthYear: number }) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    const decadeKey = getDecadeKey(birthYear);
    (async () => {
      const stored = await getStoredPrompt();
      if (stored) {
        setPrompt(stored);
      } else {
        const todayPrompt = getTodayPrompt(decadeKey);
        setPrompt(todayPrompt);
        await storePrompt(todayPrompt);
      }
      soundChime();
    })();
  }, [birthYear]);

  const handleNewPrompt = async () => {
    soundButtonClick();
    const decadeKey = getDecadeKey(birthYear);
    const prompts = PROMPTS[decadeKey] || PROMPTS['1990s'];
    // Pick a different prompt
    let newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    let attempts = 0;
    while (newPrompt === prompt && attempts < 10) {
      newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      attempts++;
    }
    setPrompt(newPrompt);
    await storePrompt(newPrompt);
  };

  if (!prompt) return null;

  return (
    <div className="sk-paper rounded-xl p-5 sk-noise relative overflow-hidden mb-6">
      {/* Decorative tape */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#c4956a]/30 rounded-sm sk-noise"
        style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
      />

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#c4956a]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5 text-[#c4956a]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="old-label text-[10px] uppercase tracking-widest text-[#8b7355]">
              Today&apos;s Nostalgia Prompt
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={prompt}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="old-title text-base font-bold text-[#3d2b1f] leading-snug"
            >
              {prompt}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-end mt-3 gap-2">
        <button
          onClick={handleNewPrompt}
          className="sk-btn old-btn px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer text-[#8b7355] hover:text-[#5c4033]"
        >
          <RefreshCw className="h-3 w-3" /> Another prompt
        </button>
      </div>
    </div>
  );
}
