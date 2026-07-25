'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { getAllCameraPhotos } from '@/lib/idb-store';
import type { CameraPhotoRecord } from '@/lib/idb-store/types';

/* ═══════════════════════════════════════════════════
   Recent Memories Strip
   Shows the latest 6 photos from IndexedDB in a
   horizontal scrolling polaroid-style strip.
   ═══════════════════════════════════════════════════ */

const FILTER_LABELS: Record<string, string> = {
  'sepia70s': '70s Sepia',
  'faded80s': '80s Faded',
  'warm90s': '90s Warm',
  'bw60s': 'B&W Classic',
  'polaroid': 'Polaroid',
  'vhs': 'VHS',
  'kodak': 'Kodak',
  'gallery-upload': 'Gallery',
  'none': 'Original',
};

export default function RecentMemoriesStrip({ onOpenMemory }: { onOpenMemory: () => void }) {
  const [photos, setPhotos] = useState<{ id: string; url: string; filter: string; created_at: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const urlCacheRef = useRef<string[]>([]);

  const loadPhotos = useCallback(async () => {
    try {
      const records = await getAllCameraPhotos();
      // Revoke old URLs
      urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlCacheRef.current = [];

      const mapped = records.slice(-6).reverse().map((r) => {
        const url = URL.createObjectURL(r.image_blob);
        urlCacheRef.current.push(url);
        return {
          id: r.id,
          url,
          filter: r.filter_used || 'none',
          created_at: r.created_at,
        };
      });
      setPhotos(mapped);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadPhotos();
    return () => { urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, [loadPhotos]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (photos.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest">
            Your Recent Memories
          </h2>
          <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-md sk-btn hover:bg-[#c4956a]/20 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-[#5c4033]" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-md sk-btn hover:bg-[#c4956a]/20 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-[#5c4033]" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling polaroid strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 16, rotate: (Math.random() - 0.5) * 6 }}
            animate={{ opacity: 1, y: 0, rotate: (i % 2 === 0 ? -1.5 : 1.5) }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex-shrink-0 cursor-pointer group"
            style={{ scrollSnapAlign: 'start' }}
            onClick={onOpenMemory}
          >
            {/* Polaroid frame */}
            <div className="sk-polaroid p-2 pb-8 w-36 sm:w-40 relative transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
              {/* Photo */}
              <div className="w-full aspect-square overflow-hidden rounded-sm bg-[#e8dcc8]">
                <img
                  src={photo.url}
                  alt='Memory'
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Date area (polaroid bottom) */}
              <div className="absolute bottom-1.5 left-0 right-0 px-3">
                <p className="old-typewriter text-[8px] text-[#5c4033] truncate text-center">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
              {/* Filter badge */}
              {photo.filter && photo.filter !== 'none' && (
                <span className="absolute top-3 right-3 sk-vhs-label old-typewriter text-[7px] font-bold px-1.5 py-0.5 rounded opacity-80">
                  {FILTER_LABELS[photo.filter] || photo.filter}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* "View all" card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-shrink-0"
          style={{ scrollSnapAlign: 'start' }}
        >
          <button
            onClick={onOpenMemory}
            className="sk-paper w-36 sm:w-40 h-full min-h-[220px] rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-all sk-noise"
          >
            <Camera className="h-8 w-8 text-[#c4956a]" />
            <span className="old-body text-xs text-[#8b7355]">View All</span>
            <span className="old-typewriter text-[9px] text-[#b8a888]">Memories</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
