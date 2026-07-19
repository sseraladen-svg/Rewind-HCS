'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Video, X, Download, Trash2, Image as ImageIcon,
  RotateCcw, SwitchCamera, Zap, Circle, Square, Play,
} from 'lucide-react';
import {
  PIPELINE_PRESETS,
  processFrame,
  processPreviewFrame,
  getGateFlickerEV,
  type PipelineConfig,
} from '@/lib/image-pipeline';
import { getAllCameraPhotos, addCameraPhoto, deleteCameraPhoto } from '@/lib/idb-store';

/* ═══════ TYPES ═══════ */
interface CapturedItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: number;
  blob?: Blob;
}

type FilterPreset = 'none' | 'sepia70s' | 'faded80s' | 'warm90s' | 'bw60s' | 'polaroid' | 'vhs' | 'kodak';

/* Real-time preview resolution (low for performance) */
const PREVIEW_W = 360;
const PREVIEW_H = 202;
const TARGET_FPS = 24;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

/* ═══════ VINTAGE CAMERA COMPONENT ═══════ */
export default function VintageCamera({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);   // full-res for capture
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);   // live processed preview
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const flashRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const flickerEvRef = useRef<number>(0);

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
  const [processing, setProcessing] = useState(false);

  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dbObjectUrlsRef = useRef<string[]>([]);

  /* ── Load persisted photos from IndexedDB on mount ── */
  useEffect(() => {
    let cancelled = false;
    getAllCameraPhotos().then((photos) => {
      if (cancelled) return;
      const items: CapturedItem[] = photos.map((photo) => {
        const url = URL.createObjectURL(photo.image_blob);
        dbObjectUrlsRef.current.push(url);
        return {
          id: photo.id,
          type: 'photo' as const,
          url,
          timestamp: photo.created_at,
          blob: photo.image_blob,
        };
      });
      if (items.length > 0) {
        setGallery((prev) => {
          // Avoid duplicates (e.g., if React StrictMode double-fires)
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = items.filter((i) => !existingIds.has(i.id));
          return [...newItems, ...prev];
        });
      }
    });
    return () => { cancelled = true; };
  }, []);

  /* ── Get current preset config ── */
  const currentConfig: PipelineConfig = PIPELINE_PRESETS[filter] || PIPELINE_PRESETS['none'];

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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
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
    return () => {};
  }, [facingMode, mode, cameraOpen, startCamera]);

  /* ── Real-time preview loop ── */
  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !previewCanvasRef.current) return;

    // Create offscreen canvas for drawing video frames
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    offscreenRef.current.width = PREVIEW_W;
    offscreenRef.current.height = PREVIEW_H;
    const offCtx = offscreenRef.current.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    const previewCanvas = previewCanvasRef.current;
    previewCanvas.width = PREVIEW_W;
    previewCanvas.height = PREVIEW_H;
    const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
    if (!previewCtx) return;

    let running = true;

    const renderLoop = (timestamp: number) => {
      if (!running) return;

      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
        frameCountRef.current++;

        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(renderLoop);
          return;
        }

        // Draw video frame to offscreen canvas (mirrored if front camera)
        offCtx.save();
        if (facingMode === 'user') {
          offCtx.translate(PREVIEW_W, 0);
          offCtx.scale(-1, 1);
        }
        offCtx.drawImage(video, 0, 0, PREVIEW_W, PREVIEW_H);
        offCtx.restore();

        // Apply lightweight preview pipeline
        try {
          processPreviewFrame(offCtx, PREVIEW_W, PREVIEW_H, filter, frameCountRef.current);

          // Gate flicker for video mode
          if (mode === 'video' && currentConfig.gateFlicker.enabled) {
            flickerEvRef.current = getGateFlickerEV(currentConfig.gateFlicker.intensity);
            const imgData = offCtx.getImageData(0, 0, PREVIEW_W, PREVIEW_H);
            const d = imgData.data;
            const mult = 1 + flickerEvRef.current * 0.5;
            for (let i = 0; i < d.length; i += 4) {
              d[i] = Math.max(0, Math.min(255, Math.round(d[i] * mult)));
              d[i + 1] = Math.max(0, Math.min(255, Math.round(d[i + 1] * mult)));
              d[i + 2] = Math.max(0, Math.min(255, Math.round(d[i + 2] * mult)));
            }
            offCtx.putImageData(imgData, 0, 0);
          }
        } catch {
          // silently skip if processing errors (e.g., tab not visible)
        }

        // Copy to visible preview canvas
        previewCtx.drawImage(offscreenRef.current, 0, 0);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [cameraOpen, filter, facingMode, mode, currentConfig.gateFlicker.enabled, currentConfig.gateFlicker.intensity]);

  /* ── Capture Photo (Full Pipeline) ── */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !captureCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setProcessing(true);

    // Use full resolution
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply full pipeline
    try {
      processFrame(ctx, w, h, filter, { addStamp: true });
    } catch (e) {
      console.error('Pipeline error:', e);
    }

    // Flash effect
    setFlash(true);
    setShutterAnim(true);
    setTimeout(() => setFlash(false), 200);
    setTimeout(() => setShutterAnim(false), 300);

    // Save to gallery
    canvas.toBlob((blob) => {
      if (!blob) { setProcessing(false); return; }
      const url = URL.createObjectURL(blob);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setGallery(prev => [{
        id,
        type: 'photo',
        url,
        timestamp: Date.now(),
        blob,
      }, ...prev]);
      addCameraPhoto({ id, image_blob: blob, filter_used: filter, created_at: Date.now() });
      setProcessing(false);
    }, 'image/jpeg', 0.92);
  }, [filter, facingMode]);

  /* ── Start/Stop Video Recording ── */
  const toggleRecording = useCallback(() => {
    if (!recording && streamRef.current) {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const tryStart = (mimeType: string) => {
        try {
          const mediaRecorder = new MediaRecorder(streamRef.current!, { mimeType });
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
          if (mimeType.includes('vp9')) {
            tryStart('video/webm;codecs=vp8');
          } else {
            setCameraError('Video recording not supported in this browser.');
          }
        }
      };
      tryStart(options.mimeType);
    } else if (recording && mediaRecorderRef.current) {
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
      if (item) {
        URL.revokeObjectURL(item.url);
        // Also remove from dbObjectUrlsRef tracking
        dbObjectUrlsRef.current = dbObjectUrlsRef.current.filter(u => u !== item.url);
      }
      if (item?.type === 'photo') {
        deleteCameraPhoto(id);
      }
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
      dbObjectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      dbObjectUrlsRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Format time ── */
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── Pipeline info for HUD ── */
  const pipelineStages = [
    currentConfig.chromaticAberration.enabled && 'CA',
    currentConfig.toneCurve.blackLift > 0 && 'MATTE',
    currentConfig.contrastReduce > 0 && 'FLAT',
    currentConfig.antiClarity.enabled && 'SOFT',
    currentConfig.grain.enabled && 'GRAIN',
    currentConfig.halation.enabled && 'GLOW',
    currentConfig.vignette.intensity > 0 && 'VIG',
  ].filter(Boolean);

  return (
    <>
      {/* Hidden canvases */}
      <canvas ref={captureCanvasRef} className="hidden" />

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
                <p className="old-body text-[#d4a574] mb-2 text-sm">Open the camera to capture memories in vintage style</p>
                <p className="old-typewriter text-[10px] text-[#8b7355] mb-6">
                  Full image processing pipeline: chromatic aberration, tone curves, Perlin grain, halation glow
                </p>
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
                {/* Hidden video source (never shown directly) */}
                <video
                  ref={videoRef}
                  className="hidden"
                  playsInline
                  muted
                />

                {/* Real-time processed canvas preview */}
                <canvas
                  ref={previewCanvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    imageRendering: 'auto', // smooth upscaling for that vintage soft look
                  }}
                />

                {/* Halation glow overlay (CSS-based, adds dreamy ambient light) */}
                {currentConfig.halation.enabled && (
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-screen"
                    style={{
                      background: `radial-gradient(ellipse at 50% 50%, rgba(255,240,200,${currentConfig.halation.intensity * 0.06}) 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Scanline overlay (VHS era feel) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
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

                {/* Filter label + Pipeline HUD */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                  <div className="sk-vhs-label px-2 py-1 rounded">
                    <span className="old-typewriter text-[10px] font-bold text-[#5c4033]">
                      {currentConfig.emoji} {currentConfig.name}
                    </span>
                  </div>
                  {/* Pipeline stages HUD */}
                  {pipelineStages.length > 0 && (
                    <div className="sk-vhs-label px-2 py-0.5 rounded opacity-70">
                      <span className="old-typewriter text-[7px] text-[#8b7355] tracking-wider">
                        {pipelineStages.join(' · ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gate flicker indicator (video mode) */}
                {mode === 'video' && currentConfig.gateFlicker.enabled && (
                  <div className="absolute bottom-4 left-4 sk-vhs-label px-2 py-0.5 rounded opacity-60 z-10">
                    <span className="old-typewriter text-[7px] text-[#8b7355]">
                      GATE FLICKER: {flickerEvRef.current >= 0 ? '+' : ''}{flickerEvRef.current.toFixed(3)} EV
                    </span>
                  </div>
                )}

                {/* FPS counter (subtle) */}
                <div className="absolute bottom-4 right-4 opacity-40 z-10">
                  <span className="old-typewriter text-[7px] text-[#8b7355]">
                    {TARGET_FPS}fps · {PREVIEW_W}x{PREVIEW_H} preview
                  </span>
                </div>

                {/* Processing indicator */}
                {processing && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-2 border-[#d4a574] border-t-transparent rounded-full"
                    />
                  </div>
                )}

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
                    <p className="old-label text-[10px] text-[#8b7355] mb-1">CHOOSE FILM TYPE</p>
                    <p className="old-typewriter text-[7px] text-[#a89070] mb-2">
                      Each preset applies a unique processing pipeline: tone curves, grain, optical effects
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 sk-scrollbar">
                      {(Object.entries(PIPELINE_PRESETS) as [string, PipelineConfig][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setFilter(key as FilterPreset)}
                          className={`flex-shrink-0 w-16 rounded-lg p-1.5 text-center transition-all cursor-pointer ${
                            filter === key
                              ? 'sk-leather shadow-lg scale-105'
                              : 'sk-btn hover:scale-105'
                          }`}
                        >
                          <div className="text-xl mb-0.5">{cfg.emoji}</div>
                          <div className="old-typewriter text-[8px] font-bold truncate"
                            style={{ color: filter === key ? '#faf6eb' : '#5c4033' }}>
                            {cfg.name}
                          </div>
                          {/* Mini pipeline badge */}
                          {filter === key && (
                            <div className="old-typewriter text-[5px] text-[#d4a574] mt-0.5 leading-tight">
                              {[
                                cfg.chromaticAberration.enabled && 'CA',
                                cfg.grain.enabled && 'Grain',
                                cfg.halation.enabled && 'Glow',
                                cfg.antiClarity.enabled && 'Soft',
                              ].filter(Boolean).join(' ')}
                            </div>
                          )}
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
              <div className="w-20 h-20 rounded-full p-1.5" style={{
                background: 'linear-gradient(145deg, #a08868, #6b5a40)',
                boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}>
                <div className="w-full h-full rounded-full p-1" style={{
                  background: 'linear-gradient(145deg, #3d2b1f, #2a1f14)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                }}>
                  <button
                    onClick={mode === 'photo' ? capturePhoto : toggleRecording}
                    disabled={processing}
                    className={`w-full h-full rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 disabled:opacity-50 ${
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
                    {processing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-[#5c4033] border-t-transparent rounded-full"
                      />
                    ) : mode === 'photo' ? (
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

            <div className="absolute top-4 left-4 z-10">
              <span className="old-typewriter text-xs text-[#d4a574]/70">
                {new Date(viewItem.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            <div className="max-w-lg w-full mx-4">
              {viewItem.type === 'photo' ? (
                <div className="sk-polaroid mx-auto max-w-sm" style={{ '--rotate': `${-1 + Math.random() * 2}deg` } as React.CSSProperties}>
                  <img
                    src={viewItem.url}
                    alt="Captured memory"
                    className="w-full h-auto rounded-sm"
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
                    style={{ filter: PIPELINE_PRESETS[filter]?.cssPreview || 'none' }}
                  />
                  <div className="text-center mt-2">
                    <span className="old-typewriter text-[10px] text-[#d4a574]/70">VHS Recording</span>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              {gallery.length > 1 && (
                (() => {
                  const idx = gallery.findIndex(i => i.id === viewItem.id);
                  const prevItem = gallery[(idx + 1) % gallery.length];
                  const nextItem = gallery[(idx - 1 + gallery.length) % gallery.length];
                  return (
                    <>
                      <button onClick={() => setViewItem(prevItem)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                        ◀ Prev
                      </button>
                      <span className="old-typewriter text-xs text-[#8b7355] self-center">
                        {idx + 1} / {gallery.length}
                      </span>
                      <button onClick={() => setViewItem(nextItem)} className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white">
                        Next ▶
                      </button>
                    </>
                  );
                })()
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}