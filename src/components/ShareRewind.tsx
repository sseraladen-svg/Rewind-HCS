'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  Check,
  Download,
  Share2,
  Camera,
  Loader2,
  Film,
  Tv,
  Frame,
  ImageOff,
} from 'lucide-react';
import { getAllCameraPhotos } from '@/lib/idb-store';
import type { CameraPhotoRecord } from '@/lib/idb-store/types';
import { processFrame, PIPELINE_PRESETS } from '@/lib/image-pipeline';
import { soundButtonClick, soundSave, soundGalleryOpen } from '@/lib/sounds';

/* ═══════ TYPES ═══════ */

export interface ShareRewindProps {
  open: boolean;
  onClose: () => void;
}

type CollageStyle = 'vhs' | 'polaroid' | 'filmstrip';
type Step = 'select' | 'style' | 'preview';

interface PhotoItem {
  id: string;
  url: string;
  blob: Blob;
  filter_used: string;
  created_at: number;
  naturalWidth: number;
  naturalHeight: number;
}

/* ═══════ STYLE DEFINITIONS ═══════ */

const STYLES: {
  key: CollageStyle;
  label: string;
  emoji: string;
  icon: typeof Tv;
  presetKey: string;
  description: string;
}[] = [
  {
    key: 'vhs',
    label: 'VHS Static',
    emoji: '📼',
    icon: Tv,
    presetKey: 'vhs',
    description: 'Tracking lines, chromatic shift & CRT glow',
  },
  {
    key: 'polaroid',
    label: 'Polaroid Stack',
    emoji: '📸',
    icon: Frame,
    presetKey: 'polaroid',
    description: 'Soft vintage tones, white frame & shadow',
  },
  {
    key: 'filmstrip',
    label: 'Film Strip',
    emoji: '🎞️',
    icon: Film,
    presetKey: 'kodak',
    description: 'Classic 35mm film layout with sprocket holes',
  },
];

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;

/* ═══════ ANIMATION VARIANTS ═══════ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const panelVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
  exit: { y: 40, opacity: 0 },
};

const stepContentVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

/* ═══════ HELPERS ═══════ */

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Draw a rounded rectangle path (no fill/stroke) */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Draw VHS scanlines on a canvas */
function drawScanlines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opacity = 0.08,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.restore();
}

/** Draw VHS tracking glitch bands */
function drawTrackingGlitch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save();
  const glitchBands = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < glitchBands; i++) {
    const bandY = Math.random() * h;
    const bandH = 2 + Math.random() * 8;
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#888';
    ctx.fillRect(0, bandY, w, bandH);
  }
  ctx.restore();
}

/** Draw timestamp like a VHS recording */
function drawVHSTimestamp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.font = '16px monospace';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 4;
  ctx.globalAlpha = 0.85;
  const date = new Date();
  const stamp = `${date.toLocaleDateString('en-US').replace(/\//g, '.')} ${date.toLocaleTimeString('en-US', { hour12: false })}`;
  ctx.textAlign = 'right';
  ctx.fillText(stamp, w - 20, h - 20);
  // REC dot
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(w - ctx.measureText(stamp).width - 36, h - 27, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw film sprocket holes along one edge */
function drawSprocketHoles(
  ctx: CanvasRenderingContext2D,
  x: number,
  yStart: number,
  yEnd: number,
  holeWidth: number,
  holeHeight: number,
  gap: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = yStart + gap; y < yEnd - gap; y += gap) {
    roundRectPath(ctx, x, y, holeWidth, holeHeight, 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draw REWIND branding watermark */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('⏪ REWIND', 16, h - 16);
  ctx.restore();
}

/* ═══════ COLLAGE RENDERERS ═══════ */

/**
 * Render a VHS-style collage to a canvas.
 * Photos are arranged in a grid, processed with the VHS filter,
 * overlaid with scanlines, glitch bands, timestamp, and CRT vignette.
 */
async function renderVHSCollage(
  canvas: HTMLCanvasElement,
  photos: PhotoItem[],
): Promise<HTMLCanvasElement> {
  const cols = photos.length <= 4 ? 2 : 3;
  const rows = Math.ceil(photos.length / cols);
  const cellW = 400;
  const cellH = 300;
  const padding = 12;
  const headerH = 60;

  canvas.width = cols * cellW + (cols + 1) * padding;
  canvas.height = rows * cellH + (rows + 1) * padding + headerH;
  const ctx = canvas.getContext('2d')!;

  // Dark CRT background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(28, headerH / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('⏪ REWIND', 44, headerH / 2 + 8);
  ctx.font = '14px monospace';
  ctx.globalAlpha = 0.5;
  ctx.textAlign = 'right';
  ctx.fillText(`PLAY ▶  ${photos.length} MEMORIES`, canvas.width - 20, headerH / 2 + 6);
  ctx.restore();

  // Draw each photo
  for (let i = 0; i < photos.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + padding);
    const y = headerH + padding + row * (cellH + padding);

    // Create temp canvas for processing
    const tmp = document.createElement('canvas');
    tmp.width = cellW;
    tmp.height = cellH;
    const tmpCtx = tmp.getContext('2d')!;

    // Load and draw image
    const img = await loadImage(photos[i].url);
    const scale = Math.max(cellW / img.width, cellH / img.height);
    const sw = cellW / scale;
    const sh = cellH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    tmpCtx.drawImage(img, sx, sy, sw, sh, 0, 0, cellW, cellH);

    // Apply VHS pipeline
    processFrame(tmpCtx, cellW, cellH, 'vhs');

    // Draw to main canvas
    ctx.drawImage(tmp, x, y, cellW, cellH);

    // Slight glow/border
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellW, cellH);
    ctx.restore();
  }

  // Overlays on top
  drawScanlines(ctx, canvas.width, canvas.height, 0.06);
  drawTrackingGlitch(ctx, canvas.width, canvas.height);
  drawVHSTimestamp(ctx, canvas.width, canvas.height);

  // CRT vignette
  ctx.save();
  const vg = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.65,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  drawWatermark(ctx, canvas.width, canvas.height);

  return canvas;
}

/**
 * Render a Polaroid-style collage.
 * Photos are shown as Polaroids with white borders, slightly
 * rotated and stacked with drop shadows.
 */
async function renderPolaroidCollage(
  canvas: HTMLCanvasElement,
  photos: PhotoItem[],
): Promise<HTMLCanvasElement> {
  const polaroidW = 320;
  const polaroidH = 380;
  const photoInsetTop = 28;
  const photoInsetSide = 24;
  const photoW = polaroidW - photoInsetSide * 2;
  const photoH = polaroidH - photoInsetTop - 70;
  const bottomLabelH = 50;

  canvas.width = photos.length <= 3
    ? photos.length * polaroidW + (photos.length + 1) * 30
    : Math.ceil(photos.length / 2) * (polaroidW + 30) + 30;
  canvas.height = photos.length <= 3
    ? polaroidH + 100
    : 2 * (polaroidH + 30) + 30;
  const ctx = canvas.getContext('2d')!;

  // Warm paper background
  ctx.fillStyle = '#f5edd6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper texture
  ctx.save();
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#8b7355';
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      1, 1,
    );
  }
  ctx.restore();

  const rotations = [-3, 2, -1.5, 2.5, -2, 1.5];
  const cols = photos.length <= 3 ? photos.length : Math.ceil(photos.length / 2);

  for (let i = 0; i < photos.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = 30 + col * (polaroidW + 30) + polaroidW / 2;
    const cy = 30 + row * (polaroidH + 30) + polaroidH / 2;
    const rotation = (rotations[i % rotations.length] * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-polaroidW / 2, -polaroidH / 2, polaroidW, polaroidH);
    ctx.restore();

    // White border
    ctx.fillStyle = '#faf6eb';
    ctx.fillRect(-polaroidW / 2, -polaroidH / 2, polaroidW, polaroidH);

    // Draw photo
    const tmp = document.createElement('canvas');
    tmp.width = photoW;
    tmp.height = photoH;
    const tmpCtx = tmp.getContext('2d')!;

    const img = await loadImage(photos[i].url);
    const scale = Math.max(photoW / img.width, photoH / img.height);
    const sw = photoW / scale;
    const sh = photoH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    tmpCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoW, photoH);

    // Apply polaroid filter
    processFrame(tmpCtx, photoW, photoH, 'polaroid');

    ctx.drawImage(tmp, -polaroidW / 2 + photoInsetSide, -polaroidH / 2 + photoInsetTop, photoW, photoH);

    // Subtle date label at bottom
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.font = '12px "Special Elite", monospace';
    ctx.fillStyle = '#8b7355';
    ctx.textAlign = 'center';
    const dateStr = new Date(photos[i].created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    ctx.fillText(dateStr, 0, polaroidH / 2 - 18);
    ctx.restore();

    ctx.restore();
  }

  drawWatermark(ctx, canvas.width, canvas.height);
  return canvas;
}

/**
 * Render a film strip collage.
 * Photos are laid out vertically in a 35mm film strip
 * with sprocket holes on both sides.
 */
async function renderFilmStripCollage(
  canvas: HTMLCanvasElement,
  photos: PhotoItem[],
): Promise<HTMLCanvasElement> {
  const stripW = 520;
  const filmBorder = 36;
  const sprocketH = 18;
  const sprocketGap = 32;
  const photoH = 360;
  const photoW = stripW - filmBorder * 2;
  const frameGap = 10;

  canvas.width = stripW;
  canvas.height =
    filmBorder + photos.length * (photoH + frameGap) + filmBorder;
  const ctx = canvas.getContext('2d')!;

  // Film base — dark brown/black
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(0, 0, stripW, canvas.height);

  // Slight film grain texture
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(
      Math.random() * stripW,
      Math.random() * canvas.height,
      1, 1,
    );
  }
  ctx.restore();

  // Sprocket holes — left side
  drawSprocketHoles(
    ctx,
    8,
    filmBorder,
    canvas.height - filmBorder,
    20,
    sprocketH,
    sprocketGap,
    '#2a2018',
  );

  // Sprocket holes — right side
  drawSprocketHoles(
    ctx,
    stripW - 28,
    filmBorder,
    canvas.height - filmBorder,
    20,
    sprocketH,
    sprocketGap,
    '#2a2018',
  );

  // Draw each photo frame
  for (let i = 0; i < photos.length; i++) {
    const y = filmBorder + i * (photoH + frameGap);

    // Frame number
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#d4a574';
    ctx.textAlign = 'right';
    ctx.fillText(`${String(i + 1).padStart(2, '0')}A`, stripW - 6, y + photoH - 4);
    ctx.restore();

    // Photo
    const tmp = document.createElement('canvas');
    tmp.width = photoW;
    tmp.height = photoH;
    const tmpCtx = tmp.getContext('2d')!;

    const img = await loadImage(photos[i].url);
    const scale = Math.max(photoW / img.width, photoH / img.height);
    const sw = photoW / scale;
    const sh = photoH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    tmpCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoW, photoH);

    // Apply kodak filter
    processFrame(tmpCtx, photoW, photoH, 'kodak');

    ctx.drawImage(tmp, filmBorder, y, photoW, photoH);

    // Frame divider line
    if (i < photos.length - 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(200,180,140,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(filmBorder, y + photoH + frameGap / 2);
      ctx.lineTo(stripW - filmBorder, y + photoH + frameGap / 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawWatermark(ctx, stripW, canvas.height);
  return canvas;
}

/* ═══════ PREVIEW STYLING (CSS) ═══════ */

const STYLE_CSS_CLASS: Record<CollageStyle, string> = {
  vhs: 'sepia(0.15) contrast(1.2) brightness(0.88) saturate(0.85)',
  polaroid: 'sepia(0.2) contrast(0.95) brightness(1.12) saturate(1.35)',
  filmstrip: 'sepia(0.1) contrast(1.08) brightness(1.05) saturate(1.5)',
};

/* ═══════ SHARE REWIND COMPONENT ═══════ */

export default function ShareRewind({ open, onClose }: ShareRewindProps) {
  /* ── state ── */
  const [step, setStep] = useState<Step>('select');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [style, setStyle] = useState<CollageStyle>('vhs');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [dir, setDir] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  /* ── Load photos from IDB ── */
  useEffect(() => {
    if (!open) return;
    soundGalleryOpen();

    let cancelled = false;

    (async () => {
      setLoading(true);
      setSelectedIds(new Set());
      setPreviewUrl(null);
      setStep('select');

      try {
        const records = await getAllCameraPhotos();
        if (cancelled) return;

        const items: PhotoItem[] = [];
        const urls: string[] = [];

        for (const rec of records) {
          const url = URL.createObjectURL(rec.image_blob);
          urls.push(url);
          // Get natural dimensions
          const img = await loadImage(url);
          if (cancelled) {
            urls.forEach(u => URL.revokeObjectURL(u));
            return;
          }
          items.push({
            id: rec.id,
            url,
            blob: rec.image_blob,
            filter_used: rec.filter_used,
            created_at: rec.created_at,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }

        // Cleanup previous URLs
        objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
        objectUrlsRef.current = urls;
        setPhotos(items);
      } catch (err) {
        console.error('Failed to load camera photos:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  /* ── Check Web Share API ── */
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare);
  }, []);

  /* ── Cleanup URLs on unmount ── */
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  /* ── Step navigation ── */
  const goNext = useCallback(() => {
    if (step === 'select') {
      setDir(1);
      setStep('style');
    } else if (step === 'style') {
      setDir(1);
      setStep('preview');
      // Render the collage
      renderCollage();
    }
  }, [step, selectedIds, style, photos]);

  const goBack = useCallback(() => {
    setDir(-1);
    if (step === 'preview') {
      setStep('style');
      setPreviewUrl(null);
    } else if (step === 'style') {
      setStep('select');
    } else {
      onClose();
    }
  }, [step, onClose]);

  /* ── Toggle photo selection ── */
  const togglePhoto = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size < MAX_PHOTOS) {
          next.add(id);
        }
        return next;
      });
    },
    [],
  );

  /* ── Render collage to canvas ── */
  const renderCollage = useCallback(async () => {
    const selected = photos.filter(p => selectedIds.has(p.id));
    if (selected.length < MIN_PHOTOS || !canvasRef.current) return;

    setRendering(true);
    try {
      const canvas = canvasRef.current;
      switch (style) {
        case 'vhs':
          await renderVHSCollage(canvas, selected);
          break;
        case 'polaroid':
          await renderPolaroidCollage(canvas, selected);
          break;
        case 'filmstrip':
          await renderFilmStripCollage(canvas, selected);
          break;
      }

      // Convert canvas to blob URL for preview
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Collage render error:', err);
    } finally {
      setRendering(false);
    }
  }, [photos, selectedIds, style, previewUrl]);

  /* ── Download ── */
  const handleDownload = useCallback(() => {
    soundSave();
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `rewind-collage-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  /* ── Share ── */
  const handleShare = useCallback(async () => {
    soundSave();
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob(
          b => (b ? resolve(b) : reject(new Error('Blob failed'))),
          'image/png',
        );
      });
      const file = new File([blob], `rewind-collage-${Date.now()}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Rewind Collage ⏪',
          text: 'Check out this nostalgia collage from Rewind!',
          files: [file],
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, []);

  /* ── Derived state ── */
  const selectedPhotos = photos.filter(p => selectedIds.has(p.id));
  const isNextDisabled =
    step === 'select'
      ? selectedIds.size < MIN_PHOTOS
      : false;

  /* ── Render ── */
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden sk-leather"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── HEADER ── */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {step !== 'select' && (
                  <button
                    onClick={goBack}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5 text-white/80" />
                  </button>
                )}
                <div>
                  <h1 className="old-title text-white text-lg leading-tight">
                    ⏪ Share a Rewind
                  </h1>
                  <p className="text-white/50 text-xs old-body mt-0.5">
                    {step === 'select' && 'Pick your favorite memories'}
                    {step === 'style' && 'Choose a retro style'}
                    {step === 'preview' && 'Preview & share your collage'}
                  </p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {(['select', 'style', 'preview'] as const).map((s, i) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step === s
                        ? 'bg-white scale-125'
                        : ['select', 'style', 'preview'].indexOf(step) > i
                          ? 'bg-white/50'
                          : 'bg-white/20'
                    }`}
                  />
                ))}
                <button
                  onClick={onClose}
                  className="ml-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>
            </header>

            {/* ── CONTENT ── */}
            <main className="flex-1 overflow-y-auto sk-noise">
              <AnimatePresence mode="wait" custom={dir}>
                {/* ── STEP 1: PHOTO SELECTION ── */}
                {step === 'select' && (
                  <motion.div
                    key="select"
                    custom={dir}
                    variants={stepContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="h-full"
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                        <p className="text-white/50 old-body">Loading your memories...</p>
                      </div>
                    ) : photos.length === 0 ? (
                      /* ── Empty state ── */
                      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                          <ImageOff className="w-10 h-10 text-white/40" />
                        </div>
                        <div>
                          <h2 className="old-title text-white text-xl">
                            No Memories Yet
                          </h2>
                          <p className="old-body text-white/60 mt-2 max-w-xs">
                            Take some photos with the vintage camera first, then come back to create your collage!
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="old-btn px-6 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors mt-2"
                        >
                          📸 Open Camera
                        </button>
                      </div>
                    ) : (
                      <div className="p-4">
                        {/* Selection counter */}
                        <div className="flex items-center justify-between mb-4">
                          <p className="old-body text-white/70 text-sm">
                            Select {MIN_PHOTOS}–{MAX_PHOTOS} photos
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`old-title text-lg ${
                                selectedIds.size >= MIN_PHOTOS ? 'text-white' : 'text-white/40'
                              }`}
                            >
                              {selectedIds.size}
                            </span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/40 old-body text-sm">{MAX_PHOTOS}</span>
                          </div>
                        </div>

                        {/* Photo grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-[calc(100vh-220px)] overflow-y-auto pb-4">
                          {photos.map((photo) => {
                            const isSelected = selectedIds.has(photo.id);
                            return (
                              <motion.button
                                key={photo.id}
                                onClick={() => togglePhoto(photo.id)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.3)] scale-[0.97]'
                                    : 'border-white/20 hover:border-white/40'
                                } ${selectedIds.size >= MAX_PHOTOS && !isSelected ? 'opacity-40 pointer-events-none' : ''}`}
                                whileTap={{ scale: 0.93 }}
                              >
                                {/* Photo */}
                                <img
                                  src={photo.url}
                                  alt={`Memory ${photo.id}`}
                                  className="w-full h-full object-cover"
                                  style={{ filter: STYLE_CSS_CLASS.vhs }}
                                  loading="lazy"
                                />

                                {/* Check overlay */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="absolute inset-0 bg-white/20 flex items-center justify-center"
                                    >
                                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                                        <Check className="w-4 h-4 text-foreground" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Order number */}
                                {isSelected && (
                                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-foreground/80 text-background text-[10px] font-bold flex items-center justify-center old-title">
                                    {Array.from(selectedIds).indexOf(photo.id) + 1}
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2: STYLE PICKER ── */}
                {step === 'style' && (
                  <motion.div
                    key="style"
                    custom={dir}
                    variants={stepContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="h-full flex flex-col items-center justify-center p-6 gap-6"
                  >
                    <p className="old-body text-white/70 text-center max-w-md">
                      Choose a retro style for your {selectedIds.size} memories
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                      {STYLES.map((s) => {
                        const Icon = s.icon;
                        const isActive = style === s.key;
                        return (
                          <motion.button
                            key={s.key}
                            onClick={() => { soundButtonClick(); setStyle(s.key); }}
                            className={`relative sk-paper rounded-xl p-5 text-left transition-all duration-200 ${
                              isActive
                                ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : 'hover:shadow-md'
                            }`}
                            whileTap={{ scale: 0.97 }}
                          >
                            {/* Selected badge */}
                            {isActive && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isActive ? 'bg-foreground/15' : 'bg-foreground/8'
                                }`}
                              >
                                <Icon
                                  className={`w-5 h-5 ${
                                    isActive ? 'text-foreground' : 'text-foreground/60'
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="old-title text-foreground text-sm">
                                  {s.emoji} {s.label}
                                </p>
                                <p className="old-body text-foreground/60 text-xs mt-0.5 leading-tight">
                                  {s.description}
                                </p>
                              </div>
                            </div>

                            {/* Mini preview thumbnails */}
                            <div className="flex gap-1 mt-3">
                              {selectedPhotos.slice(0, 3).map((p, idx) => (
                                <div
                                  key={p.id}
                                  className="w-12 h-12 rounded overflow-hidden border border-foreground/15"
                                  style={{
                                    filter: STYLE_CSS_CLASS[s.key],
                                  }}
                                >
                                  <img
                                    src={p.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {selectedPhotos.length > 3 && (
                                <div className="w-12 h-12 rounded bg-foreground/8 border border-foreground/15 flex items-center justify-center">
                                  <span className="text-foreground/50 text-xs old-title">
                                    +{selectedPhotos.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: PREVIEW ── */}
                {step === 'preview' && (
                  <motion.div
                    key="preview"
                    custom={dir}
                    variants={stepContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="h-full flex flex-col items-center p-4"
                  >
                    {rendering ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
                        <p className="old-body text-white/60 text-sm">
                          Processing your collage...
                        </p>
                        <p className="text-white/40 text-xs">
                          Applying {STYLES.find(s => s.key === style)?.label} effects
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full max-w-3xl">
                        {/* Canvas preview */}
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-[60vh]">
                          {previewUrl && (
                            <img
                              src={previewUrl}
                              alt="Rewind collage preview"
                              className="max-w-full max-h-[60vh] object-contain"
                            />
                          )}
                        </div>

                        {/* Style label */}
                        <div className="flex items-center gap-2 text-white/60">
                          <span className="text-lg">{STYLES.find(s => s.key === style)?.emoji}</span>
                          <span className="old-body text-sm">
                            {STYLES.find(s => s.key === style)?.label} · {selectedPhotos.length} memories
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* ── FOOTER ── */}
            {step !== 'select' && step !== 'preview' && (
              <footer className="px-4 py-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <button
                    onClick={goNext}
                    className="old-btn px-8 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all duration-200 text-sm"
                  >
                    Continue →
                  </button>
                </div>
              </footer>
            )}

            {step === 'select' && photos.length > 0 && (
              <footer className="px-4 py-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs old-body">
                    {selectedIds.size < MIN_PHOTOS
                      ? `${MIN_PHOTOS - selectedIds.size} more needed`
                      : `${selectedIds.size} selected — ready!`}
                  </p>
                  <button
                    onClick={goNext}
                    disabled={isNextDisabled}
                    className={`old-btn px-8 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      isNextDisabled
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    Pick Style →
                  </button>
                </div>
              </footer>
            )}

            {step === 'preview' && !rendering && previewUrl && (
              <footer className="px-4 py-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="old-btn flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all duration-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>

                  {canShare && (
                    <button
                      onClick={handleShare}
                      className="old-btn flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground/80 hover:bg-foreground text-background transition-all duration-200 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                </div>
              </footer>
            )}

            {/* Hidden canvas for rendering */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
