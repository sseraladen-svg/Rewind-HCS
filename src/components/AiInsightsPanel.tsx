'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw, Brain, Heart, Lightbulb, BookOpen } from 'lucide-react';
import { getAllJournalEntries } from '@/lib/idb-store';

interface InsightData {
  moodSummary: string;
  patterns: string[];
  suggestion: string;
  reflection: string;
}

export default function AiInsightsPanel({ birthYear }: { birthYear: number }) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const entries = await getAllJournalEntries();
      if (entries.length === 0) {
        setError('Write a few journal entries first, then come back for insights.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, birthYear }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not generate insights');
        setLoading(false);
        return;
      }

      setInsights(data.insights);
    } catch {
      setError('Network error. Make sure you\'re signed in and try again.');
    }
    setLoading(false);
  }, [birthYear]);

  useEffect(() => {
    // Don't auto-fetch — let user click the button
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" style={{ color: '#c4956a' }} />
          <h3 className="old-title text-lg font-black text-[#3d2b1f]">AI Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {loading ? 'Thinking...' : 'Generate'}
        </button>
      </div>

      <p className="old-body text-xs text-[#8b7355]">
        Let AI read your journal and share what it notices about your emotional patterns.
      </p>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="sk-paper rounded-xl p-6 text-center sk-noise"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block text-3xl mb-3"
            >
              <Sparkles className="h-7 w-7 text-[#c4956a]" />
            </motion.div>
            <p className="old-typewriter text-sm text-[#8b7355]">
              Reading your memories...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sk-paper-aged rounded-xl p-4 sk-noise"
        >
          <p className="old-body text-xs text-[#8b5e3c]">{error}</p>
        </motion.div>
      )}

      {/* Insights Display */}
      <AnimatePresence>
        {insights && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Mood Summary */}
            <div className="sk-paper rounded-xl p-4 sk-noise relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c4956a, #d4a574)' }}>
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="old-label text-xs font-black text-[#5c4033] uppercase tracking-widest mb-1">
                    Mood Summary
                  </h4>
                  <p className="old-body text-sm text-[#3d2b1f] leading-relaxed">{insights.moodSummary}</p>
                </div>
              </div>
            </div>

            {/* Patterns */}
            {insights.patterns?.length > 0 && (
              <div className="sk-paper rounded-xl p-4 sk-noise relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c9a6e, #96b88a)' }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="old-label text-xs font-black text-[#5c4033] uppercase tracking-widest mb-1">
                      Patterns
                    </h4>
                    <ul className="space-y-1">
                      {insights.patterns.map((p, i) => (
                        <li key={i} className="old-body text-sm text-[#3d2b1f] flex items-start gap-2">
                          <span className="text-[#c4956a] mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion */}
            <div className="sk-paper rounded-xl p-4 sk-noise relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6b8cae, #8ab0d4)' }}>
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="old-label text-xs font-black text-[#5c4033] uppercase tracking-widest mb-1">
                    Gentle Suggestion
                  </h4>
                  <p className="old-body text-sm text-[#3d2b1f] leading-relaxed">{insights.suggestion}</p>
                </div>
              </div>
            </div>

            {/* Reflection */}
            <div className="sk-leather rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b6f5c, #a8907a)' }}>
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="old-label text-xs font-black text-[#faf6eb] uppercase tracking-widest mb-1">
                    Reflection
                  </h4>
                  <p className="old-body text-sm text-[#faf6eb]/90 leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {insights.reflection}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}