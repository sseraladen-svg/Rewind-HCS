'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Heart, Music, Gamepad2, Film, Star, BookOpen, Monitor,
  ChevronRight, Sparkles, ArrowLeft, RefreshCw,
  RotateCcw, Play, CheckCircle2, XCircle, Camera, Smile, Timer,
} from 'lucide-react';
import {
  nostalgiaData, getDecadeForYear, getPersonalTimeline,
  type DecadeData, type NostalgiaItem,
} from '@/lib/nostalgia-data';
import VintageCamera from '@/components/VintageCamera';
import OldJournal from '@/components/OldJournal';
import NostalgiaFeatures from '@/components/NostalgiaFeatures';
import OldTransitionLoader, { triggerOldLoader, hideOldLoader } from '@/components/OldTransitionLoader';

/* ═══════════════════════════════════════════════════
   CRT / VHS LOADING SCREEN
   ═══════════════════════════════════════════════════ */
function CrtLoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0); // 0=boot, 1=title, 2=fading
  const [bootLines, setBootLines] = useState<string[]>([]);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allBootLines = useMemo(() => [
    'BIOS v2.4 — Nostalgia Systems Inc.',
    'POST: Memory test... 640K OK',
    'Detecting floppy drives... A: OK  B: OK',
    'Loading REWIND.EXE...',
    'Mounting childhood memories... 47% complete',
    'Indexing nostalgia database...',
    'Rewinding time...',
    'Loading good old days... 83% complete',
    'Ready.',
  ], []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Reveal boot lines one by one
    allBootLines.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (i === allBootLines.length - 1) {
          // Last line — show title after a beat
          timers.push(setTimeout(() => setPhase(1), 1000));
        }
      }, 500 + i * 500));
    });

    // Auto-dismiss after title phase
    fadeTimerRef.current = setTimeout(() => {
      setPhase(2);
      setTimeout(onDone, 800);
    }, 7000);

    return () => {
      timers.forEach(clearTimeout);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [allBootLines, onDone]);

  return (
    <div className={`crt-screen ${phase === 2 ? 'crt-fadeout' : 'crt-flicker'}`}>
      <div className="crt-scanlines" />
      <div className="vhs-noise" />
      <div className="vhs-tracking" />
      <div className="vhs-tracking" style={{ animationDelay: '1.2s', opacity: 0.5 }} />

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 w-full max-w-xl">
        {/* Boot lines */}
        <div className="space-y-1 sm:space-y-1.5 min-h-[120px] sm:min-h-[180px] w-full">
          {bootLines.map((line, i) => (
            <div
              key={i}
              className="boot-line text-[10px] sm:text-xs md:text-[0.75rem]"
              style={{ animationDelay: '0s' }}
            >
              {line}
              {i === bootLines.length - 1 && (
                <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-3.5 bg-[#c4956a] ml-0.5 align-middle"
                  style={{ animation: 'blink-cursor 0.6s step-end infinite' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0 }}
            className="text-center mt-1 sm:mt-2 w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black crt-glow old-title tracking-wider" style={{ color: '#c4956a' }}>
              REWIND
            </h1>
            <div className="loading-bar-track sm:loading-bar-track-md mt-3 sm:mt-4 mx-auto">
              <div className="loading-bar-fill" style={{ animationDuration: '3.5s' }} />
            </div>
            <p className="old-typewriter text-[8px] sm:text-[10px] mt-2 sm:mt-3" style={{ color: 'rgba(196,149,106,0.5)' }}>
              <span style={{ animation: 'blink-cursor 0.8s step-end infinite' }}>_</span>
              {' '}press any key to continue_
            </p>
          </motion.div>
        )}
      </div>

      {/* VHS timestamp corner */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
        <span className="old-typewriter text-[8px] sm:text-[10px]" style={{ color: 'rgba(196,149,106,0.35)' }}>
          SP 0:00:00
        </span>
      </div>
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" style={{ animation: 'blink-cursor 1s step-end infinite' }} />
        <span className="old-typewriter text-[8px] sm:text-[10px]" style={{ color: 'rgba(196,149,106,0.4)' }}>
          REC
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DUST MOTES (hydration-safe, uses useEffect)
   ═══════════════════════════════════════════════════ */
function DustMotes() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const motes = useMemo(() => {
    if (!mounted) return [];
    const colors = ['#c4956a', '#8b5e3c', '#d4a574', '#e8c9a0', '#b8845a'];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      w: 2 + Math.random() * 6,
      h: 2 + Math.random() * 6,
      l: Math.random() * 100,
      t: Math.random() * 100,
      bg: colors[i % 5],
      delay: Math.random() * 25,
      dur: 20 + Math.random() * 20,
    }));
  }, [mounted]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute rounded-full opacity-15 animate-[float_25s_infinite_linear]"
          style={{
            width: `${m.w}px`,
            height: `${m.h}px`,
            left: `${m.l}%`,
            top: `${m.t}%`,
            background: m.bg,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GAME 1: MEMORY MATCH
   ═══════════════════════════════════════════════════ */
interface MatchCard {
  id: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createMatchCards(data: DecadeData): MatchCard[] {
  const pool = [...data.cartoons, ...data.toys, ...data.snacks, ...data.games];
  const picked = shuffle(pool).slice(0, 6);
  const initial: MatchCard[] = picked.flatMap((item, i) => [
    { id: i * 2, emoji: item.emoji, label: item.title, isFlipped: false, isMatched: false },
    { id: i * 2 + 1, emoji: item.emoji, label: item.title, isFlipped: false, isMatched: false },
  ]);
  return shuffle(initial);
}

function MemoryMatchGame({ data }: { data: DecadeData }) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCards(createMatchCards(data)));
    return () => cancelAnimationFrame(id);
  }, [data]);

  const resetGame = useCallback(() => {
    setCards(createMatchCards(data));
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    lockRef.current = false;
  }, [data]);

  const handleFlip = useCallback((id: number) => {
    if (lockRef.current) return;
    setCards(prev => {
      const card = prev.find(c => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return prev;
      return prev.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    });

    setFlippedIds(prev => {
      if (prev.includes(id) || prev.length >= 2) return prev;
      const newFlipped = [...prev, id];

      if (newFlipped.length === 2) {
        setMoves(m => m + 1);
        lockRef.current = true;

        // Use a timeout to read the latest cards state
        setTimeout(() => {
          setCards(currentCards => {
            const first = currentCards.find(c => c.id === newFlipped[0])!;
            const second = currentCards.find(c => c.id === newFlipped[1])!;

            if (first.label === second.label) {
              // Match!
              const updated = currentCards.map(c =>
                c.id === first.id || c.id === second.id
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              );
              setMatches(m => {
                const newM = m + 1;
                if (newM === 6) setGameWon(true);
                return newM;
              });
              setFlippedIds([]);
              lockRef.current = false;
              return updated;
            } else {
              // No match — flip back
              setTimeout(() => {
                setCards(cc => cc.map(c =>
                  c.id === first.id || c.id === second.id
                    ? { ...c, isFlipped: false }
                    : c
                ));
                setFlippedIds([]);
                lockRef.current = false;
              }, 700);
              return currentCards;
            }
          });
        }, 50);
      }

      return newFlipped;
    });
  }, []);

  return (
    <div className="sk-paper p-5 rounded-lg sk-noise relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="old-heading font-bold text-base text-[#5c4033] flex items-center gap-2">
          <span className="text-xl">🃏</span> Memory Match
        </h4>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#8b7355]">
          <span className="sk-inset px-2 py-1 rounded old-typewriter">Moves: {moves}</span>
          <span className="sk-inset px-2 py-1 rounded old-typewriter">Pairs: {matches}/6</span>
          <button onClick={resetGame} className="sk-btn old-btn px-3 py-1 rounded text-xs cursor-pointer">
            <RotateCcw className="h-3 w-3 inline mr-1" />Reset
          </button>
        </div>
      </div>

      {gameWon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 bg-[#faf6eb]/95 z-10 flex flex-col items-center justify-center rounded-lg"
        >
          <span className="text-5xl mb-2">🎉</span>
          <p className="old-title text-lg font-bold text-[#5c4033]">You found them all!</p>
          <p className="old-body text-sm text-[#8b7355] mt-1">Completed in {moves} moves</p>
          <button onClick={resetGame} className="sk-btn old-btn px-5 py-2 rounded-lg font-semibold mt-3 cursor-pointer">
            Play Again
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const showFront = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className="aspect-square rounded-md transition-all duration-300 cursor-pointer border-2 flex flex-col items-center justify-center p-1"
              disabled={card.isMatched}
              style={{
                background: showFront
                  ? '#faf6eb'
                  : 'linear-gradient(135deg, #7a4f30, #8b5e3c, #6b4226)',
                borderColor: showFront
                  ? (card.isMatched ? '#a8d08d' : data.color + '80')
                  : '#5c4033',
                boxShadow: showFront
                  ? '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
                  : '0 3px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                opacity: card.isMatched ? 0.6 : 1,
              }}
            >
              {showFront ? (
                <>
                  <span className="text-2xl md:text-3xl">{card.emoji}</span>
                  <span className="old-typewriter text-[7px] md:text-[9px] font-bold text-[#5c4033] mt-0.5 text-center leading-tight" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</span>
                </>
              ) : (
                <span className="text-xl text-[#d4a574] font-bold old-title">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GAME 2: GUESS THE YEAR
   ═══════════════════════════════════════════════════ */
interface TriviaQ {
  question: string;
  emoji: string;
  correct: number;
  options: string[];
}

function buildTrivia(data: DecadeData): TriviaQ[] {
  const decadeStart = parseInt(data.years.split('–')[0]);
  const qs: TriviaQ[] = [];
  const all = [...data.cartoons, ...data.toys, ...data.music, ...data.movies, ...data.snacks, ...data.games, ...data.tech, ...data.trends];
  const shuffled = shuffle(all).slice(0, 8);

  for (const item of shuffled) {
    const realYear = decadeStart + Math.floor(Math.random() * 8) + 1;
    const wrongYears = [
      Math.max(1970, realYear - 3 - Math.floor(Math.random() * 5)),
      Math.min(2019, realYear + 2 + Math.floor(Math.random() * 5)),
      Math.max(1970, realYear - 6 - Math.floor(Math.random() * 4)),
    ].filter(y => y !== realYear).slice(0, 3);
    while (wrongYears.length < 3) wrongYears.push(Math.max(1970, realYear + 7));
    const options = shuffle([realYear, ...wrongYears.slice(0, 3)]);
    qs.push({
      question: `When did "${item.title}" first become popular?`,
      emoji: item.emoji,
      correct: options.indexOf(realYear),
      options: options.map(String),
    });
  }
  return qs;
}

function GuessTheYearGame({ data }: { data: DecadeData }) {
  const [questions, setQuestions] = useState<TriviaQ[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestions(buildTrivia(data));
  }, [data]);

  const q = questions[qIdx];

  const handleAnswer = (optIdx: number) => {
    if (showResult || !q) return;
    setSelected(optIdx);
    setShowResult(true);
    if (optIdx === q.correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 < questions.length) {
        setQIdx(i => i + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setDone(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    const fresh = buildTrivia(data);
    setQuestions(fresh);
    setQIdx(0); setScore(0); setSelected(null); setShowResult(false); setDone(false);
  };

  if (!q && !done) return <div className="sk-paper p-5 rounded-lg sk-noise text-center old-typewriter text-sm text-[#8b7355]">Loading...</div>;

  if (done) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="sk-paper p-5 rounded-lg sk-noise relative overflow-hidden">
        <div className="text-center py-4">
          <span className="text-5xl mb-3 block">{pct >= 70 ? '🏆' : pct >= 40 ? '👏' : '😅'}</span>
          <p className="old-title text-lg font-bold text-[#5c4033]">Game Over!</p>
          <p className="old-body text-sm text-[#8b7355] mt-1">You scored {score}/{questions.length} ({pct}%)</p>
          <p className="old-quote text-xs text-[#8b7355] mt-2">
            {pct >= 70 ? "You truly remember your era!" : pct >= 40 ? "Not bad — some things fade with time" : "Hey, it's been a while! No shame in that."}
          </p>
          <button onClick={resetGame} className="sk-btn old-btn px-5 py-2 rounded-lg font-semibold mt-4 cursor-pointer">
            <RotateCcw className="h-3 w-3 inline mr-1" />Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sk-paper p-5 rounded-lg sk-noise relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="old-heading font-bold text-base text-[#5c4033] flex items-center gap-2">
          <span className="text-xl">📅</span> Guess the Year
        </h4>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8b7355]">
          <span className="sk-inset px-2 py-1 rounded old-typewriter">{qIdx + 1}/{questions.length}</span>
          <span className="sk-inset px-2 py-1 rounded old-typewriter">Score: {score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 sk-wood rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8b5e3c] to-[#c4956a] rounded-full transition-all duration-500"
          style={{ width: `${((qIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div className="text-center mb-4">
        <span className="text-5xl block mb-2">{q.emoji}</span>
        <p className="old-body text-sm font-semibold text-[#5c4033]">{q.question}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let cls = 'sk-paper p-3 rounded-lg text-center font-bold text-sm cursor-pointer transition-all duration-200 border-2 old-typewriter ';
          if (showResult) {
            if (i === q.correct) cls += 'border-green-500 bg-green-50 sk-sticker';
            else if (i === selected) cls += 'border-red-400 bg-red-50 opacity-60';
            else cls += 'border-[#d4c5a9] opacity-40';
          } else {
            cls += 'border-[#d4c5a9] hover:border-[#8b5e3c] hover:shadow-md active:translate-y-0.5';
          }
          return (
            <button key={`${qIdx}-${i}`} onClick={() => handleAnswer(i)} className={cls} disabled={showResult}>
              {opt}
            </button>
          );
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-3 text-xs font-semibold flex items-center justify-center gap-1 old-body"
        >
          {selected === q.correct ? (
            <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">Correct! You remembered!</span></>
          ) : (
            <><XCircle className="h-4 w-4 text-red-500" /><span className="text-red-600">It was {q.options[q.correct]}</span></>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GAME 3: TAP THE MEMORY (Reaction Game)
   ═══════════════════════════════════════════════════ */
function WhackGame({ data }: { data: DecadeData }) {
  const GRID = 9;
  const allItems = useMemo(() => [
    ...data.toys, ...data.snacks, ...data.cartoons, ...data.games,
  ], [data]);

  const [grid, setGrid] = useState<(NostalgiaItem | null)[]>(Array(GRID).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef<(NostalgiaItem | null)[]>(Array(GRID).fill(null));
  const activeRef = useRef(false);

  const spawnItem = useCallback(() => {
    if (!activeRef.current) return;
    const empty = gridRef.current.reduce<number[]>((acc, v, i) => v === null ? [...acc, i] : acc, []);
    if (empty.length === 0) return;
    const pos = empty[Math.floor(Math.random() * empty.length)];
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    const newGrid = [...gridRef.current];
    newGrid[pos] = item;
    gridRef.current = newGrid;
    setGrid([...newGrid]);
    setTimeout(() => {
      if (gridRef.current[pos] === item) {
        const g = [...gridRef.current]; g[pos] = null; gridRef.current = g; setGrid([...g]);
      }
    }, 1200);
  }, [allItems]);

  const stopGame = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
  }, []);

  const startGame = useCallback(() => {
    // Clear any previous intervals
    stopGame();

    const fresh = Array(GRID).fill(null);
    gridRef.current = fresh;
    setGrid([...fresh]);
    setScore(0); setTimeLeft(20); setGameOver(false); setGameActive(true);
    activeRef.current = true;

    timerRef.current = setInterval(() => {
      if (!activeRef.current) return;
      setTimeLeft(t => {
        if (t <= 1) {
          stopGame();
          setGameActive(false);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    spawnRef.current = setInterval(spawnItem, 700);
  }, [spawnItem, stopGame]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, []);

  const handleWhack = (idx: number) => {
    if (!gameActive || !grid[idx]) return;
    setScore(s => s + 10);
    setFeedback('+10');
    const g = [...gridRef.current]; g[idx] = null; gridRef.current = g; setGrid([...g]);
    setTimeout(() => setFeedback(null), 300);
  };

  const handleMiss = () => {
    if (!gameActive) return;
    setFeedback('Miss!');
    setTimeout(() => setFeedback(null), 300);
  };

  return (
    <div className="sk-paper p-5 rounded-lg sk-noise relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="old-heading font-bold text-base text-[#5c4033] flex items-center gap-2">
          <span className="text-xl">🔨</span> Tap the Memory
        </h4>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8b7355]">
          <span className="sk-inset px-2 py-1 rounded old-typewriter flex items-center gap-1">
            <Timer className="h-3 w-3" />{timeLeft}s
          </span>
          <span className="sk-inset px-2 py-1 rounded old-typewriter">{score}pts</span>
        </div>
      </div>

      {!gameActive && !gameOver && (
        <div className="text-center py-6">
          <p className="old-body text-sm text-[#8b7355] mb-4">Tap nostalgic items as they pop up! You have 20 seconds.</p>
          <button onClick={startGame} className="sk-btn old-btn px-6 py-3 rounded-xl font-bold text-base cursor-pointer flex items-center gap-2 mx-auto">
            <Play className="h-5 w-5" /> Start Game
          </button>
        </div>
      )}

      {gameOver && (
        <div className="text-center py-4">
          <span className="text-5xl mb-2 block">{score >= 80 ? '🏆' : score >= 40 ? '🎉' : '💪'}</span>
          <p className="old-title text-lg font-bold text-[#5c4033]">Time&apos;s Up!</p>
          <p className="old-body text-sm text-[#8b7355] mt-1">Score: {score} points</p>
          <button onClick={startGame} className="sk-btn old-btn px-5 py-2 rounded-lg font-semibold mt-3 cursor-pointer">
            <RotateCcw className="h-3 w-3 inline mr-1" />Play Again
          </button>
        </div>
      )}

      {gameActive && (
        <div className="grid grid-cols-3 gap-2 select-none">
          {grid.map((item, i) => (
            <button
              key={i}
              onClick={() => item ? handleWhack(i) : handleMiss()}
              className="aspect-square rounded-lg transition-all duration-150 cursor-pointer border-2 flex items-center justify-center"
              style={{
                background: item
                  ? `linear-gradient(135deg, ${data.color}18, ${data.color}30)`
                  : 'linear-gradient(135deg, #e8dcc8, #d4c5a9)',
                borderColor: item ? `${data.color}60` : '#c4b594',
                boxShadow: item
                  ? `0 2px 8px ${data.color}30, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : 'inset 0 2px 4px rgba(0,0,0,0.08)',
                transform: item ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {item && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl md:text-4xl"
                >
                  {item.emoji}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <motion.div
          key={feedback}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
        >
          <span className={`text-xs font-bold px-3 py-1 rounded-full sk-btn old-typewriter ${feedback === 'Miss!' ? 'opacity-50' : ''}`}>
            {feedback}
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO / LANDING (SKEUOMORPHIC)
   ═══════════════════════════════════════════════════ */
function HeroSection({ onSubmit }: { onSubmit: (year: number) => void }) {
  const [year, setYear] = useState('');
  const [hoveredDecade, setHoveredDecade] = useState<string | null>(null);
  const [tapeRotate] = useState(() => -2 + Math.random() * 4);

  const handleSubmit = () => {
    const y = parseInt(year);
    if (y >= 1970 && y <= 2019) onSubmit(y);
  };

  const decades = Object.values(nostalgiaData);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <DustMotes />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 z-10"
      >
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl md:text-8xl mb-3"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
        >
          📼
        </motion.div>
        <h1 className="old-title text-5xl md:text-7xl font-black tracking-tight mb-3 text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(180deg, #5c4033 0%, #8b5e3c 40%, #c4956a 100%)',
          }}
        >
          Rewind
        </h1>
        <p className="old-body text-base md:text-lg text-[#8b7355] max-w-md mx-auto leading-relaxed">
          Take a trip back to the days when life was simple.
          <br className="hidden md:block" />
          Remember who you were before the world told you who to be.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
        className="z-10 w-full max-w-sm"
      >
        <div className="sk-paper rounded-lg p-6 sk-tape relative overflow-hidden sk-noise" style={{ '--tape-rotate': `${tapeRotate}deg` } as React.CSSProperties}>
          <label className="old-label block text-sm font-bold text-[#5c4033] mb-3 text-center">
            When were you born?
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1970}
              max={2019}
              placeholder="e.g. 1992"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="sk-inset old-typewriter flex-1 text-center text-2xl font-bold rounded-lg p-3 text-[#5c4033] focus:outline-none transition-shadow focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_0_2px_#8b5e3c]"
              aria-label="Birth year"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="sk-leather old-btn w-full mt-4 text-[#faf6eb] font-bold text-lg py-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
          >
            <Clock className="h-5 w-5" />
            Take Me Back
          </button>
          <p className="old-typewriter text-xs text-center text-[#8b7355] mt-3 font-medium">
            1970 – 2019 &nbsp;·&nbsp; Your memories, your era
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-3 mt-8 z-10 max-w-lg"
      >
        {decades.map((d, i) => (
          <motion.button
            key={d.decade}
            onMouseEnter={() => setHoveredDecade(d.decade)}
            onMouseLeave={() => setHoveredDecade(null)}
            onClick={() => {
              const y = parseInt(d.years.split('–')[0]);
              setYear(String(y));
              onSubmit(y);
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="sk-paper old-typewriter rounded-lg px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-200 relative overflow-hidden sk-noise"
            style={{
              borderColor: hoveredDecade === d.decade ? d.color : '#c4b594',
              color: hoveredDecade === d.decade ? '#5c4033' : '#8b7355',
              boxShadow: hoveredDecade === d.decade
                ? `0 4px 16px ${d.color}40, 0 1px 3px rgba(0,0,0,0.1)`
                : '0 2px 6px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.06)',
            }}
          >
            {d.decade}
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="old-body text-center text-[#8b7355] text-sm mt-8 z-10 max-w-sm leading-relaxed"
      >
        Everybody is running for jobs, money, markets…
        <br />but you&apos;re still <span className="old-title font-extrabold text-[#5c4033]">human</span>. Take a breath. Remember the good days.
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   QUOTE BANNER
   ═══════════════════════════════════════════════════ */
function QuoteBanner({ quotes }: { quotes: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 8000);
    return () => clearInterval(t);
  }, [quotes.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="sk-lined p-4 rounded-lg old-quote text-[#5c4033] text-sm md:text-base text-center"
      >
        &ldquo;{quotes[idx]}&rdquo;
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   MEMORY CARD (Polaroid)
   ═══════════════════════════════════════════════════ */
function MemoryCard({ item, color, index }: { item: NostalgiaItem; color: string; index: number }) {
  const [rot] = useState(() => -2 + Math.random() * 4);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <div
        className="sk-polaroid rounded-sm transition-all duration-300 cursor-default relative overflow-hidden sk-noise"
        style={{ '--rotate': `${rot}deg` } as React.CSSProperties}
      >
        <div
          className="h-20 flex items-center justify-center rounded-sm"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
        >
          <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
        </div>
        <div className="pt-2 pb-1 px-1">
          <h4 className="old-heading font-extrabold text-xs text-[#3d2b1f] leading-tight">{item.title}</h4>
          <p className="old-handwritten text-[10px] text-[#8b7355] mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   CATEGORY GRID
   ═══════════════════════════════════════════════════ */
function CategoryGrid({ items, color }: { items: NostalgiaItem[]; color: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <MemoryCard key={item.title} item={item} color={color} index={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PERSONAL TIMELINE
   ═══════════════════════════════════════════════════ */
function PersonalTimeline({ birthYear }: { birthYear: number }) {
  const timeline = getPersonalTimeline(birthYear);
  return (
    <div className="space-y-4">
      {timeline.map((entry, i) => {
        const d = nostalgiaData[entry.decade];
        return (
          <motion.div
            key={entry.decade}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="sk-paper rounded-lg p-4 flex items-center gap-4 sk-noise relative overflow-hidden" style={{ '--tape-rotate': `${-3 + i * 2}deg` } as React.CSSProperties}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 old-title"
                style={{
                  background: `linear-gradient(135deg, ${d.color}, ${d.color}cc)`,
                  boxShadow: `0 3px 8px ${d.color}50, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              >
                {entry.age.replace('Age ', '')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="old-heading font-extrabold text-sm text-[#3d2b1f]">{entry.decade}</span>
                  <span className="sk-vhs-label old-label text-[10px] font-bold text-[#8b7355] px-2 py-0.5 rounded">{entry.age}</span>
                </div>
                <p className="old-body text-xs text-[#8b7355] mt-0.5">{entry.label}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#b8a888]" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ERA SPOTLIGHT (VHS Tape)
   ═══════════════════════════════════════════════════ */
function EraSpotlight({ data }: { data: DecadeData }) {
  const [spotIdx, setSpotIdx] = useState(0);
  const allItems = useMemo(() => [
    ...data.cartoons, ...data.toys, ...data.music, ...data.movies,
    ...data.snacks, ...data.games, ...data.trends, ...data.schoolLife, ...data.tech,
  ], [data]);
  const spot = allItems[spotIdx % allItems.length];

  useEffect(() => {
    const t = setInterval(() => setSpotIdx((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, [allItems.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spotIdx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sk-paper-aged rounded-xl p-5 sk-noise relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-10 sk-wood rounded-t-xl flex items-center px-4">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4a574] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
            </div>
            <span className="ml-auto old-typewriter text-[10px] font-bold text-[#faf6eb] tracking-widest uppercase">REC</span>
          </div>
          <div className="pt-12 text-center">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl block mb-3"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
            >
              {spot.emoji}
            </motion.span>
            <span className="sk-vhs-label old-label text-[10px] font-bold text-[#8b7355] px-3 py-1 rounded inline-block mb-2">
              {spot.category} &middot; {data.decade}
            </span>
            <h3 className="old-title text-xl font-black text-[#3d2b1f]">{spot.title}</h3>
            <p className="old-body text-sm text-[#8b7355] mt-2 leading-relaxed max-w-sm mx-auto">{spot.description}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   BREATHER MESSAGE (Sticky note — handwritten)
   ═══════════════════════════════════════════════════ */
function BreatherMessage() {
  const messages = [
    { title: "You're doing great", body: "The fact that you're here, remembering the simple times, means you still have that spark. Life gets heavy — that's okay. Take it one day at a time.", emoji: "💛" },
    { title: "You were enough then", body: "Back when your biggest worry was getting home before dark. You didn't need to prove anything. You were enough just being you. You still are.", emoji: "🌿" },
    { title: "Slow down", body: "The world tells you to hustle, grind, achieve. But some of the best moments of your life happened when you were doing absolutely nothing. Remember that.", emoji: "☕" },
    { title: "You're still that kid", body: "Inside every stressed adult is a kid who lit up at the sound of the ice cream truck, who believed in magic, who laughed until their stomach hurt. That kid is still in you.", emoji: "✨" },
    { title: "Breathe", body: "Close your eyes. Take a deep breath. You've survived 100% of your worst days. You're stronger than you think, and it's okay to rest.", emoji: "🍃" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 12000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center"
      >
        <div
          className="max-w-md p-5 rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fff9c4, #fff176)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <span className="text-2xl block mb-2">{messages[idx].emoji}</span>
          <h3 className="old-handwritten text-base font-bold text-[#5c4033]">{messages[idx].title}</h3>
          <p className="old-handwritten text-xs text-[#7a5c3e] mt-1.5 leading-relaxed">{messages[idx].body}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */
function Dashboard({ birthYear, onBack }: { birthYear: number; onBack: () => void }) {
  const decadeKey = getDecadeForYear(birthYear);
  const data = nostalgiaData[decadeKey];
  const [activeTab, setActiveTab] = useState('memories');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCamera, setShowCamera] = useState(false);

  const categoryMap: Record<string, { label: string; icon: React.ReactNode; items: NostalgiaItem[] }> = {
    cartoons: { label: 'Cartoons', icon: <Film className="h-4 w-4" />, items: data.cartoons },
    toys: { label: 'Toys', icon: <Star className="h-4 w-4" />, items: data.toys },
    music: { label: 'Music', icon: <Music className="h-4 w-4" />, items: data.music },
    movies: { label: 'Movies', icon: <Film className="h-4 w-4" />, items: data.movies },
    snacks: { label: 'Snacks', icon: <Heart className="h-4 w-4" />, items: data.snacks },
    games: { label: 'Games', icon: <Gamepad2 className="h-4 w-4" />, items: data.games },
    trends: { label: 'Trends', icon: <Sparkles className="h-4 w-4" />, items: data.trends },
    school: { label: 'School Life', icon: <BookOpen className="h-4 w-4" />, items: data.schoolLife },
    tech: { label: 'Tech', icon: <Monitor className="h-4 w-4" />, items: data.tech },
  };

  // Trigger old-style cassette loader when switching tabs
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    triggerOldLoader();
    const timer = setTimeout(() => {
      setActiveTab(tabId);
      setTimeout(() => hideOldLoader(), 300);
    }, 900 + Math.random() * 600);
    // Cleanup — stored in a ref so it can be cancelled on unmount
    const ref = { current: timer };
    return () => clearTimeout(ref.current);
  }, [activeTab]);

  const tabs = [
    { id: 'memories', label: 'Memories', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'funstuff', label: 'Fun Stuff', icon: <Smile className="h-4 w-4" /> },
    { id: 'games', label: 'Play Games', icon: <Gamepad2 className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - wood grain */}
      <header className="sticky top-0 z-30 sk-wood px-2 py-0">
        <div className="max-w-5xl mx-auto py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <div className="h-4 w-px bg-[#a08868]" />
            <h2 className="old-title font-black text-base text-[#faf6eb] tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Rewind
            </h2>
          </div>
          <div className="sk-vhs-label old-typewriter text-[10px] font-bold px-3 py-1 rounded" style={{ color: data.color, borderColor: data.color }}>
            {data.decade} &middot; Born {birthYear}
          </div>
        </div>
      </header>

      <main className="flex-1 sk-cork min-h-0">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-5 pb-20">
          {/* Hero */}
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
            <div className="sk-paper rounded-xl p-5 text-center sk-noise relative overflow-hidden">
              <h1 className="old-title text-3xl md:text-4xl font-black mb-1" style={{ color: data.color, textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                {data.decade}
              </h1>
              <p className="old-body text-sm text-[#8b7355] font-medium">{data.tagline}</p>
            </div>
          </motion.section>

          {/* Quote */}
          <section className="mb-6">
            <QuoteBanner quotes={data.quotes} />
          </section>

          {/* Tab bar - metal */}
          <div className="sk-metal rounded-xl p-1 mb-6 flex gap-1 shadow-[0_3px_8px_rgba(0,0,0,0.2)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer old-typewriter ${
                  activeTab === tab.id
                    ? 'sk-paper shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] text-[#3d2b1f]'
                    : 'text-[#6b6b6b] hover:text-[#3d2b1f] hover:bg-white/20'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ═══ MEMORIES TAB ═══ */}
          {activeTab === 'memories' && (
            <AnimatePresence mode="wait">
              <motion.div key="memories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <section className="mb-6"><BreatherMessage /></section>

                <section className="mb-8">
                  <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" style={{ color: data.color }} /> Remember This?
                  </h2>
                  <EraSpotlight data={data} />
                </section>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${activeCategory === 'all' ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] bg-[#d4c5a9]' : ''}`}
                  >
                    All
                  </button>
                  {Object.entries(categoryMap).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${activeCategory === key ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] bg-[#d4c5a9]' : ''}`}
                    >
                      {cat.icon}
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {activeCategory === 'all' ? (
                  Object.entries(categoryMap).map(([key, cat]) => (
                    <div key={key} className="mb-8 last:mb-0">
                      <h3 className="old-label text-xs font-black text-[#8b7355] uppercase tracking-widest mb-3 flex items-center gap-2">
                        {cat.icon} {cat.label}
                      </h3>
                      <CategoryGrid items={cat.items} color={data.color} />
                    </div>
                  ))
                ) : (
                  <CategoryGrid items={categoryMap[activeCategory].items} color={data.color} />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ FUN STUFF TAB ═══ */}
          {activeTab === 'funstuff' && (
            <AnimatePresence mode="wait">
              <motion.div key="funstuff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <NostalgiaFeatures />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ JOURNAL TAB ═══ */}
          {activeTab === 'journal' && (
            <AnimatePresence mode="wait">
              <motion.div key="journal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-5">
                  <p className="old-body text-sm text-[#5c4033] font-medium">Put pen to paper. Let your memories breathe in ink.</p>
                </div>
                <OldJournal />
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ GAMES TAB ═══ */}
          {activeTab === 'games' && (
            <AnimatePresence mode="wait">
              <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-5">
                  <p className="old-body text-sm text-[#5c4033] font-medium">Take a break from the rush. Play some games from the heart.</p>
                </div>
                <div className="space-y-6">
                  <MemoryMatchGame data={data} />
                  <GuessTheYearGame data={data} />
                  <WhackGame data={data} />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === 'timeline' && (
            <AnimatePresence mode="wait">
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: data.color }} /> Your Life Timeline
                </h2>
                <PersonalTimeline birthYear={birthYear} />

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
                  <div className="sk-paper rounded-xl p-6 sk-noise relative overflow-hidden max-w-md mx-auto">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-5xl mb-3"
                    >🫂</motion.div>
                    <h3 className="old-title text-lg font-black text-[#3d2b1f] mb-2">You made it through.</h3>
                    <p className="old-body text-xs text-[#8b7355] leading-relaxed">
                      Every memory on this page is a piece of who you are. The world moves fast, but your roots are deep. You came from simpler times, and that strength lives in you still. Take care of yourself.
                    </p>
                    <button onClick={onBack} className="sk-btn old-btn px-5 py-2.5 rounded-lg font-bold mt-4 cursor-pointer inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Start Over
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <footer className="sk-leather px-4 py-3 mt-auto">
        <div className="max-w-5xl mx-auto text-center">
          <p className="old-typewriter text-[10px] text-[#d4a574] font-medium" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>
            Rewind — because you&apos;re human, not a machine. Take it easy.
          </p>
        </div>
      </footer>

      {/* ═══ FLOATING VINTAGE CAMERA BUTTON ═══ */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
        onClick={() => {
          triggerOldLoader('Loading film...');
          setTimeout(() => {
            setShowCamera(true);
            hideOldLoader();
          }, 750);
        }}
        className="fixed bottom-6 right-6 z-40 cursor-pointer group"
        title="Open Vintage Camera"
      >
        {/* Outer ring - vintage lens look */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(145deg, #5c4033, #3d2b1f)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '3px solid #8b5e3c',
          }}
        >
          {/* Lens glass effect */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), #6b4226 40%, #3d2b1f 70%, #2a1f14)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <Camera className="h-5 w-5 text-[#d4a574] group-hover:text-[#faf6eb] transition-colors" />
          </div>
          {/* Lens reflection dot */}
          <div
            className="absolute top-3 left-4 w-2 h-2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)' }}
          />
        </div>
        {/* Label */}
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 old-typewriter text-[9px] font-bold text-[#8b5e3c] bg-[#faf6eb]/90 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Vintage Cam
        </span>
        {/* Pulse ring animation */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border-2 border-[#8b5e3c]/30 pointer-events-none"
        />
      </motion.button>

      {/* ═══ VINTAGE CAMERA OVERLAY ═══ */}
      <AnimatePresence>
        {showCamera && <VintageCamera onClose={() => setShowCamera(false)} />}
      </AnimatePresence>

      {/* Old-style cassette transition loader (global) */}
      <OldTransitionLoader />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════ */
export default function Home() {
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLoadingDone = useCallback(() => {
    setLoading(false);
  }, []);

  const handleSubmit = useCallback((year: number) => {
    triggerOldLoader('Tuning into your era...');
    setTimeout(() => {
      setBirthYear(year);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideOldLoader();
    }, 1100);
  }, []);

  const handleBack = useCallback(() => {
    triggerOldLoader('Rewinding...');
    setTimeout(() => {
      setBirthYear(null);
      hideOldLoader();
    }, 850);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f5edd6 0%, #ede0c8 40%, #e8d8b8 100%)' }}>
      {/* CRT Boot Loading Screen */}
      {loading && <CrtLoadingScreen onDone={handleLoadingDone} />}

      <AnimatePresence mode="wait">
        {birthYear === null ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ opacity: loading ? 0 : 1 }}
          >
            <HeroSection onSubmit={handleSubmit} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <Dashboard birthYear={birthYear} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}