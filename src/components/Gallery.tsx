'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Film, Tv, Sparkles, Loader2, ImageOff } from 'lucide-react';
import { soundPageTurn, soundButtonClick, soundGalleryOpen } from '@/lib/sounds';

/* ═══════════════════════════════════════════════
   Gallery — Nostalgic poster gallery with lightbox
   Sits below the tab content area
   ══════════════════════════════════════════════ */

interface GalleryItem {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'tv' | 'cartoon';
  poster: string;
  rating: number;
  genres: string[];
  overview: string;
}

const TYPE_STYLES: Record<string, { emoji: string; label: string; color: string }> = {
  movie: { emoji: '⭐', label: 'Movie', color: '#c4956a' },
  tv: { emoji: '📺', label: 'TV Show', color: '#6b8e6b' },
  cartoon: { emoji: '✨', label: 'Cartoon', color: '#8b5ec8' },
};

export default function Gallery({ birthYear }: { birthYear: number }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const galleryRef = useRef<HTMLDivElement>(null);

  const fetchPosters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ birthYear: String(birthYear), category: 'all', page: '1' });
      const res = await fetch(`/api/movies?${params}`);
      const json = await res.json();
      // Only items with real TMDB poster URLs
      const withPosters = (json.items || []).filter((m: GalleryItem) => m.poster && !m.poster.startsWith('/'));
      setItems(withPosters);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [birthYear]);

  useEffect(() => { fetchPosters(); }, [fetchPosters]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const lightboxItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  const goNext = () => {
    if (lightboxIdx === null) return;
    soundPageTurn();
    setLightboxIdx((lightboxIdx + 1) % filtered.length);
  };
  const goPrev = () => {
    if (lightboxIdx === null) return;
    soundPageTurn();
    setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length);
  };

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="mt-8 relative z-10" ref={galleryRef}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h2 className="old-title text-xl md:text-2xl font-black text-[#3d2b1f] mb-1">
          🎬 Poster Gallery
        </h2>
        <p className="old-body text-xs text-[#8b7355]">
          Browse the visual archive of your formative years. Click any poster to explore.
        </p>
      </motion.div>

      {/* ── Filter chips ── */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          <FilterChip active={filter === 'all'} onClick={() => { soundButtonClick(); setFilter('all'); }}>
            All ({items.length})
          </FilterChip>
          <FilterChip active={filter === 'movie'} onClick={() => { soundButtonClick(); setFilter('movie'); }}>
            <Film className="h-3 w-3" /> Movies
          </FilterChip>
          <FilterChip active={filter === 'tv'} onClick={() => { soundButtonClick(); setFilter('tv'); }}>
            <Tv className="h-3 w-3" /> TV
          </FilterChip>
          <FilterChip active={filter === 'cartoon'} onClick={() => { soundButtonClick(); setFilter('cartoon'); }}>
            <Sparkles className="h-3 w-3" /> Cartoons
          </FilterChip>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="sk-paper rounded-xl p-6 sk-noise flex flex-col items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#c4956a]" />
            <p className="old-typewriter text-xs">Loading gallery...</p>
          </div>
        </div>
      )}

      {/* ── Masonry Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((item, i) => {
            const cfg = TYPE_STYLES[item.type];
            // Vary heights for masonry effect
            const heights = ['h-48', 'h-56', 'h-64', 'h-52'];
            const h = heights[i % heights.length];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: (i % 8) * 0.04 }}
                className="break-inside-avoid"
              >
                <div
                  className={`sk-paper overflow-hidden cursor-pointer group relative ${h}`}
                  onClick={() => { soundGalleryOpen(); setLightboxIdx(i); }}
                >
                  {/* Poster image */}
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />

                  {/* Fallback for broken images */}
                  <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-[#ede0c8]">
                    <ImageOff className="h-8 w-8 text-[#a08868] mb-1" />
                    <span className="text-3xl">{cfg.emoji}</span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h3 className="text-white font-bold text-sm leading-tight mb-0.5 line-clamp-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/80" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {item.year}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: cfg.color + 'cc', color: '#fff', fontFamily: "'Nunito', sans-serif" }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Type badge - always visible */}
                  <div className="absolute top-2 right-2 sk-vhs-label text-[8px] font-bold px-1.5 py-0.5 rounded opacity-80">
                    {cfg.emoji}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && items.length > 0 && (
        <div className="sk-paper rounded-xl p-6 sk-noise text-center">
          <p className="text-2xl mb-2">🗐️</p>
          <p className="old-body text-xs text-[#8b7355]">No posters in this category for your era.</p>
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="sk-paper rounded-xl p-6 sk-noise text-center">
          <p className="text-2xl mb-2">🎬</p>
          <p className="old-body text-xs text-[#8b7355]">No gallery items found for your birth year.</p>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxItem && lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxIdx(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 old-typewriter text-sm text-white/60">
              {lightboxIdx + 1} / {filtered.length}
            </div>

            {/* Nav buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image + Info panel */}
            <motion.div
              key={lightboxItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 flex flex-col md:flex-row items-center gap-6 max-w-4xl w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poster */}
              <div className="relative flex-shrink-0 w-64 md:w-72 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={lightboxItem.poster}
                  alt={lightboxItem.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>

              {/* Info card */}
              <div className="flex-1 min-w-0 max-w-sm">
                <div className="sk-paper rounded-xl p-5">
                  <h2
                    className="text-xl font-bold mb-2 leading-tight"
                    style={{ fontFamily: "'Nunito', sans-serif", color: '#3d2b1f' }}
                  >
                    {lightboxItem.title}
                  </h2>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="sk-vhs-label text-[10px] font-bold px-2 py-0.5 rounded">
                      {lightboxItem.year}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: TYPE_STYLES[lightboxItem.type].color + '30',
                        color: TYPE_STYLES[lightboxItem.type].color,
                      }}
                    >
                      {TYPE_STYLES[lightboxItem.type].emoji} {TYPE_STYLES[lightboxItem.type].label}
                    </span>
                    <span className="text-[10px] text-yellow-600 font-bold">
                      ★ {lightboxItem.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {lightboxItem.genres.map((g) => (
                      <span
                        key={g}
                        className="old-label text-[9px] font-bold px-2 py-0.5 rounded bg-[#ede0c8] text-[#5c4033]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Overview */}
                  {lightboxItem.overview && (
                    <p className="old-body text-xs leading-relaxed text-[#6b6b6b]">
                      {lightboxItem.overview}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Filter Chip ── */
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`sk-btn old-btn px-3 py-1.5 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all ${
        active ? 'ring-2 ring-[#8b7355]/30' : ''
      }`}
    >
      {children}
    </button>
  );
}
