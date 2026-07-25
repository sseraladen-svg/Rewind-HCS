'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageOff } from 'lucide-react';
import { getAllCameraPhotos } from '@/lib/idb-store';
import type { CameraPhotoRecord } from '@/lib/idb-store/types';

/* ═══════════════════════════════════════════════════
   Photo Timeline
   Shows camera photos arranged chronologically
   on a vertical timeline with date markers.
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

interface TimelinePhoto {
  id: string;
  url: string;
  filter: string;
  created_at: number;
  dateLabel: string;
  timeLabel: string;
}

function groupPhotosByDate(photos: TimelinePhoto[]): { date: string; items: TimelinePhoto[] }[] {
  const groups = new Map<string, TimelinePhoto[]>();
  for (const p of photos) {
    const existing = groups.get(p.dateLabel) || [];
    existing.push(p);
    groups.set(p.dateLabel, existing);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

export default function PhotoTimeline() {
  const [groups, setGroups] = useState<{ date: string; items: TimelinePhoto[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const urlCacheRef = useRef<string[]>([]);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const records = await getAllCameraPhotos();
      urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlCacheRef.current = [];

      const mapped: TimelinePhoto[] = records.map((r) => {
        const url = URL.createObjectURL(r.image_blob);
        urlCacheRef.current.push(url);
        const d = new Date(r.created_at);
        return {
          id: r.id,
          url,
          filter: r.filter_used || 'none',
          created_at: r.created_at,
          dateLabel: d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          timeLabel: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        };
      });

      mapped.sort((a, b) => b.created_at - a.created_at);
      setGroups(groupPhotosByDate(mapped));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
    return () => { urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, [loadPhotos]);

  if (loading) {
    return (
      <div className="sk-paper rounded-xl p-6 sk-noise text-center">
        <div className="flex items-center justify-center gap-2">
          <Camera className="h-5 w-5 text-[#c4956a] animate-pulse" />
          <p className="old-typewriter text-xs text-[#8b7355]">Loading your photo timeline...</p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="sk-paper rounded-xl p-6 sk-noise text-center">
        <ImageOff className="h-8 w-8 text-[#b8a888] mx-auto mb-2" />
        <p className="old-body text-sm text-[#8b7355]">No photos yet.</p>
        <p className="old-typewriter text-xs text-[#b8a888] mt-1">
          Use the camera to capture vintage memories and they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <motion.div
          key={group.date}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: gi * 0.1 }}
        >
          {/* Date marker */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-[#c4956a] shadow-[0_0_8px_rgba(196,149,106,0.4)]" />
            <h3 className="old-title text-sm font-bold text-[#5c4033]">{group.date}</h3>
            <div className="flex-1 h-px bg-[#d4c5a9]/50" />
            <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded">
              {group.items.length} photo{group.items.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Photos grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-6 border-l-2 border-[#d4c5a9]/30">
            {group.items.map((photo, pi) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: pi * 0.05 }}
                className="sk-paper rounded-lg overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden bg-[#e8dcc8]">
                  <img
                    src={photo.url}
                    alt='Memory'
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Time overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="old-typewriter text-[9px] text-white/90">{photo.timeLabel}</p>
                  </div>
                  {/* Filter badge */}
                  {photo.filter && photo.filter !== 'none' && (
                    <span className="absolute top-1.5 right-1.5 sk-vhs-label old-typewriter text-[7px] font-bold px-1.5 py-0.5 rounded">
                      {FILTER_LABELS[photo.filter] || photo.filter}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
