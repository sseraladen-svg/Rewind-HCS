'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, Trash2, Download, Camera, FolderOpen,
  X, ChevronLeft, ChevronRight, ImageIcon, ZoomIn, Share2,
} from 'lucide-react';
import { getAllCameraPhotos, addCameraPhoto, deleteCameraPhoto } from '@/lib/idb-store';
import type { CameraPhotoRecord } from '@/lib/idb-store/types';
import { soundButtonClick, soundGalleryOpen, soundDelete, soundPageTurn } from '@/lib/sounds';

/* ═══════════════════════════════════════════════════
   Memory Tab — Stored camera photos + device gallery uploads
   ═══════════════════════════════════════════════════ */

interface MemoryItem {
  id: string;
  url: string;         // object URL (for display)
  blob: Blob;          // original blob (for download)
  source: 'camera' | 'gallery';
  filter: string;
  timestamp: number;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function MemoryTab({ onOpenCamera, onOpenShareRewind }: { onOpenCamera: () => void; onOpenShareRewind: () => void }) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'filmstrip'>('grid');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlCacheRef = useRef<string[]>([]);

  // ── Load from IDB ──
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const records = await getAllCameraPhotos();
      // Revoke old URLs
      urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlCacheRef.current = [];

      const mapped: MemoryItem[] = records.map((r) => {
        const url = URL.createObjectURL(r.image_blob);
        urlCacheRef.current.push(url);
        return {
          id: r.id,
          url,
          blob: r.image_blob,
          source: 'camera' as const,
          filter: r.filter_used || 'none',
          timestamp: r.created_at,
        };
      });

      // Sort newest first
      mapped.sort((a, b) => b.timestamp - a.timestamp);
      setItems(mapped);
    } catch (err) {
      console.error('[MemoryTab] load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPhotos(); return () => { urlCacheRef.current.forEach((u) => URL.revokeObjectURL(u)); }; }, [loadPhotos]);

  // ── Add from device gallery ──
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const id = generateId();
      const url = URL.createObjectURL(file);
      urlCacheRef.current.push(url);

      // Save to IDB
      await addCameraPhoto({
        id,
        image_blob: file,
        filter_used: 'gallery-upload',
        created_at: file.lastModified || Date.now(),
      });

      setItems((prev) => [{
        id, url, blob: file,
        source: 'gallery',
        filter: 'gallery-upload',
        timestamp: file.lastModified || Date.now(),
      }, ...prev]);
    }

    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  // ── Delete a photo ──
  const handleDelete = useCallback(async (id: string, url: string) => {
    soundDelete();
 setItems((prev) => prev.filter((item) => item.id !== id));
    URL.revokeObjectURL(url);
    urlCacheRef.current = urlCacheRef.current.filter((u) => u !== url);
    await deleteCameraPhoto(id).catch(() => {});
  }, []);

  // ── Download a photo ──
  const handleDownload = useCallback((item: MemoryItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `rewind-memory-${item.id}.png`;
    a.click();
  }, []);

  // ── Lightbox navigation ──
  const lightboxItem = lightboxIdx !== null ? items[lightboxIdx] : null;
  const goNext = () => setLightboxIdx((lightboxIdx! + 1) % items.length);
  const goPrev = () => setLightboxIdx((lightboxIdx! - 1 + items.length) % items.length);

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
    <div className="space-y-5 relative z-10">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full sk-leather mb-4">
          <span className="text-2xl">📸</span>
        </div>
        <h2 className="old-title text-2xl md:text-3xl font-black mb-2 text-[#3d2b1f]">
          ✦ MEMORIES ✦
        </h2>
        <p className="old-body text-sm text-[#8b7355] max-w-md mx-auto">
          Your captured moments, stored right here. Take photos with the camera or add from your device.
        </p>
      </motion.div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => { soundButtonClick(); onOpenCamera(); }}
          className="sk-btn old-btn px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Camera className="h-4 w-4" /> Take Photo
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="sk-btn old-btn px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <FolderOpen className="h-4 w-4" /> Add from Gallery
        </button>

        {/* Share a Rewind (only when 3+ photos exist) */}
        {items.length >= 3 && (
          <button
            onClick={() => { soundButtonClick(); onOpenShareRewind(); }}
            className="old-btn px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer bg-[#8b5e3c] text-[#faf6eb] hover:bg-[#6b4226] transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share a Rewind
          </button>
        )}

        {/* View toggle (only when items exist) */}
        {items.length > 0 && (
          <div className="flex items-center gap-1 sk-paper rounded-lg p-1">
            <button
              onClick={() => { soundPageTurn(); setViewMode('grid'); }}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${viewMode === 'grid' ? 'sk-paper shadow-sm' : 'opacity-60 hover:opacity-100'}`}
              title="Grid view"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { soundPageTurn(); setViewMode('filmstrip'); }}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${viewMode === 'filmstrip' ? 'sk-paper shadow-sm' : 'opacity-60 hover:opacity-100'}`}
              title="Filmstrip view"
            >
              <span className="old-typewriter text-[10px]">🎞️</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Photo count ── */}
      {items.length > 0 && (
        <div className="text-center">
          <span className="sk-vhs-label old-typewriter text-[10px] px-3 py-1 rounded">
            {items.length} MEMOR{items.length !== 1 ? 'IES' : 'Y'} SAVED
          </span>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="sk-paper rounded-xl p-8 sk-noise flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <span className="text-3xl">🎞️</span>
            </motion.div>
            <p className="old-typewriter text-xs">Loading memories...</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="sk-paper rounded-xl p-10 sk-noise text-center sk-tape">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              📷
            </motion.div>
            <h3 className="old-heading text-lg mb-2">No Memories Yet</h3>
            <p className="old-body text-sm text-[#8b7355] mb-5 leading-relaxed">
              Start capturing moments! Use the vintage camera to take retro-style photos,
              or pick images from your device gallery.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => { soundButtonClick(); onOpenCamera(); }}
                className="sk-btn old-btn px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Camera className="h-4 w-4" /> Open Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="sk-btn old-btn px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <ImagePlus className="h-4 w-4" /> Browse Files
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
         GRID VIEW
         ══════════════════════════════════════ */}
      {!loading && items.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <MemoryCard
              key={item.id}
              item={item}
              index={i}
              onView={() => { soundGalleryOpen(); setLightboxIdx(i); }}
              onDelete={() => handleDelete(item.id, item.url)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
         FILMSTRIP VIEW
         ══════════════════════════════════════ */}
      {!loading && items.length > 0 && viewMode === 'filmstrip' && (
        <div className="sk-leather rounded-xl p-4 overflow-x-auto sk-scrollbar">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {/* Sprocket holes top */}
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex-shrink-0 cursor-pointer group"
                onClick={() => { soundGalleryOpen(); setLightboxIdx(i); }}
              >
                {/* Film frame */}
                <div
                  className="relative w-40 h-28 rounded-md overflow-hidden sk-paper"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  {/* Sprocket holes */}
                  <div className="absolute top-1 left-1 w-2.5 h-1.5 rounded-sm bg-black/20" />
                  <div className="absolute top-1 right-1 w-2.5 h-1.5 rounded-sm bg-black/20" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-1.5 rounded-sm bg-black/20" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-1.5 rounded-sm bg-black/20" />

                  <img
                    src={item.url}
                    alt="Memory"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Source badge */}
                  <div className="absolute bottom-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded sk-vhs-label">
                    {item.source === 'camera' ? '📷' : '📁'} {item.filter !== 'gallery-upload' ? item.filter : ''}
                  </div>
                </div>

                {/* Caption below frame */}
                <p className="old-typewriter text-[8px] text-[#8b7355] mt-1.5 text-center">
                  {formatTimestamp(item.timestamp)}
                </p>
              </motion.div>
            ))}
          </div>
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
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

            {/* Close */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 old-typewriter text-sm text-white/60">
              {lightboxIdx + 1} / {items.length}
            </div>

            {/* Nav */}
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

            {/* Image */}
            <motion.div
              key={lightboxItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Polaroid-style frame */}
              <div className="bg-white p-3 pb-14 rounded-sm shadow-2xl mx-auto max-w-lg">
                <img
                  src={lightboxItem.url}
                  alt="Memory"
                  className="w-full h-auto max-h-[65vh] object-contain rounded-sm"
                />
                {/* Caption area */}
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="old-typewriter text-xs text-[#5c4033]">
                    {lightboxItem.source === 'camera' ? '📷 Taken with Camera' : '📁 Added from Gallery'}
                    {lightboxItem.filter !== 'none' && lightboxItem.filter !== 'gallery-upload' && (
                      <span className="ml-2 sk-vhs-label text-[9px] px-1.5 py-0.5 rounded">
                        {lightboxItem.filter}
                      </span>
                    )}
                  </p>
                  <p className="old-label text-[9px] text-[#8b7355] mt-0.5">
                    {formatTimestamp(lightboxItem.timestamp)}
                  </p>
                </div>
              </div>

              {/* Action buttons below polaroid */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => { soundButtonClick(); handleDownload(lightboxItem); }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Save
                </button>
                <button
                  onClick={() => {
                    handleDelete(lightboxItem.id, lightboxItem.url);
                    if (items.length <= 1) setLightboxIdx(null);
                    else if (lightboxIdx >= items.length - 1) setLightboxIdx(lightboxIdx - 1);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ MEMORY CARD (Grid View) ═══════ */
function MemoryCard({
  item, index, onView, onDelete, onDownload,
}: {
  item: MemoryItem;
  index: number;
  onView: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index % 8) * 0.04 }}
    >
      <div className="sk-polaroid group cursor-pointer" onClick={onView}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-sm bg-[#ede0c8]">
          <img
            src={item.url}
            alt="Memory"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover overlay with quick actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => { e.stopPropagation(); soundButtonClick(); onDownload(); }}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
              title="Download"
            >
              <Download className="h-3.5 w-3.5 text-[#3d2b1f]" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </motion.button>
          </div>

          {/* Source badge */}
          <div className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded sk-vhs-label">
            {item.source === 'camera' ? '📷' : '📁'}
          </div>
        </div>

        {/* Caption */}
        <div className="pt-1.5 text-center">
          <p className="old-typewriter text-[9px] text-[#5c4033] leading-tight">
            {item.source === 'camera' ? 'Camera' : 'Gallery'}
            {item.filter !== 'none' && item.filter !== 'gallery-upload' && (
              <span className="ml-1 opacity-60">· {item.filter}</span>
            )}
          </p>
          <p className="old-label text-[8px] text-[#8b7355] mt-0.5">
            {formatTimestamp(item.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
