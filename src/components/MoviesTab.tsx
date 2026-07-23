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

const TYPE_CONFIG = {
  movie: { emoji: '⭐', label: 'Movies', icon: Film, color: '#c4956a' },
  tv: { emoji: '📺', label: 'TV Shows', icon: Tv, color: '#6b8e6b' },
  cartoon: { emoji: '✨', label: 'Cartoons', icon: Sparkles, color: '#8b5ec8' },
};

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

function getDecadeTheme(birthYear: number): string {
  const decade = Math.floor(birthYear / 10) * 10;
  if (decade === 1980) return '80s';
  if (decade === 1990) return '90s';
  if (decade === 2000) return '2000s';
  return '';
}

/* Critical inline styles per theme — guaranteed to work regardless of CSS issues */
const THEME_INLINE: Record<string, React.CSSProperties> = {
  '80s': {
    background: '#0a0a0a',
    color: '#00ff88',
    fontFamily: "'VT323', monospace",
    borderRadius: '4px',
    padding: '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  '90s': {
    background: '#c0c0c0',
    color: '#000000',
    fontFamily: "'Courier Prime', monospace",
    borderRadius: '0px',
    padding: '24px',
    position: 'relative' as const,
  },
  '2000s': {
    background: '#d6eaff',
    color: '#333333',
    fontFamily: "'Nunito', sans-serif",
    borderRadius: '16px',
    padding: '24px',
    position: 'relative' as const,
  },
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = data?.items.filter(
    (item) => category === 'all' || item.type === category
  ) || [];

  const themeClass = decadeTheme ? `decade-${decadeTheme}` : '';
  const themeStyle = decadeTheme ? THEME_INLINE[decadeTheme] : undefined;

  return (
    <div
      className={`space-y-5 relative ${themeClass}`}
      style={themeStyle}
    >
      {/* 80s scanlines overlay */
      {decadeTheme === '80s' && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,255,136,0.12) 1px, rgba(0,255,136,0.12) 2px)',
          }}
        />
      )}
      {/* 80s synthwave grid */
      {decadeTheme === '80s' && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4,
            backgroundImage:
              'linear-gradient(transparent 60%, rgba(0,255,136,0.04) 60%, rgba(0,255,136,0.04) 61%, transparent 61%), linear-gradient(90deg, transparent 60%, rgba(0,255,136,0.04) 60%, rgba(0,255,136,0.04) 61%, transparent 61%)',
            backgroundSize: '60px 60px',
            transform: 'perspective(400px) rotateX(45deg)',
            transformOrigin: 'center top',
          }}
        />
      )}

      {/* Header */}
      <div className="text-center relative z-10">
        <p
          className="text-sm font-medium mb-1"
          style={decadeTheme === '80s' ? { color: '#00ff88', fontFamily: "'VT323', monospace" }
            : decadeTheme === '90s' ? { color: '#000000', fontFamily: "'Courier Prime', monospace" }
            : decadeTheme === '2000s' ? { color: '#333333', fontFamily: "'Nunito', sans-serif" }
            : { className: 'old-body text-sm text-[#5c4033] font-medium mb-1' } as any}
        >
          Everything you grew up with, from your first year to age 18.
        </p>
        <div
          className="old-label text-[10px] font-bold px-3 py-1 rounded inline-block"
          style={decadeTheme === '80s' ? {
            background: 'rgba(255,0,255,0.2)', border: '1px solid #ff00ff', color: '#ff00ff',
            fontFamily: "'VT323', monospace", boxShadow: '0 0 6px rgba(255,0,255,0.3)',
          } : decadeTheme === '90s' ? {
            background: 'linear-gradient(90deg, #000080, #1084d0)', border: '2px outset #dfdfdf', color: '#ffffff',
            fontFamily: "'Courier Prime', monospace",
          } : decadeTheme === '2000s' ? {
            background: '#e8f4ff', border: '1px solid #336699', color: '#336699',
            fontFamily: "'Nunito', sans-serif", borderRadius: '20px',
          } : {}}
        >
          <Clock className="h-3 w-3 inline mr-1" />
          Showing: {birthYear} – {maxAge}
          {data && <span className="ml-2 opacity-60">({data.source})</span>}
        </div>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center relative z-10">
        <FilterBtn active={category === 'all'} onClick={() => setCategory('all')} decadeTheme={decadeTheme}>
          All
        </FilterBtn>
        <FilterBtn active={category === 'movie'} onClick={() => setCategory('movie')} decadeTheme={decadeTheme}>
          <Film className="h-3.5 w-3.5" /> Movies
        </FilterBtn>
        <FilterBtn active={category === 'tv'} onClick={() => setCategory('tv')} decadeTheme={decadeTheme}>
          <Tv className="h-3.5 w-3.5" /> TV Shows
        </FilterBtn>
        <FilterBtn active={category === 'cartoon'} onClick={() => setCategory('cartoon')} decadeTheme={decadeTheme}>
          <Sparkles className="h-3.5 w-3.5" /> Cartoons
        </FilterBtn>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div
            className="p-8 flex flex-col items-center gap-3"
            style={
              decadeTheme === '80s' ? { background: '#111', border: '1px solid #00ff8833', borderRadius: '2px' }
              : decadeTheme === '90s' ? { background: '#c0c0c0', border: '2px inset #808080', borderRadius: '0' }
              : decadeTheme === '2000s' ? { background: '#fff', border: '1px solid #a8c8e8', borderRadius: '12px', boxShadow: '0 3px 10px rgba(51,102,153,0.15)' }
              : { className: 'sk-paper rounded-xl p-8 sk-noise' } as any
            }
          >
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: decadeTheme === '80s' ? '#00ff88' : decadeTheme === '90s' ? '#000080' : decadeTheme === '2000s' ? '#336699' : '#c4956a' }}
            />
            <p
              className="text-xs"
              style={{ fontFamily: THEME_INLINE[decadeTheme || '']?.fontFamily || "'Special Elite', monospace" }}
            >
              {decadeTheme === '80s' && 'LOADING DATABASE...'}
              {decadeTheme === '90s' && 'Please wait while program loads...'}
              {decadeTheme === '2000s' && 'Loading your movie collection...'}
              {!decadeTheme && 'Rewinding the VHS tape...'}
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
              decadeTheme={decadeTheme}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredItems.length === 0 && (
        <div
          className="p-8 text-center relative z-10"
          style={
            decadeTheme === '80s' ? { background: '#111', border: '1px solid #00ff8833', borderRadius: '2px' }
              : decadeTheme === '90s' ? { background: '#c0c0c0', border: '2px inset #808080', borderRadius: '0' }
              : decadeTheme === '2000s' ? { background: '#fff', border: '1px solid #a8c8e8', borderRadius: '12px' }
              : { className: 'sk-paper rounded-xl p-8 sk-noise text-center' } as any
          }
        >
          <p className="text-3xl mb-2">
            {decadeTheme === '80s' ? '🔍' : decadeTheme === '90s' ? '💻' : '🎬'}
          </p>
          <p className="text-sm" style={{ color: decadeTheme === '80s' ? '#00ff88' : decadeTheme === '90s' ? '#000' : '#336699' }}>
            No content found for {birthYear}–{maxAge} in this category.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Filter Button ── */
function FilterBtn({
  active, onClick, children, decadeTheme,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  decadeTheme: string;
}) {
  const style: React.CSSProperties =
    decadeTheme === '80s' ? {
      background: active ? 'rgba(0,255,136,0.15)' : '#1a1a1a',
      border: `1px solid ${active ? '#00ff88' : '#00ff8866'}`,
      color: '#00ff88',
      fontFamily: "'VT323', monospace",
      borderRadius: '2px',
      boxShadow: active
        ? '0 0 12px rgba(0,255,136,0.4), 0 0 25px rgba(0,255,136,0.2), inset 0 0 10px rgba(0,255,136,0.15)'
        : '0 0 10px rgba(0,255,136,0.3), 0 0 20px rgba(0,255,136,0.15)',
      textShadow: '0 0 8px rgba(0,255,136,0.5)',
      textTransform: 'uppercase' as const,
    }
    : decadeTheme === '90s' ? {
      background: active
        ? 'linear-gradient(180deg, #b0b0b0 0%, #a0a0a0 45%, #909090 55%, #808080 100%)'
        : 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 45%, #b0b0b0 55%, #a0a0a0 100%)',
      border: `2px ${active ? 'inset' : 'outset'} #dfdfdf #808080`,
      color: '#000000',
      fontFamily: "'Courier Prime', monospace",
      borderRadius: '0px',
      boxShadow: active
        ? 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px grey, inset -2px -2px #dfdfdf'
        : 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px grey, inset 2px 2px #dfdfdf',
      padding: '2px 8px',
    }
    : decadeTheme === '2000s' ? {
      background: active
        ? 'linear-gradient(180deg, #ffaa44 0%, #ff9922 40%, #ee8811 70%, #dd7700 100%)'
        : 'linear-gradient(180deg, #ff9f2e 0%, #ff8c00 40%, #e67a00 70%, #cc6600 100%)',
      border: `1px solid #cc6600`,
      color: '#ffffff',
      fontFamily: "'Nunito', sans-serif",
      borderRadius: '20px',
      padding: '6px 16px',
      boxShadow: active
        ? '0 3px 8px rgba(255,140,0,0.4), inset 0 1px 3px rgba(0,0,0,0.15)'
        : '0 2px 4px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.3)',
    }
    : {
      boxShadow: active ? 'inset 0 2px 4px rgba(0,0,0,0.15)' : undefined,
      background: active ? '#d4c5a9' : undefined,
      color: active ? '#3d2b1f' : '#6b6b6b',
    };

  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1 transition-all"
      style={style}
    >
      {children}
    </button>
  );
}

/* ── Movie Card ── */
function MovieCard({
  item, index, expanded, onToggle, decadeTheme,
}: {
  item: MovieItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  decadeTheme: string;
}) {
  const cfg = TYPE_CONFIG[item.type];
  const emoji = getPosterEmoji(item);
  const hasRealPoster = item.poster && !item.poster.startsWith('/');

  const cardStyle: React.CSSProperties =
    decadeTheme === '80s' ? {
      background: '#111',
      border: '1px solid #00ff8833',
      borderRadius: '2px',
      boxShadow: '0 0 8px rgba(0,255,136,0.15), 0 0 20px rgba(0,255,136,0.08), inset 0 1px 0 rgba(0,255,136,0.15)',
    }
    : decadeTheme === '90s' ? {
      background: '#c0c0c0',
      border: '2px inset #808080',
      borderRadius: '0px',
      boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff',
    }
    : decadeTheme === '2000s' ? {
      background: '#ffffff',
      border: '1px solid #a8c8e8',
      borderRadius: '12px',
      boxShadow: '0 3px 10px rgba(51,102,153,0.15), 0 1px 3px rgba(0,0,0,0.08)',
    }
    : {};

  const titleStyle: React.CSSProperties =
    decadeTheme === '80s' ? { color: '#00ff88', fontFamily: "'VT323', monospace", fontSize: '16px' }
    : decadeTheme === '90s' ? { color: '#000000', fontFamily: "'Courier Prime', monospace" }
    : decadeTheme === '2000s' ? { color: '#333333', fontFamily: "'Nunito', sans-serif" }
    : {};

  const chipStyle: React.CSSProperties =
    decadeTheme === '80s' ? { background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid #00ff8833', borderRadius: '2px', fontFamily: "'VT323', monospace" }
    : decadeTheme === '90s' ? { background: '#ffffff', color: '#000000', border: '2px inset #808080', fontFamily: "'Courier Prime', monospace" }
    : decadeTheme === '2000s' ? { background: '#e8f4ff', color: '#336699', border: '1px solid #a8c8e8', borderRadius: '20px', fontFamily: "'Nunito', sans-serif" }
    : {};

  const overviewStyle: React.CSSProperties =
    decadeTheme === '80s' ? { color: 'rgba(0,255,136,0.7)', fontFamily: "'VT323', monospace" }
    : decadeTheme === '90s' ? { color: '#333333', fontFamily: "'Courier Prime', monospace" }
    : decadeTheme === '2000s' ? { color: '#555555', fontFamily: "'Nunito', sans-serif" }
    : {};

  const ratingBg = decadeTheme === '90s' ? '#c0c0c0' : 'rgba(0,0,0,0.5)';
  const starColor = decadeTheme === '80s' ? '#00ff88' : decadeTheme === '90s' ? '#000080' : decadeTheme === '2000s' ? '#ff8c00' : '#facc15';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <div
        className="overflow-hidden cursor-pointer group transition-all duration-200"
        style={cardStyle}
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
          <div
            className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded"
            style={{
              fontFamily: THEME_INLINE[decadeTheme || '']?.fontFamily || "'Special Elite', monospace",
              color: decadeTheme === '90s' ? '#ffffff' : decadeTheme === '2000s' ? '#ffffff' : '#00ff88',
              background: decadeTheme === '80s' ? 'rgba(0,0,0,0.6)' : decadeTheme === '90s' ? '#000080' : decadeTheme === '2000s' ? '#336699' : 'linear-gradient(180deg, #f5edd6, #e8dcc8)',
              borderRadius: decadeTheme === '2000s' ? '20px' : '2px',
            }}
          >
            {item.year}
          </div>

          {/* Type badge */}
          <div
            className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
            style={{
              fontFamily: THEME_INLINE[decadeTheme || '']?.fontFamily || "'Special Elite', monospace",
              color: decadeTheme === '80s' ? '#ff00ff' : '#ffffff',
              background: decadeTheme === '80s' ? 'rgba(255,0,255,0.2)' : decadeTheme === '90s' ? '#000080' : decadeTheme === '2000s' ? '#336699' : `${cfg.color}20`,
              border: `1px solid ${decadeTheme === '80s' ? '#ff00ff' : decadeTheme === '90s' ? '#000080' : decadeTheme === '2000s' ? '#336699' : cfg.color}40`,
              borderRadius: decadeTheme === '2000s' ? '20px' : '2px',
            }}
          >
            {cfg.emoji} {cfg.label}
          </div>

          {/* Rating */}
          <div
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded px-1.5 py-0.5"
            style={{ background: ratingBg, borderRadius: decadeTheme === '2000s' ? '8px' : '2px' }}
          >
            <Star className="h-3 w-3" style={{ color: starColor, fill: starColor }} />
            <span className="text-[9px] text-white font-bold" style={{ fontFamily: THEME_INLINE[decadeTheme || '']?.fontFamily }}>
              {item.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 relative z-10">
          <h3 className="font-extrabold text-sm leading-tight mb-1.5 line-clamp-2" style={titleStyle}>
            {item.title}
          </h3>

          {/* Genre chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={chipStyle}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Expand arrow */}
          <div className="flex items-center justify-center">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              style={{
                color: decadeTheme === '80s' ? '#00ff8866' : decadeTheme === '90s' ? '#808080' : decadeTheme === '2000s' ? '#7799bb' : '#b8a888',
              }}
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
              <div
                className="px-3 pb-3 border-t pt-2 relative z-10"
                style={{
                  borderColor: decadeTheme === '80s' ? 'rgba(0,255,136,0.15)' : decadeTheme === '90s' ? '#808080' : '#a8c8e8',
                  ...overviewStyle,
                  fontSize: '12px',
                  lineHeight: '1.6',
                }}
              >
                {item.overview}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
