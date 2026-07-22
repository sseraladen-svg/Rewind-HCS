'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, CheckCircle2, XCircle, Timer, ArrowLeft, Gamepad2 } from 'lucide-react';
import { type DecadeData, type NostalgiaItem } from '@/lib/nostalgia-data';

/* ═══════════════════════════════════════════════════
   HELPERS & TYPES
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

/* ═══════════════════════════════════════════════════
   GAME 1: MEMORY MATCH
   ═══════════════════════════════════════════════════ */
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
   GAMES HUB (Selection Screen)
   ═══════════════════════════════════════════════════ */

const GAMES = [
  { id: 'memory' as const, emoji: '🃏', name: 'Memory Match', desc: 'Flip cards and find matching nostalgic items from your era.' },
  { id: 'trivia' as const, emoji: '📅', name: 'Guess The Year', desc: 'Test your memory — can you remember when things were popular?' },
  { id: 'whack' as const, emoji: '🔨', name: 'Tap The Memory', desc: 'Quick! Tap the nostalgic items before they disappear. 20 seconds on the clock.' },
];

export default function GamesHub({ data }: { data: DecadeData }) {
  const [activeGame, setActiveGame] = useState<'hub' | 'memory' | 'trivia' | 'whack'>('hub');

  return (
    <div>
      <AnimatePresence mode="wait">
        {activeGame === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-5">
              <p className="old-body text-sm text-[#5c4033] font-medium">Take a break from the rush. Play some games from the heart.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveGame(game.id)}
                  className="sk-paper rounded-xl p-5 sk-noise cursor-pointer text-left transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:translate-y-0.5 group relative overflow-hidden"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{game.emoji}</div>
                  <h3 className="old-heading font-extrabold text-sm text-[#3d2b1f] mb-1.5">{game.name}</h3>
                  <p className="old-body text-xs text-[#8b7355] leading-relaxed">{game.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#8b5e3c] old-typewriter">
                    <Gamepad2 className="h-3 w-3" /> Play Now
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <button
              onClick={() => setActiveGame('hub')}
              className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Games
            </button>
            {activeGame === 'memory' && <MemoryMatchGame data={data} />}
            {activeGame === 'trivia' && <GuessTheYearGame data={data} />}
            {activeGame === 'whack' && <WhackGame data={data} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}