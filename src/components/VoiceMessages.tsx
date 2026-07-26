'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllVoicemails, addVoicemail, deleteVoicemail } from '@/lib/idb-store';
import { soundButtonClick, soundRecordStart, soundRecordStop, soundDelete } from '@/lib/sounds';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface VoicemailMessage {
  id: string;
  audioBlob: Blob;
  duration: number;
  timestamp: string;
}

type Status = 'idle' | 'error-unsupported' | 'error-denied' | 'ready' | 'recording' | 'playing';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function generateId(): string {
  return `vm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  const hour = d.getHours();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day}, ${h12}:${min} ${ampm}`;
}

/** Play a short beep using Web Audio API */
function playBeep(frequency = 1000, duration = 0.15, type: OscillatorType = 'square') {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {
    // silently ignore audio errors
  }
}

/** Generate fake waveform bar heights for visual display */
function generateWaveformBars(count = 32): number[] {
  return Array.from({ length: count }, () => Math.random() * 0.7 + 0.15);
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function VoiceMessages() {
  const [status, setStatus] = useState<Status>('ready');
  const [messages, setMessages] = useState<VoicemailMessage[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_RECORDING_SECONDS = 60;
  const MAX_SAVED_MESSAGES = 5;
  const objectUrlRef = useRef<string | null>(null);

  // ── Load messages from IndexedDB ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    getAllVoicemails()
      .then((records) => {
        // records come sorted by timestamp ascending; reverse for newest-first
        setMessages(
          records.reverse().map((r) => ({
            id: r.id,
            audioBlob: r.audio_blob,
            duration: r.duration,
            timestamp: r.timestamp,
          }))
        );
      })
      .catch(() => {
        // IDB unavailable, start fresh
      });
  }, []);

  // ── Check browser support ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error-unsupported');
    }
  }, []);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // ── Start Recording ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const id = generateId();
        const duration = recordingTime || 1;
        const timestamp = new Date().toISOString();

        addVoicemail({ id, audio_blob: blob, duration, timestamp })
          .then(() => {
            const newMsg: VoicemailMessage = { id, audioBlob: blob, duration, timestamp };
            setMessages((prev) => {
              const updated = [newMsg, ...prev];
              if (updated.length > MAX_SAVED_MESSAGES) {
                // Delete overflow messages (oldest at the end)
                const overflow = updated.slice(MAX_SAVED_MESSAGES);
                overflow.forEach((m) => deleteVoicemail(m.id).catch(() => {}));
                return updated.slice(0, MAX_SAVED_MESSAGES);
              }
              return updated;
            });
          })
          .catch(() => {});

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      soundRecordStart();
      playBeep(800, 0.1, 'square');
      setStatus('recording');
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return prev;
          }
          return next;
        });
      }, 1000);
    } catch (err: unknown) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('error-denied');
        setErrorMsg('Microphone access denied. Please allow microphone access.');
      } else {
        setStatus('error-unsupported');
        setErrorMsg('Audio recording not supported in this browser... try Chrome or Firefox!');
      }
    }
  }, [recordingTime]);

  // ── Stop Recording ──
  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    soundRecordStop();
    playBeep(600, 0.2, 'sine');
    setStatus('ready');
  }, []);

  // ── Toggle Recording ──
  const toggleRecording = useCallback(() => {
    soundButtonClick();
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'ready') {
      startRecording();
    }
  }, [status, startRecording, stopRecording]);

  // ── Play / Pause a message ──
  const togglePlay = useCallback((msg: VoicemailMessage) => {
    if (playingId === msg.id) {
      // pause
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      setPlayingId(null);
      setPlayProgress(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // stop any current playback and revoke previous object URL
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const url = URL.createObjectURL(msg.audioBlob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioElRef.current = audio;

      const updateProgress = () => {
        if (audio.duration) {
          setPlayProgress(audio.currentTime / audio.duration);
        }
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      audio.onplay = () => {
        setStatus('playing');
        setPlayingId(msg.id);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      audio.onended = () => {
        setPlayingId(null);
        setPlayProgress(0);
        setStatus('ready');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };

      audio.onerror = () => {
        setPlayingId(null);
        setPlayProgress(0);
        setStatus('ready');
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };

      audio.play().catch(() => {
        setPlayingId(null);
        setStatus('ready');
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      });
    }
  }, [playingId]);

  // ── Delete a message ──
  const deleteMessage = useCallback(
    (id: string) => {
      soundDelete();
      if (playingId === id && audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
        setPlayingId(null);
        setStatus('ready');
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
      deleteVoicemail(id).catch(() => {});
    },
    [playingId]
  );

  // ── Render ──

  const isRecording = status === 'recording';
  const isPlaying = status === 'playing';

  return (
    <section className="py-8 px-2">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full sk-leather mb-4">
          <span className="text-2xl">🎙️</span>
        </div>
        <h2 className="old-typewriter text-xl md:text-2xl font-bold text-[#3d2b1f] mb-2">
          ✦ VOICE MESSAGES ✦
        </h2>
        <p className="old-body text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Leave a message after the beep... just like the old answering machine.
        </p>
      </motion.div>

      {/* Error States */}
      {(status === 'error-unsupported' || status === 'error-denied') && (
        <div className="sk-paper rounded-xl p-6 text-center mb-6">
          <p className="old-typewriter text-sm text-red-800">
            {errorMsg || 'Audio recording not supported in this browser... try Chrome or Firefox!'}
          </p>
        </div>
      )}

      {/* ── Answering Machine Body ── */}
      <div className="sk-leather rounded-2xl p-5 md:p-8 max-w-lg mx-auto shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 sk-noise pointer-events-none opacity-30" />

        {/* Brand label */}
        <div className="text-center mb-4 relative">
          <p className="old-label text-[9px] tracking-[0.3em] text-[#c9a96e] uppercase">
            REWIND™ ANSWERING MACHINE
          </p>
          <p className="old-typewriter text-[8px] text-[#a08060] mt-0.5">
            MODEL VM-1987
          </p>
        </div>

        {/* ── Tape Deck Area ── */}
        <div className="bg-[#1a1410] rounded-xl p-4 mb-5 relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] border border-[#2a2218]">
          {/* Cassette Tape Visual */}
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Left Reel */}
            <div className="relative w-14 h-14">
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#5a4a3a] ${
                  isRecording || isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2s' }}
              >
                <div className="absolute inset-1.5 rounded-full bg-[#2a2218] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1410] border border-[#5a4a3a]" />
                </div>
                {/* Spokes */}
                <div className="absolute inset-2 rounded-full">
                  {isRecording || isPlaying ? (
                    <svg viewBox="0 0 40 40" className="w-full h-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <line
                          key={deg}
                          x1="20"
                          y1="4"
                          x2="20"
                          y2="12"
                          stroke="#5a4a3a"
                          strokeWidth="1.5"
                          transform={`rotate(${deg} 20 20)`}
                        />
                      ))}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <line
                          key={deg}
                          x1="20"
                          y1="4"
                          x2="20"
                          y2="12"
                          stroke="#5a4a3a"
                          strokeWidth="1.5"
                          transform={`rotate(${deg} 20 20)`}
                        />
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Tape label area */}
            <div className="flex-1 max-w-[180px]">
              <div className="bg-[#f5edd6] rounded-md p-2 h-14 relative shadow-sm border border-[#d4c9a8]">
                <div className="absolute inset-0 sk-noise pointer-events-none opacity-20" />
                <p className="old-label text-[8px] text-[#8b7355] text-center tracking-wider">
                  ─── REWIND TAPE ───
                </p>
                <p className="old-typewriter text-[7px] text-[#6b5b3e] text-center mt-1">
                  {messages.length > 0
                    ? `SIDE A · ${messages.length} MSG${messages.length !== 1 ? 'S' : ''}`
                    : 'SIDE A · BLANK'}
                </p>
                {/* Tape window */}
                <div className="mx-auto mt-1 w-16 h-3 bg-[#3d2b1f] rounded-sm flex items-center justify-center gap-1">
                  <div className="w-5 h-1.5 rounded-full bg-[#1a1410] border border-[#5a4a3a]" />
                  <div className="w-5 h-1.5 rounded-full bg-[#1a1410] border border-[#5a4a3a]" />
                </div>
              </div>
            </div>

            {/* Right Reel */}
            <div className="relative w-14 h-14">
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#5a4a3a] ${
                  isRecording || isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2.5s', animationDirection: 'reverse' }}
              >
                <div className="absolute inset-1.5 rounded-full bg-[#2a2218] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1410] border border-[#5a4a3a]" />
                </div>
                <div className="absolute inset-2 rounded-full">
                  {isRecording || isPlaying ? (
                    <svg viewBox="0 0 40 40" className="w-full h-full animate-spin" style={{ animationDuration: '2s' }}>
                      {[0, 72, 144, 216, 288].map((deg) => (
                        <line
                          key={deg}
                          x1="20"
                          y1="4"
                          x2="20"
                          y2="12"
                          stroke="#5a4a3a"
                          strokeWidth="1.5"
                          transform={`rotate(${deg} 20 20)`}
                        />
                      ))}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      {[0, 72, 144, 216, 288].map((deg) => (
                        <line
                          key={deg}
                          x1="20"
                          y1="4"
                          x2="20"
                          y2="12"
                          stroke="#5a4a3a"
                          strokeWidth="1.5"
                          transform={`rotate(${deg} 20 20)`}
                        />
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LED Counter & Status */}
          <div className="flex items-center justify-between">
            {/* LED Counter */}
            <div className="bg-[#0a0a05] rounded px-3 py-1.5 border border-[#2a2a15] shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
              <span className="old-typewriter text-lg tracking-[0.2em] text-amber-400 font-bold" style={{ textShadow: '0 0 8px rgba(251,191,36,0.5)' }}>
                {isRecording || isPlaying ? formatTime(isRecording ? recordingTime : (playProgress * (messages.find((m) => m.id === playingId)?.duration || 0))) : '00:00'}
              </span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className="flex items-center gap-1.5 bg-[#1a0a0a] rounded px-2 py-1 border border-[#3a1515]">
                  <span
                    className="w-2 h-2 rounded-full bg-red-500"
                    style={{
                      animation: 'blink 0.8s ease-in-out infinite',
                    }}
                  />
                  <span className="old-typewriter text-[10px] text-red-400 font-bold tracking-wider">
                    REC
                  </span>
                </div>
              )}
              <span
                className={`old-typewriter text-[10px] tracking-wider ${
                  isRecording
                    ? 'text-red-400'
                    : isPlaying
                    ? 'text-green-400'
                    : 'text-[#6b5b3e]'
                }`}
              >
                {isRecording ? 'RECORDING...' : isPlaying ? 'PLAYING...' : 'READY'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-6 mb-6 relative">
          {/* Record Button */}
          <button
            onClick={toggleRecording}
            disabled={status === 'error-unsupported' || status === 'error-denied'}
            className="group relative w-16 h-16 rounded-full bg-[#8b1a1a] border-4 border-[#5a1010] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-[#a02020] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording && (
              <div
                className="absolute inset-0 rounded-full bg-red-500/30"
                style={{
                  animation: 'pulse-ring 1.5s ease-in-out infinite',
                }}
              />
            )}
            <div className="flex items-center justify-center w-full h-full">
              {isRecording ? (
                <div className="w-5 h-5 rounded-sm bg-[#1a0a0a]" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#1a0a0a] border border-[#5a1010]" />
              )}
            </div>
          </button>

          <div className="text-center">
            <p className="old-label text-[9px] text-[#c9a96e] tracking-wider">RECORD</p>
            <p className="old-typewriter text-[7px] text-[#8b7355] mt-0.5">
              MAX {MAX_RECORDING_SECONDS}s
            </p>
          </div>
        </div>

        {/* ── New Messages Indicator ── */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center mb-4"
            >
              <p className="old-typewriter text-xs text-amber-600" style={{ textShadow: '0 0 6px rgba(217,119,6,0.2)' }}>
                📼 You have <span className="font-bold">{messages.length}</span> saved message{messages.length !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Message List ── */}
      <div className="max-w-lg mx-auto mt-6 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => {
            const isThisPlaying = playingId === msg.id;
            const bars = generateWaveformBars(32);
            const progressIdx = isThisPlaying ? Math.floor(playProgress * bars.length) : 0;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="sk-paper rounded-xl p-4 relative group shadow-sm"
              >
                <div className="absolute inset-0 sk-noise pointer-events-none opacity-10" />

                {/* Tape Label Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="old-label text-[9px] text-[#8b7355] tracking-wider">
                      ✉ VOICEMAIL #{messages.indexOf(msg) + 1}
                    </p>
                    <p className="old-typewriter text-[8px] text-[#a08060] mt-0.5">
                      {formatDate(msg.timestamp)}
                    </p>
                  </div>
                  <span className="old-typewriter text-[10px] text-[#6b5b3e] bg-[#f5edd6] px-2 py-0.5 rounded border border-[#d4c9a8]">
                    {formatTime(msg.duration)}
                  </span>
                </div>

                {/* Waveform Visual */}
                <div className="flex items-end gap-[2px] h-10 mb-3 px-1 bg-[#f5edd6]/50 rounded border border-[#e0d5b8] overflow-hidden">
                  {bars.map((height, i) => {
                    const isPast = isThisPlaying && i < progressIdx;
                    const isCurrent = isThisPlaying && i === progressIdx;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-colors duration-150 min-w-[2px]"
                        style={{
                          height: `${height * 100}%`,
                          backgroundColor: isCurrent
                            ? '#b91c1c'
                            : isPast
                            ? '#8b5e3c'
                            : '#c9a96e',
                          opacity: isPast || isCurrent ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={() => { soundButtonClick(); togglePlay(msg); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3d2b1f] text-[#f5edd6] old-typewriter text-[10px] tracking-wider hover:bg-[#5a4030] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    aria-label={isThisPlaying ? 'Pause' : 'Play'}
                  >
                    {isThisPlaying ? (
                      <>
                        <span className="inline-block w-2.5 h-3 bg-[#f5edd6] rounded-[1px]" />
                        PAUSE
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-0 h-0 border-l-[6px] border-l-[#f5edd6] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
                        PLAY
                      </>
                    )}
                  </button>

                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 bg-[#e0d5b8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8b5e3c] rounded-full transition-all duration-100"
                      style={{ width: isThisPlaying ? `${playProgress * 100}%` : '0%' }}
                    />
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => { soundButtonClick(); deleteMessage(msg.id); }}
                    className="text-[#8b7355] hover:text-red-700 transition-colors opacity-60 group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded p-1"
                    aria-label="Delete message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {messages.length === 0 && status !== 'recording' && (
          <p className="text-center old-body text-sm text-muted-foreground py-6 opacity-60">
            No messages yet... press record to leave one! 🎙️
          </p>
        )}
      </div>

      {/* ── Inline Keyframes ── */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}