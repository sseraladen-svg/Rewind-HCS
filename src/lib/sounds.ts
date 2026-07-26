/**
 * ═══════════════════════════════════════════════════════════
 *  REWIND — Vintage Sound Engine (Web Audio API)
 *  All sounds are generated procedurally — no external files.
 * ═══════════════════════════════════════════════════════════
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/* ──────────── HELPERS ──────────── */

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  detune = 0,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  // Bandpass for that old speaker feel
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

/* ═══════════════════════════════════════════════════════════
 *  SOUND LIBRARY
 * ═══════════════════════════════════════════════════════════ */

/** CRT BIOS boot beep — short, high-pitched square wave */
export function soundBootBeep() {
  playTone(1000, 0.08, 'square', 0.1);
}

/** CRT ready chime — two ascending tones */
export function soundBootReady() {
  playTone(523, 0.15, 'square', 0.1);
  setTimeout(() => playTone(784, 0.25, 'square', 0.12), 150);
}

/** VHS tracking glitch — quick noise burst */
export function soundVhsGlitch() {
  playNoise(0.08, 0.15);
}

/** Mechanical button click — short noise + click */
export function soundButtonClick() {
  playNoise(0.03, 0.2);
  playTone(800, 0.02, 'square', 0.05);
}

/** Cassette tape tab switch — plastic clunk */
export function soundTabSwitch() {
  const ctx = getCtx();
  // Low thud
  playTone(120, 0.06, 'sine', 0.2);
  // Plastic click
  setTimeout(() => playNoise(0.02, 0.15), 30);
  // Tape winding whir
  setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.04, 50), 60);
}

/** Camera shutter — mechanical click with spring */
export function soundShutter() {
  const ctx = getCtx();
  // First curtain
  playNoise(0.04, 0.25);
  playTone(200, 0.03, 'square', 0.15);
  // Second curtain + mirror slap
  setTimeout(() => {
    playNoise(0.05, 0.2);
    playTone(150, 0.04, 'sine', 0.1);
  }, 80);
  // Motor wind
  setTimeout(() => playTone(400, 0.1, 'sawtooth', 0.05, 100), 180);
}

/** Video record start — beep beep */
export function soundRecordStart() {
  playTone(1200, 0.1, 'square', 0.12);
  setTimeout(() => playTone(1200, 0.15, 'square', 0.12), 200);
}

/** Video record stop — descending beep */
export function soundRecordStop() {
  playTone(1200, 0.1, 'square', 0.12);
  setTimeout(() => playTone(800, 0.15, 'square', 0.1), 150);
}

/** Rotary phone dial — mechanical pulse */
export function soundDialPulse() {
  playNoise(0.015, 0.12);
  playTone(600, 0.02, 'square', 0.08);
}

/** Phone ring — classic bell pattern */
export function soundPhoneRing() {
  // Double ring pattern
  playTone(440, 0.15, 'sine', 0.15);
  playTone(480, 0.15, 'sine', 0.12);
  setTimeout(() => {
    playTone(440, 0.15, 'sine', 0.15);
    playTone(480, 0.15, 'sine', 0.12);
  }, 400);
}

/** AIM door open — classic buddy sign-on sound */
export function soundAimDoorOpen() {
  const ctx = getCtx();
  // The iconic AIM door sound: descending slam
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
  // Followed by a click
  setTimeout(() => playNoise(0.02, 0.1), 120);
}

/** AIM message received — incoming IM sound */
export function soundAimMessage() {
  // Quick double beep
  playTone(1000, 0.06, 'sine', 0.12);
  setTimeout(() => playTone(1200, 0.08, 'sine', 0.1), 80);
}

/** Typewriter key press */
export function soundTypewriterKey() {
  playNoise(0.02, 0.12);
  playTone(300 + Math.random() * 200, 0.015, 'square', 0.04);
}

/** Typewriter carriage return */
export function soundTypewriterReturn() {
  playNoise(0.08, 0.15);
  playTone(200, 0.1, 'sawtooth', 0.06);
  setTimeout(() => playTone(150, 0.05, 'square', 0.08), 60);
}

/** Journal page turn */
export function soundPageTurn() {
  playNoise(0.15, 0.1);
  // Paper crinkle
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.06;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

/** Game card flip */
export function soundCardFlip() {
  playNoise(0.03, 0.1);
  playTone(500, 0.04, 'sine', 0.08);
}

/** Game match found — happy chime */
export function soundMatchFound() {
  playTone(523, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 200);
}

/** Game wrong / buzzer */
export function soundGameWrong() {
  playTone(200, 0.2, 'sawtooth', 0.1);
}

/** Quiz correct answer */
export function soundQuizCorrect() {
  playTone(600, 0.08, 'square', 0.1);
  setTimeout(() => playTone(800, 0.08, 'square', 0.1), 80);
  setTimeout(() => playTone(1000, 0.15, 'square', 0.12), 160);
}

/** Quiz wrong answer */
export function soundQuizWrong() {
  playTone(300, 0.15, 'sawtooth', 0.1);
  setTimeout(() => playTone(200, 0.25, 'sawtooth', 0.08), 150);
}

/** Nostalgic chime — soft bell for emotional moments */
export function soundChime() {
  playTone(880, 0.3, 'sine', 0.06);
  setTimeout(() => playTone(1100, 0.4, 'sine', 0.04), 200);
}

/** Floppy disk insert */
export function soundFloppyInsert() {
  playNoise(0.06, 0.15);
  playTone(250, 0.05, 'square', 0.1);
  setTimeout(() => playNoise(0.04, 0.1), 80);
  setTimeout(() => playTone(200, 0.1, 'sawtooth', 0.05), 120);
}

/** Save / success confirmation */
export function soundSave() {
  playTone(700, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(900, 0.12, 'sine', 0.1), 100);
}

/** Delete / trash */
export function soundDelete() {
  playTone(400, 0.1, 'sawtooth', 0.08);
  setTimeout(() => playTone(250, 0.15, 'sawtooth', 0.06), 100);
}

/** Transition loader — cassette rewind whir */
export function soundCassetteRewind() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

/** Photo gallery open */
export function soundGalleryOpen() {
  playTone(400, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(500, 0.06, 'sine', 0.06), 60);
}

/** Hover / subtle tick */
export function soundHover() {
  playTone(1200, 0.015, 'sine', 0.03);
}

/** Initialize audio context on first user interaction */
export function initAudio() {
  getCtx();
}
