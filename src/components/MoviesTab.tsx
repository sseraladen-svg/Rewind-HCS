'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, Sparkles, ChevronDown, Star, Clock, Loader2 } from 'lucide-react';

interface MovieItem {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'tv' | 'cartoon';
  poster: string;
  backdrop?: string;
  rating: number;
  genres: string[];
  overview: string;
  mediaType?: string;
  watchProviders?: { name: string; logo: string }[];
}

interface MoviesResponse {
  items: MovieItem[];
  totalPages: number;
  minYear: number;
  maxYear: number;
  source: string;
}

/* ── emoji by type ── */
const TYPE_CONFIG = {
  movie: { emoji: '⭐', label: 'Movies', icon: Film, color: '#c4956a' },
  tv: { emoji: '📺', label: 'TV Shows', icon: Tv, color: '#6b8e6b' },
  cartoon: { emoji: '✨', label: 'Cartoons', icon: Sparkles, color: '#8b5ec8' },
};

/* ── fallback emoji by title keyword ── */
function getPosterEmoji(item: MovieItem): string {
  if (item.type === 'cartoon') {
    if (/dragon|z/i.test(item.title)) return '🐲';
    if (/sponge/i.test(item.title)) return '🤤';
    if (/pok/i.test(item.title)) return '⚡';
    if (/toy/i.test(item.title)) return '🎮';
    if (/simpson/i.test(item.title)) return '🏠';
    if (/avatar/i.test(item.title)) return '🔮';
    if (/nemo/i.test(item.title)) return '🐟';
    if (/frozen/i.test(item.title)) return '❄️';
    if (/shrek/i.test(item.title)) return '🪚';
    if (/scare|ghost/i.test(item.title)) return '👻';
    if (/lion|king/i.test(item.title)) return '🦁';
    if (/mermaid/i.test(item.title)) return '🐙';
    return '🎨';
  }
  if (item.type === 'tv') {
    if (/friend/i.test(item.title)) return '🤝';
    if (/stranger/i.test(item.title)) return '🔮';
    return '📺';
  }
  if (/star wars/i.test(item.title)) return '⭐';
  if (/matrix/i.test(item.title)) return '🚀';
  if (/titanic/i.test(item.title)) return '🏥';
  if (/jurassic/i.test(item.title)) return '🦖';
  if (/batman|knight/i.test(item.title)) return '🚗';
  if (/spider/i.test(item.title)) return '🕷';
  return '🎬';
}

/* ── decade theme detector ── */
function getDecadeTheme(birthYear: number): string {
  const decade = Math.floor(birthYear / 10) * 10;
  if (decade === 1980) return '80s';
  if (decade === 1990) return '90s';
  if (decade === 2000) return '2000s';
  return '';
}

/* ── 80s theme-specific styles (inline for things CSS can't reach) ── */
const DECADE_BG: Record<string, string> = {
  '80s': '#0a0a0a',
  '90s': '#c0c0c0',
  '2000s': '#d6eaff',
};

export default function MoviesTab({ birthYear }: { birthYear: number }) {
  const [data, setData] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const decadeTheme = useMemo(() => getDecadeTheme(birthYear), [birthYear]);
  const maxAge = birthYear + 18;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        birthYear: String(birthYear),
        category,
        page: '1',
      });
      const res = await fetch(`/api/movies?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('[MoviesTab] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [birthYear, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = data?.items.filter(
    (item) => category === 'all' || item.type === category
  ) || [];

  return (
    <div
      className="space-y-5 relative"
      data-decade-theme={decadeTheme}
      style={decadeTheme ? { background: DECADE_BG[decadeTheme], borderRadius: '8px', padding: '20px', position: 'relative', overflow: 'hidden' } : undefined}
    >
      {/* Header */}
      <div className="text-center relative z-10">
        <p className="old-body text-sm font-medium mb-1">
          Everything you grew up with, from your first year to age 18.
        </p>
        <div className="sk-vhs-label old-label text-[10px] font-bold px-3 py-1 rounded inline-block">
          <Clock className="h-3 w-3 inline mr-1" />
          Showing: {birthYear} – {maxAge}
          {data && <span className="ml-2 opacity-60">({data.source})</span>}
        </div>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center relative z-10">
        <FilterBtn active={category === 'all'} onClick={() => setCategory('all')}>
          All
        </FilterBtn>
        <FilterBtn active={category === 'movie'} onClick={() => setCategory('movie')}>
          <Film className="h-3.5 w-3.5" /> Movies
        </FilterBtn>
        <FilterBtn active={category === 'tv'} onClick={() => setCategory('tv')}>
          <Tv className="h-3.5 w-3.5" /> TV Shows
        </FilterBtn>
        <FilterBtn active={category === 'cartoon'} onClick={() => setCategory('cartoon')}>
          <Sparkles className="h-3.5 w-3.5" /> Cartoons
        </FilterBtn>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="sk-paper rounded-xl p-8 sk-noise flex flex-col items-center gap-3">
            <Loader2 className={`h-6 w-6 animate-spin ${decadeTheme ? 'loading-decade' : 'text-[#c4956a]'}`} />
            <p className="old-typewriter text-xs">
              {decadeTheme === '80s' && 'LOADING DATABASE...'}
              {decadeTheme === '90s' && 'Please wait while program loads...'}
              {decadeTheme === '2000s' && 'Loading your movie collection...'}
              {!decadeTheme && 'Rewinding the VHS tape\u2026'}
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {filteredItems.map((item, i) => (
            <MovieCard
              key={item.id}
              item={item}
              index={i}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredItems.length === 0 && (
        <div className="sk-paper rounded-xl p-8 sk-noise text-center relative z-10">
          <p className="text-3xl mb-2">
            {decadeTheme === '80s' ? '🔍' : decadeTheme === '90s' ? '💻' : '🎬'}
          </p>
          <p className={`old-body text-sm ${decadeTheme ? 'empty-text-decade' : 'text-[#8b7355]'}`}>
            No content found for {birthYear}–{maxAge} in this category.
          </p>
          <p className={`old-typewriter text-[10px] mt-2 ${decadeTheme ? 'empty-sub-decade' : 'text-[#b8a888]'}`}>
            {decadeTheme === '80s' && 'TRY ANOTHER SEARCH QUERY'}
            {decadeTheme === '90s' && 'No items found. Try a different category.'}
            {decadeTheme === '2000s' && 'Try a different filter or add TMDB_API_KEY to .env.local for live data.'}
            {!decadeTheme && 'Try a different filter or add TMDB_API_KEY to .env.local for live data.'}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Filter Button ── */
function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-all ${
        active
          ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] bg-[#d4c5a9] text-[#3d2b1f] filter-active-decade'
          : 'text-[#6b6b6b] hover:text-[#3d2b1f]'
      }`}
    >
      {children}
    </button>
  );
}

/* ── Movie Card ── */
function MovieCard({
  item,
  index,
  expanded,
  onToggle,
}: {
  item: MovieItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = TYPE_CONFIG[item.type];
  const emoji = getPosterEmoji(item);

  const hasRealPoster = item.poster && !item.poster.startsWith('/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <div
        className="sk-paper rounded-xl overflow-hidden sk-noise cursor-pointer group transition-all duration-200 movie-card-decade"
        onClick={onToggle}
      >
        {/* Poster area */}
        <div
          className="relative h-36 flex items-center justify-center"
          style={{
            background: hasRealPoster
              ? `url(${item.poster}) center/cover`
              : `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}05)`,
          }}
        >
          {hasRealPoster && (
            <div className="absolute inset-0 bg-black/20" />
          )}
          {!hasRealPoster && (
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {emoji}
            </span>
          )}

          {/* Year badge */}
          <div className="absolute top-2 left-2 sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded year-badge-decade">
            {item.year}
          </div>

          {/* Type badge */}
          <div
            className="absolute top-2 right-2 sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 type-badge-decade"
          >
            {cfg.emoji} {cfg.label}
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rating-decade rounded px-1.5 py-0.5">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 star-decade" />
            <span className="old-typewriter text-[9px] text-white font-bold">
              {item.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 relative z-10">
          <h3 className="old-heading font-extrabold text-sm leading-tight mb-1.5 line-clamp-2">
            {item.title}
          </h3>

          {/* Genre chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="old-typewriter text-[8px] font-bold px-1.5 py-0.5 rounded genre-chip-decade"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Expand arrow */}
          <div className="flex items-center justify-center">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
              style={{ color: 'var(--decade-muted, #b8a888)' }}
            />
          </div>
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && item.overview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 border-t pt-2 expand-border-decade relative z-10">
                <p className="old-body text-xs leading-relaxed overview-decade">
                  {item.overview}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
