'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Film, BookOpen, Gamepad2, Clock, Phone,
  ImageIcon, Settings, Camera, Sparkles, Play, ChevronRight,
} from 'lucide-react';
import { nostalgiaData, type NostalgiaItem, type DecadeData } from '@/lib/nostalgia-data';
import { getAllJournalEntries } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: string;
  tab?: string;
  action?: () => void;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

/* ═══════════════════════════════════════════════════
   Quick Actions (hardcoded)
   ═══════════════════════════════════════════════════ */

function buildQuickActions(onNavigate?: (tab: string) => void, onClose?: () => void): SearchResult[] {
  const nav = (tab: string) => {
    onNavigate?.(tab);
    onClose?.();
  };
  return [
    { id: 'qa-journal', title: 'Go to Journal', subtitle: 'Open your diary', emoji: '📖', category: 'Quick Action', tab: 'journal', action: () => nav('journal') },
    { id: 'qa-movies', title: 'Browse Movies', subtitle: 'Rediscover your era\'s films', emoji: '🎬', category: 'Quick Action', tab: 'movies', action: () => nav('movies') },
    { id: 'qa-games', title: 'Play Games', subtitle: 'Retro games & fun', emoji: '🕹️', category: 'Quick Action', tab: 'games', action: () => nav('games') },
    { id: 'qa-contacts', title: 'View Contacts', subtitle: 'Your address book', emoji: '📞', category: 'Quick Action', tab: 'contacts', action: () => nav('contacts') },
    { id: 'qa-memory', title: 'Memory Vault', subtitle: 'Saved favorites', emoji: '💎', category: 'Quick Action', tab: 'memory', action: () => nav('memory') },
    { id: 'qa-timeline', title: 'View Timeline', subtitle: 'Your life in decades', emoji: '⏳', category: 'Quick Action', tab: 'timeline', action: () => nav('timeline') },
    { id: 'qa-camera', title: 'Open Camera', subtitle: 'Snap a vintage photo', emoji: '📸', category: 'Quick Action', tab: 'camera', action: () => nav('camera') },
    { id: 'qa-settings', title: 'Settings', subtitle: 'Theme & preferences', emoji: '⚙️', category: 'Quick Action', tab: 'settings', action: () => nav('settings') },
  ];
}

/* ═══════════════════════════════════════════════════
   Nostalgia Data Search (sync)
   ═══════════════════════════════════════════════════ */

function buildNostalgiaIndex(): { items: NostalgiaItem[]; decadeMap: Map<string, string> } {
  const items: NostalgiaItem[] = [];
  const decadeMap = new Map<string, string>();

  for (const [decadeKey, decade] of Object.entries(nostalgiaData)) {
    const categories: (keyof DecadeData)[] = [
      'cartoons', 'toys', 'music', 'movies', 'snacks', 'games', 'trends', 'schoolLife', 'tech',
    ];
    for (const cat of categories) {
      const catItems = decade[cat] as NostalgiaItem[] | undefined;
      if (catItems) {
        for (const item of catItems) {
          const key = `${decadeKey}::${item.title}`;
          items.push(item);
          decadeMap.set(key, decadeKey);
        }
      }
    }
  }
  return { items, decadeMap };
}

const NOSTALGIA_INDEX = buildNostalgiaIndex();

function searchNostalgia(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return NOSTALGIA_INDEX.items
    .filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((item, i) => {
      const key = `${item.title}::${i}`;
      return {
        id: `nost-${key}`,
        title: item.title,
        subtitle: item.description.length > 80 ? item.description.slice(0, 80) + '…' : item.description,
        emoji: item.emoji,
        category: `Nostalgia · ${item.category}`,
      };
    });
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */

export default function SearchOverlay({ open, onClose, onNavigate }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    movies: SearchResult[];
    journals: SearchResult[];
    nostalgia: SearchResult[];
    actions: SearchResult[];
  }>({ movies: [], journals: [], nostalgia: [], actions: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when opening; reset state when closing
  useEffect(() => {
    if (open) {
      // Small delay so the animation doesn't conflict with focus
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset search state when overlay transitions from open to closed
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      // Defer state reset to avoid cascading render lint warning
      const t = setTimeout(() => {
        setQuery('');
        setResults({ movies: [], journals: [], nostalgia: [], actions: [] });
        setHasSearched(false);
      }, 0);
      return () => clearTimeout(t);
    }
    wasOpenRef.current = open;
  }, [open]);

  // ESC key handler
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Search debounce
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ movies: [], journals: [], nostalgia: [], actions: buildQuickActions(onNavigate, onClose) });
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Nostalgia search (sync)
    const nostalgiaResults = searchNostalgia(q);

    // Quick actions filter
    const allActions = buildQuickActions(onNavigate, onClose);
    const actionResults = allActions.filter(
      (a) => a.title.toLowerCase().includes(q.toLowerCase()) || a.subtitle.toLowerCase().includes(q.toLowerCase())
    );

    // Journal & Movies in parallel
    let journalResults: SearchResult[] = [];
    let movieResults: SearchResult[] = [];

    try {
      const journalPromise = getAllJournalEntries().then((entries) => {
        return entries
          .filter((e) =>
            e.title.toLowerCase().includes(q.toLowerCase()) ||
            e.body.toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 6)
          .map((e) => ({
            id: `jrnl-${e.id}`,
            title: e.title,
            subtitle: e.body.length > 80 ? e.body.slice(0, 80) + '…' : e.body,
            emoji: e.mood || '📝',
            category: 'Journal',
            tab: 'journal',
            action: () => {
              onNavigate?.('journal');
              onClose();
            },
          }));
      });

      const moviesPromise = fetch('/api/movies?_no_cache=' + Date.now())
        .then((r) => r.json())
        .then((data) => {
          const movies = data?.movies || data || [];
          return movies
            .filter((m: { title?: string; overview?: string }) =>
              m.title?.toLowerCase().includes(q.toLowerCase()) ||
              m.overview?.toLowerCase().includes(q.toLowerCase())
            )
            .slice(0, 6)
            .map((m: { title: string; year?: number; type?: string; genres?: string[]; rating?: number }, i: number) => ({
              id: `mov-${i}-${m.title}`,
              title: m.title,
              subtitle: [
                m.year && `(${m.year})`,
                m.type && m.type.charAt(0).toUpperCase() + m.type.slice(1),
                m.rating && `⭐ ${m.rating}`,
                m.genres?.slice(0, 2).join(', '),
              ].filter(Boolean).join(' · '),
              emoji: m.type === 'tv' ? '📺' : m.type === 'cartoon' ? '🎞️' : '🎬',
              category: 'Movies & TV',
              tab: 'movies',
              action: () => {
                onNavigate?.('movies');
                onClose();
              },
            }));
        })
        .catch(() => []);

      [journalResults, movieResults] = await Promise.all([journalPromise, moviesPromise]);
    } catch {
      // silently fail
    }

    setResults({
      movies: movieResults,
      journals: journalResults,
      nostalgia: nostalgiaResults,
      actions: actionResults,
    });
    setLoading(false);
  }, [onNavigate, onClose]);

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, doSearch]);

  // Total results count
  const totalResults = results.movies.length + results.journals.length + results.nostalgia.length + results.actions.length;

  // Click outside handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Category icon mapping
  const getCategoryIcon = (cat: string) => {
    if (cat.startsWith('Journal')) return <BookOpen className="h-3.5 w-3.5" />;
    if (cat.startsWith('Movies')) return <Film className="h-3.5 w-3.5" />;
    if (cat.startsWith('Quick')) return <Sparkles className="h-3.5 w-3.5" />;
    return <Clock className="h-3.5 w-3.5" />;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(30, 20, 10, 0.85)', backdropFilter: 'blur(4px)' }}
          onClick={handleBackdropClick}
        >
          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-lg flex flex-col"
            style={{ maxHeight: 'min(85vh, 720px)' }}
          >
            {/* ═══ SEARCH INPUT ═══ */}
            <div className="sk-paper rounded-t-2xl rounded-b-none overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="h-5 w-5 text-[#8b7355] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your memories..."
                  className="old-body flex-1 bg-transparent outline-none text-[#3d2b1f] placeholder:text-[#b8a888] text-base"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="w-6 h-6 rounded-full bg-[#d4c5a9]/60 flex items-center justify-center hover:bg-[#c4956a]/40 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3 text-[#5c4033]" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="sk-btn old-btn px-2.5 py-1 rounded-lg text-[10px] text-[#8b7355] cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Command hint bar */}
              <div className="flex items-center justify-center gap-4 px-4 py-1.5 border-t border-[#d4c5a9]/50">
                <span className="old-typewriter text-[9px] text-[#a89878]">
                  {query ? `${totalResults} result${totalResults !== 1 ? 's' : ''}` : 'Start typing to search…'}
                </span>
                {!query && (
                  <span className="old-typewriter text-[9px] text-[#b8a888]">⌘K</span>
                )}
              </div>
            </div>

            {/* ═══ RESULTS LIST ═══ */}
            <div className="sk-paper-aged rounded-b-2xl rounded-t-none flex-1 overflow-hidden">
              <div
                className="overflow-y-auto p-2"
                style={{ maxHeight: 'min(70vh, 600px)', minHeight: '120px' }}
              >
                {loading ? (
                  <LoadingState />
                ) : hasSearched && totalResults === 0 ? (
                  <EmptyState query={query} />
                ) : (
                  <ResultGroups
                    results={results}
                    getCategoryIcon={getCategoryIcon}
                  />
                )}
              </div>
            </div>

            {/* Footer hint */}
            <div className="flex justify-center py-2">
              <span className="old-typewriter text-[9px] text-[#a89878] opacity-60">
                ↑↓ navigate · ↵ select · esc close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════ */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📼</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          🎞️
        </motion.div>
      </div>
      <p className="old-typewriter text-xs text-[#8b7355]">Searching the archives...</p>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
      <span className="text-3xl">🔍</span>
      <p className="old-title text-base text-[#5c4033] font-bold">No results found</p>
      <p className="old-body text-xs text-[#8b7355] text-center leading-relaxed">
        Couldn&apos;t find &ldquo;{query}&rdquo; in your memories.
        <br />
        Try a different search or check your spelling.
      </p>
    </div>
  );
}

function ResultGroups({
  results,
  getCategoryIcon,
}: {
  results: {
    movies: SearchResult[];
    journals: SearchResult[];
    nostalgia: SearchResult[];
    actions: SearchResult[];
  };
  getCategoryIcon: (cat: string) => React.ReactNode;
}) {
  const groups: { title: string; icon: React.ReactNode; items: SearchResult[] }[] = [];

  if (results.actions.length > 0) {
    groups.push({ title: 'Quick Actions', icon: <Sparkles className="h-3.5 w-3.5 text-amber-600" />, items: results.actions });
  }
  if (results.nostalgia.length > 0) {
    groups.push({ title: 'Nostalgia', icon: <Clock className="h-3.5 w-3.5 text-orange-600" />, items: results.nostalgia });
  }
  if (results.journals.length > 0) {
    groups.push({ title: 'Journal', icon: <BookOpen className="h-3.5 w-3.5 text-green-700" />, items: results.journals });
  }
  if (results.movies.length > 0) {
    groups.push({ title: 'Movies & TV', icon: <Film className="h-3.5 w-3.5 text-purple-700" />, items: results.movies });
  }

  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.title}>
          {/* Section Header */}
          <div className="flex items-center gap-2 px-2 py-1">
            {group.icon}
            <span className="old-label text-[10px] uppercase">{group.title}</span>
            <span className="text-[9px] text-[#b8a888]">{group.items.length}</span>
          </div>

          {/* Items */}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <ResultCard key={item.id} item={item} getCategoryIcon={getCategoryIcon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultCard({
  item,
  getCategoryIcon,
}: {
  item: SearchResult;
  getCategoryIcon: (cat: string) => React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      onClick={item.action}
      className="w-full text-left sk-inset rounded-lg px-3 py-2.5 flex items-start gap-3 hover:bg-[#e8dcc8]/80 active:scale-[0.98] transition-all cursor-pointer group"
    >
      {/* Emoji */}
      <span className="text-xl leading-none shrink-0 mt-0.5">{item.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="old-title text-sm font-bold text-[#3d2b1f] truncate">{item.title}</span>
        </div>
        <p className="old-body text-[11px] text-[#8b7355] leading-snug truncate mt-0.5">
          {item.subtitle}
        </p>
        {/* Category badge */}
        <div className="flex items-center gap-1 mt-1">
          {getCategoryIcon(item.category)}
          <span className="old-typewriter text-[8px] text-[#a89878] uppercase tracking-wider">
            {item.category}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-[#b8a888] shrink-0 mt-1 group-hover:text-[#5c4033] transition-colors" />
    </motion.button>
  );
}
