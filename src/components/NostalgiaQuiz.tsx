'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  funFact: string;
  category: string;
  emoji: string;
}

interface NostalgiaQuizProps {
  decade: string;
  compact?: boolean;
}

const RATING_LABELS = [
  { min: 0, label: 'Time Traveler', emoji: '🕰️', desc: 'Better luck next era!' },
  { min: 2, label: 'Nostalgia Novice', emoji: '📺', desc: 'You remember a few things...' },
  { min: 3, label: 'Decade Dreamer', emoji: '💭', desc: 'Getting warmer!' },
  { min: 4, label: 'Memory Master', emoji: '🧠', desc: 'Impressive nostalgia knowledge!' },
  { min: 5, label: `True ${'90s'} Kid`, emoji: '🏆', desc: 'You ARE the nostalgia!' },
];

const CATEGORY_COLORS: Record<string, string> = {
  movies: 'bg-amber-100 text-amber-800',
  music: 'bg-rose-100 text-rose-800',
  tv: 'bg-violet-100 text-violet-800',
  tech: 'bg-cyan-100 text-cyan-800',
  toys: 'bg-orange-100 text-orange-800',
  games: 'bg-emerald-100 text-emerald-800',
  culture: 'bg-pink-100 text-pink-800',
};

export default function NostalgiaQuiz({ decade, compact }: NostalgiaQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [finished, setFinished] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quiz?decade=${decade}&count=5`)
      .then(r => r.json())
      .then(data => { setQuestions(data.questions); setLoading(false); })
      .catch(() => setLoading(false));
  }, [decade]);

  const handleSelect = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[currentQ].correctIndex) {
      setScore(s => s + 1);
    }
    setShowFact(true);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setShowFact(false);
      } else {
        setFinished(true);
      }
    }, 2000);
  }, [selected, currentQ, questions]);

  const handleReplay = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setShowFact(false);
    setFinished(false);
    fetch(`/api/quiz?decade=${decade}&count=5`)
      .then(r => r.json())
      .then(data => setQuestions(data.questions));
  };

  const rating = RATING_LABELS.find(r => score >= r.min) || RATING_LABELS[0];

  if (loading) return (
    <div className="sk-paper rounded-xl p-4 sk-noise">
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-bounce">🎮</span>
        <p className="old-typewriter text-xs text-[#8b7355]">Loading quiz...</p>
      </div>
    </div>
  );

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="sk-paper rounded-xl p-4 sk-noise w-full text-left cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="old-title text-sm font-bold">Nostalgia Quiz</p>
              <p className="old-body text-[10px] text-[#8b7355]">Test your {decade} knowledge</p>
            </div>
          </div>
          <span className="old-typewriter text-[10px] text-[#8b7355]">5 Qs →</span>
        </div>
      </button>
    );
  }

  return (
    <div className="sk-paper rounded-xl overflow-hidden sk-noise">
      {/* Header */}
      <div className="sk-leather px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <h3 className="old-title text-sm font-bold text-[#faf6eb]">Nostalgia Quiz</h3>
          <span className="text-[10px] old-typewriter px-2 py-0.5 rounded bg-white/20 text-[#faf6eb]">{decade}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="old-typewriter text-[10px] text-[#d4a574]">{currentQ + 1}/{questions.length}</span>
          {compact && (
            <button onClick={() => setExpanded(false)} className="text-[#d4a574] hover:text-[#faf6eb] cursor-pointer text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#d4c5a9]/50">
        <motion.div
          className="h-full bg-[#c4956a]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ + (finished ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="old-title text-base font-bold text-[#3d2b1f] mb-1">
                {questions[currentQ]?.emoji} {questions[currentQ]?.question}
              </p>
              <span className={`inline-block text-[9px] old-typewriter px-2 py-0.5 rounded mb-3 ${CATEGORY_COLORS[questions[currentQ]?.category] || 'bg-gray-100 text-gray-600'}`}>
                {questions[currentQ]?.category}
              </span>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {questions[currentQ]?.options.map((opt, i) => {
                  const isCorrect = i === questions[currentQ].correctIndex;
                  const isWrong = selected === i && !isCorrect;
                  const showCorrect = selected !== null && isCorrect;
                  let borderClass = 'border-[#c4b99a] hover:border-[#c4956a] hover:shadow-md';
                  let bgClass = 'sk-inset';
                  if (showCorrect) { borderClass = 'border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]'; bgClass = 'bg-green-50'; }
                  if (isWrong) { borderClass = 'border-red-400'; bgClass = 'bg-red-50'; }

                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      initial={false}
                      animate={isWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`sk-paper ${bgClass} rounded-lg p-3 text-left border-2 ${borderClass} transition-all cursor-pointer disabled:cursor-default`}
                    >
                      <span className="old-body text-xs text-[#3d2b1f]">
                        {showCorrect && '✅ '}{isWrong && '❌ '}{opt}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Fun fact */}
              <AnimatePresence>
                {showFact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="sk-inset rounded-lg p-3 bg-amber-50/80">
                      <p className="old-body text-[11px] text-[#5c4033]">
                        <span className="font-bold">💡 Fun Fact:</span> {questions[currentQ]?.funFact}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-5xl mb-3">{rating.emoji}</div>
              <p className="old-title text-xl font-bold text-[#3d2b1f] mb-1">{rating.label}</p>
              <p className="old-body text-xs text-[#8b7355] mb-2">{rating.desc}</p>
              <div className="sk-inset inline-block rounded-lg px-4 py-2 mb-4">
                <p className="old-typewriter text-2xl font-bold text-[#c4956a]">{score}/{questions.length}</p>
              </div>
              <button onClick={handleReplay} className="sk-btn old-btn px-5 py-2 rounded-lg font-bold text-sm cursor-pointer">
                Play Again 🔄
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
