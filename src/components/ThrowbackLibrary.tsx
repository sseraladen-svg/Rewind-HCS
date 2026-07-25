'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { nostalgiaData, type NostalgiaItem } from '@/lib/nostalgia-data';
import { getLibraryFavorites, setLibraryFavorites } from '@/lib/idb-store';
import { Input } from '@/components/ui/input';
import { Heart, Search, Shuffle, ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp01, Library, Star, Film } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════

type SortOption = 'az' | 'za' | 'oldest' | 'newest' | 'random';

interface FlatItem {
  item: NostalgiaItem;
  decadeKey: string;
  decadeLabel: string;
  year: string;
  sortYear: number;
}

const DECADE_KEYS = ['1970s', '1980s', '1990s', '2000s', '2010s'] as const;

const DECADE_DISPLAY: Record<string, string> = {
  '1970s': '70s',
  '1980s': '80s',
  '1990s': '90s',
  '2000s': '2000s',
  '2010s': '2010s',
};

const CATEGORY_KEYS = ['cartoons', 'toys', 'music', 'movies', 'snacks', 'games', 'trends', 'schoolLife', 'tech'] as const;

const CATEGORY_DISPLAY: Record<string, string> = {
  cartoons: 'Cartoons',
  toys: 'Toys',
  music: 'Music',
  movies: 'Movies',
  snacks: 'Snacks',
  games: 'Games',
  trends: 'Trends',
  schoolLife: 'School Life',
  tech: 'Tech',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'az', label: 'A→Z' },
  { value: 'za', label: 'Z→A' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'newest', label: 'Newest' },
  { value: 'random', label: 'Shuffle' },
];

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function extractYear(title: string, decadeKey: string): { year: string; sortYear: number } {
  const match = title.match(/\((\d{4})\)/);
  if (match) {
    return { year: match[1], sortYear: parseInt(match[1], 10) };
  }
  // Fall back to decade start year
  const decadeStart = parseInt(decadeKey, 10);
  return { year: decadeKey, sortYear: decadeStart };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function ThrowbackLibrary() {
  const [search, setSearch] = useState('');
  const [decadeFilter, setDecadeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('az');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Load favorites from IndexedDB
  useEffect(() => {
    getLibraryFavorites().then(setFavorites).catch(() => {});
  }, []);

  // Persist favorites to IndexedDB
  const saveFavorites = useCallback((next: string[]) => {
    setFavorites(next);
    setLibraryFavorites(next).catch(() => {});
  }, []);

  const toggleFavorite = useCallback(
    (title: string) => {
      if (favorites.includes(title)) {
        saveFavorites(favorites.filter((f) => f !== title));
      } else {
        saveFavorites([...favorites, title]);
      }
    },
    [favorites, saveFavorites],
  );

  // Flatten all items with decade & year info
  const allItems: FlatItem[] = useMemo(() => {
    const flat: FlatItem[] = [];
    for (const dk of DECADE_KEYS) {
      const decade = nostalgiaData[dk];
      if (!decade) continue;
      for (const ck of CATEGORY_KEYS) {
        const items = decade[ck];
        if (!items) continue;
        for (const item of items) {
          const { year, sortYear } = extractYear(item.title, dk);
          flat.push({
            item,
            decadeKey: dk,
            decadeLabel: DECADE_DISPLAY[dk] ?? dk,
            year,
            sortYear,
          });
        }
      }
    }
    return flat;
  }, []);

  // Filtered + sorted results
  const results = useMemo(() => {
    let filtered = allItems;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (fi) =>
          fi.item.title.toLowerCase().includes(q) ||
          fi.item.description.toLowerCase().includes(q),
      );
    }

    // Decade filter
    if (decadeFilter !== 'all') {
      filtered = filtered.filter((fi) => fi.decadeKey === decadeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (fi) => fi.item.category.toLowerCase().replace(/\s+/g, '') === categoryFilter,
      );
    }

    // Favorites only
    if (showFavoritesOnly) {
      filtered = filtered.filter((fi) => favorites.includes(fi.item.title));
    }

    // Sort
    switch (sortOption) {
      case 'az':
        filtered = [...filtered].sort((a, b) => a.item.title.localeCompare(b.item.title));
        break;
      case 'za':
        filtered = [...filtered].sort((a, b) => b.item.title.localeCompare(a.item.title));
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.sortYear - b.sortYear);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.sortYear - a.sortYear);
        break;
      case 'random':
        // Use shuffleSeed to trigger re-shuffle
        filtered = shuffleArray(filtered);
        void shuffleSeed; // ensure dep tracking
        break;
    }

    return filtered;
  }, [allItems, search, decadeFilter, categoryFilter, showFavoritesOnly, sortOption, favorites, shuffleSeed]);

  const handleShuffle = () => {
    setSortOption('random');
    setShuffleSeed((s) => s + 1);
  };

  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-3">
          <Library className="w-7 h-7 text-[#8b7355]" />
          <h2 className="old-title text-3xl md:text-4xl text-[#5c4033]">Throwback Library</h2>
        </div>
        <p className="old-body text-[#8b7355] text-sm md:text-base max-w-lg mx-auto">
          Browse our complete catalog of nostalgia. Search, filter, and save your favorites.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="sk-paper rounded-lg p-4 mb-6 relative">
        <div className="sk-noise" />
        <div className="relative z-10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8b7355] shrink-0" />
          <Input
            type="text"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="old-typewriter border-none bg-transparent text-[#5c4033] placeholder:text-[#c4956a]/60 focus-visible:ring-0 shadow-none text-base"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#c4956a] hover:text-[#5c4033] text-xs old-label shrink-0"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills: Decades ── */}
      <div className="mb-4">
        <p className="old-label text-xs text-[#8b7355] mb-2 uppercase tracking-wider">Decade</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDecadeFilter('all')}
            className={`px-3 py-1.5 rounded text-xs old-label transition-colors ${
              decadeFilter === 'all'
                ? 'sk-leather text-white'
                : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
            }`}
          >
            All
          </button>
          {DECADE_KEYS.map((dk) => (
            <button
              key={dk}
              onClick={() => setDecadeFilter(dk)}
              className={`px-3 py-1.5 rounded text-xs old-label transition-colors ${
                decadeFilter === dk
                  ? 'sk-leather text-white'
                  : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
              }`}
            >
              {DECADE_DISPLAY[dk]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Pills: Categories ── */}
      <div className="mb-4">
        <p className="old-label text-xs text-[#8b7355] mb-2 uppercase tracking-wider">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded text-xs old-label transition-colors ${
              categoryFilter === 'all'
                ? 'sk-leather text-white'
                : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
            }`}
          >
            All
          </button>
          {CATEGORY_KEYS.map((ck) => (
            <button
              key={ck}
              onClick={() => setCategoryFilter(ck)}
              className={`px-3 py-1.5 rounded text-xs old-label transition-colors ${
                categoryFilter === ck
                  ? 'sk-leather text-white'
                  : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
              }`}
            >
              {CATEGORY_DISPLAY[ck]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sort + Favorites Toggle + Count ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <p className="old-label text-xs text-[#8b7355] uppercase tracking-wider">Sort</p>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const icons: Record<string, React.ReactNode> = {
              az: <ArrowDownAZ className="w-3 h-3" />,
              za: <ArrowUpZA className="w-3 h-3" />,
              oldest: <ArrowUp01 className="w-3 h-3" />,
              newest: <ArrowDown01 className="w-3 h-3" />,
              random: <Shuffle className="w-3 h-3" />,
            };
            return (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === 'random') {
                    handleShuffle();
                  } else {
                    setSortOption(opt.value);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs old-label transition-colors ${
                  sortOption === opt.value
                    ? 'sk-leather text-white'
                    : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
                }`}
              >
                {icons[opt.value]}
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Favorites toggle */}
        <button
          onClick={() => setShowFavoritesOnly((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs old-label transition-colors ${
            showFavoritesOnly
              ? 'sk-leather text-white'
              : 'bg-[#f5e6d3] text-[#5c4033] hover:bg-[#e8d5bf]'
          }`}
        >
          <Star className="w-3 h-3" />
          {showFavoritesOnly ? 'Showing Favorites' : 'Favorites Only'}
        </button>
      </div>

      {/* ── Results Count ── */}
      <p className="old-label text-xs text-[#8b7355] mb-4">
        Showing <span className="text-[#5c4033] font-bold">{results.length}</span> of{' '}
        <span className="text-[#5c4033] font-bold">{allItems.length}</span> items
      </p>

      {/* ── Cards Grid ── */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((fi) => {
            const isFav = favorites.includes(fi.item.title);
            return (
              <div
                key={fi.item.title + fi.decadeKey}
                className="sk-paper rounded-lg p-4 relative group hover:shadow-md transition-shadow"
              >
                <div className="sk-noise" />

                {/* Favorite button */}
                <button
                  onClick={() => toggleFavorite(fi.item.title)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFav
                        ? 'text-red-500 fill-red-500'
                        : 'text-[#c4956a] group-hover:text-[#8b7355]'
                    }`}
                  />
                </button>

                <div className="relative z-10">
                  {/* Emoji + Title */}
                  <div className="flex items-start gap-2 mb-2 pr-8">
                    <span className="text-2xl leading-none shrink-0">{fi.item.emoji}</span>
                    <h3 className="old-typewriter text-sm md:text-base font-bold text-[#5c4033] leading-snug">
                      {fi.item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="old-body text-xs text-[#8b7355] leading-relaxed mb-3 line-clamp-3">
                    {fi.item.description}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#f5e6d3] text-[10px] old-label text-[#5c4033]">
                      {fi.year}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-[#efe0d0] text-[10px] old-label text-[#8b7355]">
                      {fi.decadeLabel}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-[#e8d5bf] text-[10px] old-label text-[#8b7355]">
                      {fi.item.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="sk-paper rounded-lg p-12 text-center">
          <div className="sk-noise" />
          <div className="relative z-10">
            <Film className="h-12 w-12 mx-auto mb-4 text-[#c4956a]" />
            <h3 className="old-title text-xl text-[#5c4033] mb-2">No matches found...</h3>
            <p className="old-body text-sm text-[#8b7355]">
              Try a different search, dude. Or maybe clear some filters and explore again!
            </p>
          </div>
        </div>
      )}
    </section>
  );
}