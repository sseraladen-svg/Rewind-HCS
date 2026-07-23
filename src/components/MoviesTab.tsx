'use client';

import { useState, useEffect, useCallback } from 'react';
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

const TYPE_CONFIG = {
  movie: { emoji: '\u2b50', label: 'Movies', icon: Film, color: '#c4956a' },
  tv: { emoji: '\ud83d\udcfa', label: 'TV Shows', icon: Tv, color: '#6b8e6b' },
  cartoon: { emoji: '\u2728', label: 'Cartoons', icon: Sparkles, color: '#8b5ec8' },
};

function getPosterEmoji(item: MovieItem): string {
  if (item.type === 'cartoon') {
    if (/dragon|z/i.test(item.title)) return '\ud83d\udc32';
    if (/sponge/i.test(item.title)) return '\ud83e\udd24';
    if (/pok/i.test(item.title)) return '\u26a1';
    if (/toy/i.test(item.title)) return '\ud83c\udfae';
    if (/simpson/i.test(item.title)) return '\ud83c\udfe0';
    if (/avatar/i.test(item.title)) return '\ud83d\udd2e';
    if (/nemo/i.test(item.title)) return '\ud83d\udc1f';
    if (/frozen/i.test(item.title)) return '\u2744\ufe0f';
    if (/shrek/i.test(item.title)) return '\ud83e\ude9a';
    if (/scare|ghost/i.test(item.title)) return '\ud83d\udd7b';
    if (/lion|king/i.test(item.title)) return '\ud83e\udd81';
    if (/mermaid/i.test(item.title)) return '\ud83d\udc19';
    return '\ud83c\udfa8';
  }
  if (item.type === 'tv') {
    if (/friend/i.test(item.title)) return '\ud83e\udd1d';
    if (/stranger/i.test(item.title)) return '\ud83d\udd2e';
    return '\ud83d\udcfa';
  }
  if (/star wars/i.test(item.title)) return '\u2b50';
  if (/matrix/i.test(item.title)) return '\ud83d\ude80';
  if (/titanic/i.test(item.title)) return '\ud83c\udfe5';
  if (/jurassic/i.test(item.title)) return '\ud83e\udd96';
  if (/batman|knight/i.test(item.title)) return '\ud83d\ude97';
  if (/spider/i.test(item.title)) return '\ud83d\udd77';
  return '\ud83c\udfac';
}

export default function MoviesTab({ birthYear }: { birthYear: number }) {
  const [data, setData] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = data?.items.filter(
    (item) => category === 'all' || item.type === category
  ) || [];

  return (
    <div className="space-y-5 relative z-10">
      {/* Header */}
      <div className="text-center">
        <p className="old-body text-sm font-medium mb-1 text-[#5c4033]">
          Everything you grew up with, from your first year to age 18.
        </p>
        <div className="sk-vhs-label old-label text-[10px] font-bold px-3 py-1 rounded inline-block">
          <Clock className="h-3 w-3 inline mr-1" />
          Showing: {birthYear} \u2013 {maxAge}
          {data && <span className="ml-2 opacity-60">({data.source})</span>}
        </div>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
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
            <Loader2 className="h-6 w-6 animate-spin text-[#c4956a]" />
            <p className="old-typewriter text-xs">
              Rewinding the VHS tape...
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="sk-paper rounded-xl p-8 sk-noise text-center">
          <p className="text-3xl mb-2">\ud83c\udfac</p>
          <p className="old-body text-sm text-[#8b7355]">
            No content found for {birthYear}\u2013{maxAge} in this category.
          </p>
        </div>
      )}
    </div>
  );
}

/* \u2500\u2500 Filter Button \u2500\u2500 */
function FilterBtn({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`sk-btn old-btn px-3 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1 transition-all ${active ? 'ring-2 ring-[#8b7355]/30' : ''}`}
    >
      {children}
    </button>
  );
}

/* \u2500\u2500 Movie Card \u2500\u2500 */
function MovieCard({
  item, index, expanded, onToggle,
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
        className="sk-paper overflow-hidden cursor-pointer group transition-all duration-200"
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
          <div className="absolute top-2 left-2 sk-vhs-label text-[9px] font-bold px-2 py-0.5 rounded">
            {item.year}
          </div>

          {/* Type badge */}
          <div className="absolute top-2 right-2 sk-vhs-label text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            {cfg.emoji} {cfg.label}
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded px-1.5 py-0.5 bg-black/50">
            <Star className="h-3 w-3 text-yellow-400" style={{ fill: '#facc15' }} />
            <span className="text-[9px] text-white font-bold old-typewriter">
              {item.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="old-heading font-extrabold text-sm leading-tight mb-1.5 line-clamp-2 text-[#3d2b1f]">
            {item.title}
          </h3>

          {/* Genre chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="old-label text-[8px] font-bold px-1.5 py-0.5 rounded sk-paper"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Expand arrow */}
          <div className="flex items-center justify-center">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 text-[#b8a888] ${expanded ? 'rotate-180' : ''}`}
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
              <div className="px-3 pb-3 border-t border-[#d4c5a9] pt-2 old-body text-xs leading-relaxed">
                {item.overview}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
