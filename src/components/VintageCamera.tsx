'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Video, X, Download, Trash2, Image as ImageIcon,
  RotateCcw, SwitchCamera, Zap, Circle, Square,
} from 'lucide-react';

/* ═══════ TYPES ═══════ */
interface CapturedItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: number;
  blob?: Blob;
}

type FilterPreset = 'none' | 'sepia70s' | 'faded80s' | 'warm90s' | 'bw60s' | 'polaroid' | 'vhs' | 'kodak';

const FILTERS: Record<FilterPreset, { label: string; emoji: string; css: string }> = {
  none: { label: 'Raw', emoji: '📷', css: 'none' },
  sepia70s: { label: "70's Sepia", emoji: '🟤', css: 'sepia(0.5) contrast(1.15) brightness(0.95) saturate(1.1)' },
  faded80s: { label: "80's Fade", emoji: '🟡', css: 'sepia(0.25) contrast(0.9) brightness(1.08) saturate(0.75) hue-rotate(-8deg)' },
  warm90s: { label: "90's Warm", emoji: '🟠', css: 'sepia(0.35) contrast(1.1) brightness(1.02) saturate(1.25) hue-rotate(-5deg)' },
  bw60s: { label: "60's B&W", emoji: '⬛', css: 'grayscale(1) contrast(1.25) brightness(0.9)' },
  polaroid: { label: 'Polaroid', emoji: '📸', css: 'sepia(0.2) contrast(0.95) brightness(1.12) saturate(1.35) hue-rotate(-3deg)' },
  vhs: { label: 'VHS', emoji: '📼', css: 'sepia(0.15) contrast(1.2) brightness(0.88) saturate(0.85) hue-rotate(-15deg)' },
  kodak: { label: 'Kodak', emoji: '🎞️', css: 'sepia(0.1) contrast(1.08) brightness(1.05) saturate(1.5) hue-rotate(5deg)' },
};

/* ═══════ VINTAGE CAMERA COMPONENT ═══════ */
export default function VintageCamera({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const flashRef = useRef<HTMLDivElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [filter, setFilter] = useState<FilterPreset>('sepia70s');
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [flash, setFlash] = useState(false);
  const [gallery, setGallery] = useState<CapturedItem[]>([]);
  const [viewItem, setViewItem] = useState<CapturedItem | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [shutterAnim, setShutterAnim] = useState(false);

  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Start Camera ── */
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied or not available. Please allow camera permissions.');
    }
  }, [facingMode, mode]);

  /* ── Stop Camera ── */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }, []);

  /* ── Switch Camera ── */
  const handleSwitchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  /* ── Restart on facing/mode change ── */
  useEffect(() => {
    if (cameraOpen) {
      startCamera();
    }
    return () => {
      // cleanup on unmount
    };
  }, [facingMode, mode, cameraOpen, startCamera]);

  /* ── Apply vintage canvas filters ── */
  const applyVintageFilter = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, preset: FilterPreset) => {
    if (preset === 'none') return;

    // Get image data
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Per-pixel vintage processing
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      switch (preset) {
        case 'sepia70s': {
          // Heavy warm sepia + slightly desaturate
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray * 1.15 + 35;
          g = gray * 1.0 + 15;
          b = gray * 0.85;
          // Reduce contrast slightly
          r = 128 + (r - 128) * 0.92;
          g = 128 + (g - 128) * 0.92;
          b = 128 + (b - 128) * 0.92;
          break;
        }
        case 'faded80s': {
          // Washed out, lifted blacks, warm shift
          r = r * 0.88 + 45;
          g = g * 0.85 + 40;
          b = b * 0.8 + 50;
          // Lift shadows (add to dark areas)
          const lum = (r + g + b) / 3;
          if (lum < 100) {
            const lift = (100 - lum) * 0.3;
            r += lift;
            g += lift;
            b += lift + 10;
          }
          break;
        }
        case 'warm90s': {
          // Warm golden tones, slightly saturated
          r = r * 1.08 + 12;
          g = g * 0.98 + 8;
          b = b * 0.88;
          // Warm color cast
          r = Math.min(255, r + 15);
          b = Math.max(0, b - 10);
          break;
        }
        case 'bw60s': {
          // Classic high-contrast B&W with slight grain look
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const contrast = 1.25;
          const newGray = 128 + (gray - 128) * contrast;
          r = g = b = newGray;
          // Add subtle random grain
          const grain = (Math.random() - 0.5) * 12;
          r += grain; g += grain; b += grain;
          break;
        }
        case 'polaroid': {
          // Soft, bright, slightly oversaturated with cool shadows
          r = r * 1.05 + 10;
          g = g * 1.08 + 8;
          b = b * 0.95 + 15;
          // Slight green cast in shadows
          const lum = (r + g + b) / 3;
          if (lum < 120) {
            g = Math.min(255, g + 8);
            b = Math.max(0, b - 5);
          }
          break;
        }
        case 'vhs': {
          // Desaturated, slight color shift, low contrast
          r = r * 0.85 + 30;
          g = g * 0.82 + 28;
          b = b * 0.88 + 25;
          // Slight purple/magenta shift
          r = Math.min(255, r + 8);
          b = Math.min(255, b + 5);
          // Lower contrast
          r = 128 + (r - 128) * 0.85;
          g = 128 + (g - 128) * 0.85;
          b = 128 + (b - 128) * 0.85;
          break;
        }
        case 'kodak': {
          // Vibrant, warm, rich
          r = r * 1.1 + 5;
          g = g * 1.05 + 5;
          b = b * 0.92;
          // Slight warm lift
          const lum2 = (r + g + b) / 3;
          if (lum2 > 150) {
            r = Math.min(255, r * 1.05);
            g = Math.min(255, g * 0.98);
          }
          break;
        }
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);

    // Add vignette overlay
    addVignette(ctx, w, h, preset);

    // Add film grain overlay
    if (preset === 'bw60s' || preset === 'vhs' || preset === 'sepia70s') {
      addGrain(ctx, w, h, preset === 'bw60s' ? 25 : 15);
    }

    // Add date stamp for some presets
    if (preset === 'polaroid' || preset === 'sepia70s') {
      addDateStamp(ctx, w, h);
    }
  }, []);

  /* ── Vignette ── */
  const addVignette = (ctx: CanvasRenderingContext2D, w: number, h: number, preset: FilterPreset) => {
    const intensity = preset === 'bw60s' ? 0.6 : preset === 'vhs' ? 0.5 : 0.35;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  /* ── Film Grain ── */
  const addGrain = (ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) => {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  /* ── Date Stamp (like old film photos) ── */
  const addDateStamp = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    ctx.save();
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255, 80, 80, 0.75)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 1;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, w - 12, h - 12);
    ctx.restore();
  };

  /* ── Capture Photo ── */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply vintage filter
    applyVintageFilter(ctx, canvas.width, canvas.height, filter);

    // Flash effect
    setFlash(true);
    setShutterAnim(true);
    setTimeout(() => setFlash(false), 200);
    setTimeout(() => setShutterAnim(false), 300);

    // Save to gallery
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setGallery(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'photo',
        url,
        timestamp: Date.now(),
        blob,
      }, ...prev]);
    }, 'image/jpeg', 0.92);
  }, [filter, facingMode, applyVintageFilter]);

  /* ── Start/Stop Video Recording ── */
  const toggleRecording = useCallback(() => {
    if (!recording && streamRef.current) {
      // Start recording
      const options = { mimeType: 'video/webm;codecs=vp9' };
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current, options);
        recordedChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setGallery(prev => [{
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: 'video',
            url,
            timestamp: Date.now(),
            blob,
          }, ...prev]);
          recordedChunksRef.current = [];
        };
        mediaRecorder.start(100);
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
        setRecordTime(0);
        recordTimerRef.current = setInterval(() => {
          setRecordTime(prev => prev + 1);
        }, 1000);
      } catch {
        // Fallback: try vp8
        try {
          const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp8' });
          recordedChunksRef.current = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setGallery(prev => [{
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type: 'video',
              url,
              timestamp: Date.now(),
              blob,
            }, ...prev]);
            recordedChunksRef.current = [];
          };
          mediaRecorder.start(100);
          mediaRecorderRef.current = mediaRecorder;
          setRecording(true);
          setRecordTime(0);
          recordTimerRef.current = setInterval(() => {
            setRecordTime(prev => prev + 1);
          }, 1000);
        } catch {
          setCameraError('Video recording not supported in this browser.');
        }
      }
    } else if (recording && mediaRecorderRef.current) {
      // Stop recording
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  }, [recording]);

  /* ── Delete from gallery ── */
  const deleteItem = useCallback((id: string) => {
    setGallery(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  /* ── Download ── */
  const downloadItem = useCallback((item: CapturedItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `rewind_${item.type}_${new Date(item.timestamp).toISOString().replace(/[:.]/g, '-')}.${item.type === 'photo' ? 'jpg' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  /* ── Cleanup on close ── */
  useEffect(() => {
    return () => {
      stopCamera();
      gallery.forEach(item => URL.revokeObjectURL(item.url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Format time ── */
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: '#1a1208' }}
        >
          {/* ═══ HEADER - Camera Top Bar ═══ */}
          <div className="sk-leather px-3 py-2.5 flex items-center justify-between z-10">
            <button onClick={() => { stopCamera(); onClose(); }} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 text-[#faf6eb]">
              <X className="h-4 w-4" /> Close
            </button>
            <h2 className="old-title font-black text-base text-[#faf6eb] tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              📷 Vintage Camera
            </h2>
            <div className="w-16" />
          </div>

          {/* ═══ VIEWFINDER ═══ */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {!cameraOpen && !cameraError && (
              <div className="text-center px-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl mb-4"
                >📸</motion.div>
                <p className="old-body text-[#d4a574] mb-6 text-sm">Open the camera to capture memories in vintage style</p>
                <button onClick={startCamera} className="sk-btn old-btn px-6 py-3 rounded-xl font-bold text-base cursor-pointer flex items-center gap-2 mx-auto">
                  <Camera className="h-5 w-5" /> Open Camera
                </button>
              </div>
            )}

            {cameraError && (
              <div className="text-center px-6">
                <div className="text-5xl mb-4">😵</div>
                <p className="old-body text-[#d4a574] mb-4 text-sm">{cameraError}</p>
                <button onClick={startCamera} className="sk-btn old-btn px-5 py-2.5 rounded-lg font-bold cursor-pointer flex items-center gap-2 mx-auto">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </button>
              </div>
            )}

            {cameraOpen && (
              <>
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                  style={{ filter: FILTERS[filter].css }}
                  playsInline
                  muted
                />

                {/* Vignette overlay on viewfinder */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                }} />

                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                }} />

                {/* Film border overlay - viewfinder frame */}
                <div className="absolute inset-0 pointer-events-none border-[6px] border-[#1a1208] rounded-none" />

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#d4a574]/50 pointer-events-none" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#d4a574]/50 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#d4a574]/50 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#d4a574]/50 pointer-events-none" />

                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-px h-6 bg-[#d4a574]/30" />
                  <div className="h-px w-6 bg-[#d4a574]/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Recording indicator */}
                {recording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sk-vhs-label px-3 py-1 rounded-full z-10"
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-red-500"
                    />
                    <span className="old-typewriter text-xs font-bold text-red-600">REC {formatTime(recordTime)}</span>
                  </motion.div>
                )}

                {/* Filter label */}
                <div className="absolute top-4 right-4 sk-vhs-label px-2 py-1 rounded z-10">
                  <span className="old-typewriter text-[10px] font-bold text-[#5c4033]">
                    {FILTERS[filter].emoji} {FILTERS[filter].label}
                  </span>
                </div>

                {/* Flash effect */}
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-white z-20 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Shutter animation */}
                <AnimatePresence>
                  {shutterAnim && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 1, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-x-0 top-0 bottom-0 bg-black z-20 origin-top pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* ═══ FILTER STRIP ═══ */}
          {cameraOpen && (
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden sk-paper-aged"
                >
                  <div className="px-3 py-3">
                    <p className="old-label text-[10px] text-[#8b7355] mb-2">CHOOSE FILM TYPE</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 sk-scrollbar">
                      {(Object.entries(FILTERS) as [FilterPreset, typeof FILTERS[FilterPreset]][]).map(([key, f]) => (
                        <button
                          key={key}
                          onClick={() => setFilter(key)}
                          className={`flex-shrink-0 w-16 rounded-lg p-1.5 text-center transition-all cursor-pointer ${
                            filter === key
                              ? 'sk-leather shadow-lg scale-105'
                              : 'sk-btn hover:scale-105'
                          }`}
                        >
                          <div className="text-xl mb-0.5">{f.emoji}</div>
                          <div className="old-typewriter text-[8px] font-bold truncate"
                            style={{ color: filter === key ? '#faf6eb' : '#5c4033' }}>
                            {f.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ═══ GALLERY ═══ */}
          {gallery.length > 0 && (
            <div className="sk-paper-aged border-t border-[#c4b594]">
              <div className="px-3 py-2">
                <p className="old-label text-[10px] text-[#8b7355] mb-2">GALLERY ({gallery.length})</p>
                <div className="flex gap-2 overflow-x-auto pb-1 sk-scrollbar">
                  {gallery.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setViewItem(item)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-[#c4b594] relative cursor-pointer hover:scale-105 transition-transform"
                      style={{ '--rotate': `${-2 + Math.random() * 4}deg` } as React.CSSProperties}
                    >
                      {item.type === 'photo' ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#2a1f14] flex items-center justify-center relative">
                          <Play className="h-5 w-5 text-[#d4a574]" />
                          <div className="absolute bottom-0.5 right-1 old-typewriter text-[7px] text-[#d4a574] bg-black/50 px-1 rounded">
                            VID
                          </div>
                        </div>
                      )}
                      {/* Polaroid-style mini frame indicator */}
                      <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white/60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CONTROLS BAR ═══ */}
          <div className="sk-wood px-4 py-3 flex items-center justify-around">
            {/* Gallery toggle */}
            <button
              onClick={() => gallery.length > 0 && setViewItem(gallery[0])}
              className="relative cursor-pointer p-2"
              disabled={gallery.length === 0}
            >
              <ImageIcon className="h-6 w-6 text-[#d4a574]" />
              {gallery.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] old-typewriter font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {gallery.length}
                </span>
              )}
            </button>

            {/* Shutter / Record button */}
            <div className="relative">
              {/* Outer ring - vintage style */}
              <div className="w-20 h-20 rounded-full p-1.5" style={{
                background: 'linear-gradient(145deg, #a08868, #6b5a40)',
                boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}>
                {/* Inner ring */}
                <div className="w-full h-full rounded-full p-1" style={{
                  background: 'linear-gradient(145deg, #3d2b1f, #2a1f14)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                }}>
                  {/* Shutter button */}
                  <button
                    onClick={mode === 'photo' ? capturePhoto : toggleRecording}
                    className={`w-full h-full rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 ${
                      recording ? 'animate-pulse' : ''
                    }`}
                    style={{
                      background: recording
                        ? 'linear-gradient(145deg, #c0392b, #922b21)'
                        : mode === 'photo'
                          ? 'linear-gradient(145deg, #f0e6d3, #d4c5a9)'
                          : 'linear-gradient(145deg, #e74c3c, #c0392b)',
                      boxShadow: recording
                        ? '0 0 15px rgba(231,76,60,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                      transform: recording ? 'scale(0.9)' : 'scale(1)',
                    }}
                  >
                    {mode === 'photo' ? (
                      <Camera className="h-7 w-7 text-[#5c4033]" />
                    ) : (
                      recording ? (
                        <Square className="h-6 w-6 text-white fill-white" />
                      ) : (
                        <Circle className="h-7 w-7 text-white fill-white" />
                      )
                    )}
                  </button>
                </div>
              </div>
              {/* Textured grip dots around button */}
              <div className="absolute -inset-3 rounded-full opacity-20" style={{
                border: '2px dashed #a08868',
              }} />
            </div>

            {/* Switch camera / Mode toggle */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={handleSwitchCamera} className="cursor-pointer p-2">
                <SwitchCamera className="h-6 w-6 text-[#d4a574]" />
              </button>
              <button
                onClick={() => { setMode(m => m === 'photo' ? 'video' : 'photo'); if (recording) toggleRecording(); }}
                className="cursor-pointer p-1"
              >
                {mode === 'photo' ? (
                  <Video className="h-4 w-4 text-[#d4a574]" />
                ) : (
                  <Camera className="h-4 w-4 text-[#d4a574]" />
                )}
              </button>
            </div>
          </div>

          {/* Filter toggle button */}
          {cameraOpen && (
            <button
              onClick={() => setShowFilters(f => !f)}
              className="sk-vhs-label old-btn text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 mx-auto mb-2"
              style={{ color: showFilters ? '#c0392b' : '#5c4033' }}
            >
              <Zap className="h-3 w-3" />
              {showFilters ? 'Hide Filters' : 'Film Filters'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ═══ FULLSCREEN VIEWER ═══ */}
      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center"
          >
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button onClick={() => downloadItem(viewItem)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                <Download className="h-4 w-4 inline mr-1" /> Save
              </button>
              <button onClick={() => deleteItem(viewItem.id)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-red-400">
                <Trash2 className="h-4 w-4 inline mr-1" /> Delete
              </button>
              <button onClick={() => setViewItem(null)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Date stamp */}
            <div className="absolute top-4 left-4 z-10">
              <span className="old-typewriter text-xs text-[#d4a574]/70">
                {new Date(viewItem.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            {/* Content */}
            <div className="max-w-lg w-full mx-4">
              {viewItem.type === 'photo' ? (
                <div className="sk-polaroid mx-auto max-w-sm" style={{ '--rotate': `${-1 + Math.random() * 2}deg` } as React.CSSProperties}>
                  <img
                    src={viewItem.url}
                    alt="Captured memory"
                    className="w-full h-auto rounded-sm"
                    style={{ filter: 'contrast(1.05)' }}
                  />
                  <p className="old-handwritten text-xs text-[#8b7355] text-center mt-2 px-2">
                    A moment captured with love
                  </p>
                </div>
              ) : (
                <div className="sk-tv-screen rounded-lg overflow-hidden p-1">
                  <video
                    src={viewItem.url}
                    controls
                    className="w-full rounded"
                    style={{ filter: FILTERS[filter].css === 'none' ? 'sepia(0.15) contrast(1.1) brightness(0.92)' : FILTERS[filter].css }}
                  />
                  <div className="text-center mt-2">
                    <span className="old-typewriter text-[10px] text-[#d4a574]/70">VHS Recording</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              {gallery.length > 1 && (
                <>
                  {(() => {
                    const idx = gallery.findIndex(i => i.id === viewItem.id);
                    const prevItem = gallery[(idx + 1) % gallery.length];
                    const nextItem = gallery[(idx - 1 + gallery.length) % gallery.length];
                    return (
                      <>
                        <button onClick={() => setViewItem(prevItem)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                          ◀ Prev
                        </button>
                        <span className="old-typewriter text-xs text-[#8b7355] self-center">
                          {gallery.findIndex(i => i.id === viewItem.id) + 1} / {gallery.length}
                        </span>
                        <button onClick={() => setViewItem(nextItem)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                          Next ▶
                        </button>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}