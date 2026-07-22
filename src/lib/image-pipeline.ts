/**
 * ═══════════════════════════════════════════════════════════
 *  REWIND — Vintage Image Processing Pipeline
 *  Full per-pixel color science + optical imperfections engine
 * ═══════════════════════════════════════════════════════════
 */

/* ──────────── PERLIN NOISE (2D) ──────────── */
const PERM = new Uint8Array(512);
const GRAD2: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function initPermutation(seed: number = 42) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates shuffle with seed
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function dot2(g: [number, number], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

export function perlin2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[X] + Y] % 8;
  const ab = PERM[PERM[X] + Y + 1] % 8;
  const ba = PERM[PERM[X + 1] + Y] % 8;
  const bb = PERM[PERM[X + 1] + Y + 1] % 8;

  const x1 = lerp(dot2(GRAD2[aa], xf, yf), dot2(GRAD2[ba], xf - 1, yf), u);
  const x2 = lerp(dot2(GRAD2[ab], xf, yf - 1), dot2(GRAD2[bb], xf - 1, yf - 1), u);

  return lerp(x1, x2, v); // -1..1
}

// Initialize on module load
initPermutation(Date.now());

/* ──────────── FILTER PRESET CONFIG ──────────── */
export interface PipelineConfig {
  name: string;
  emoji: string;
  cssPreview: string;           // lightweight CSS for live preview
  toneCurve: {                  // "Matte Effect"
    blackLift: number;          // 0 = true black, 15 = washed charcoal
    whiteCrush: number;         // 255 = full white, 240 = faded highlight
  };
  contrastReduce: number;       // 0 = no reduction, 0.35 = 35% flattening
  chrominanceShift: {
    amberYellow: number;        // 0..1 (0.12 = +12% amber)
    greenTint: number;          // 0..1 (0.06 = +6% green in shadows)
  };
  grain: {
    enabled: boolean;
    scale: number;              // Perlin frequency (0.05 = coarse, 0.2 = fine)
    intensity: number;          // 0..1 max opacity
    luminanceWeight: number;    // how much grain increases in shadows (0..1)
  };
  chromaticAberration: {
    enabled: boolean;
    redShift: number;           // pixels outward
    blueShift: number;          // pixels inward (negative = inward)
  };
  vignette: {
    intensity: number;          // 0..1
    cornerBlur: number;         // 0..1 (fraction of frame blurred)
    cornerBlurRadius: number;   // blur radius in pixels
  };
  halation: {
    enabled: boolean;
    threshold: number;          // brightness threshold (0..1)
    blurRadius: number;         // highlight blur radius
    intensity: number;          // blend intensity
  };
  antiClarity: {
    enabled: boolean;
    radius: number;             // bilateral blur radius
    sigmaSpace: number;         // spatial sigma
    sigmaColor: number;         // range sigma
  };
  gateFlicker: {
    enabled: boolean;           // for video mode
    intensity: number;          // ±EV (0.05 default)
  };
  saturation: number;           // global saturation multiplier
  extraPerPreset: 'none' | 'bw' | 'crossProcess';
}

export const PIPELINE_PRESETS: Record<string, PipelineConfig> = {
  none: {
    name: 'Raw',
    emoji: '📷',
    cssPreview: 'none',
    toneCurve: { blackLift: 0, whiteCrush: 255 },
    contrastReduce: 0,
    chrominanceShift: { amberYellow: 0, greenTint: 0 },
    grain: { enabled: false, scale: 0.1, intensity: 0, luminanceWeight: 0 },
    chromaticAberration: { enabled: false, redShift: 0, blueShift: 0 },
    vignette: { intensity: 0, cornerBlur: 0, cornerBlurRadius: 0 },
    halation: { enabled: false, threshold: 0.8, blurRadius: 0, intensity: 0 },
    antiClarity: { enabled: false, radius: 0, sigmaSpace: 0, sigmaColor: 0 },
    gateFlicker: { enabled: false, intensity: 0 },
    saturation: 1,
    extraPerPreset: 'none',
  },
  sepia70s: {
    name: "70's Sepia",
    emoji: '🟤',
    cssPreview: 'sepia(0.5) contrast(1.15) brightness(0.95) saturate(1.1)',
    toneCurve: { blackLift: 18, whiteCrush: 242 },
    contrastReduce: 0.28,
    chrominanceShift: { amberYellow: 0.14, greenTint: 0.04 },
    grain: { enabled: true, scale: 0.06, intensity: 0.55, luminanceWeight: 0.7 },
    chromaticAberration: { enabled: true, redShift: 2.5, blueShift: -1.8 },
    vignette: { intensity: 0.28, cornerBlur: 0.15, cornerBlurRadius: 3 },
    halation: { enabled: true, threshold: 0.75, blurRadius: 18, intensity: 0.35 },
    antiClarity: { enabled: true, radius: 2, sigmaSpace: 3, sigmaColor: 25 },
    gateFlicker: { enabled: true, intensity: 0.04 },
    saturation: 0.65,
    extraPerPreset: 'none',
  },
  faded80s: {
    name: "80's Fade",
    emoji: '🟡',
    cssPreview: 'sepia(0.25) contrast(0.9) brightness(1.08) saturate(0.75)',
    toneCurve: { blackLift: 30, whiteCrush: 238 },
    contrastReduce: 0.32,
    chrominanceShift: { amberYellow: 0.10, greenTint: 0.08 },
    grain: { enabled: true, scale: 0.05, intensity: 0.4, luminanceWeight: 0.6 },
    chromaticAberration: { enabled: true, redShift: 1.8, blueShift: -1.2 },
    vignette: { intensity: 0.22, cornerBlur: 0.12, cornerBlurRadius: 2 },
    halation: { enabled: true, threshold: 0.70, blurRadius: 22, intensity: 0.45 },
    antiClarity: { enabled: true, radius: 3, sigmaSpace: 4, sigmaColor: 30 },
    gateFlicker: { enabled: true, intensity: 0.03 },
    saturation: 0.55,
    extraPerPreset: 'none',
  },
  warm90s: {
    name: "90's Warm",
    emoji: '🟠',
    cssPreview: 'sepia(0.35) contrast(1.1) brightness(1.02) saturate(1.25)',
    toneCurve: { blackLift: 12, whiteCrush: 248 },
    contrastReduce: 0.22,
    chrominanceShift: { amberYellow: 0.16, greenTint: 0.03 },
    grain: { enabled: true, scale: 0.08, intensity: 0.3, luminanceWeight: 0.5 },
    chromaticAberration: { enabled: true, redShift: 1.5, blueShift: -1.0 },
    vignette: { intensity: 0.20, cornerBlur: 0.10, cornerBlurRadius: 2 },
    halation: { enabled: true, threshold: 0.80, blurRadius: 15, intensity: 0.25 },
    antiClarity: { enabled: true, radius: 2, sigmaSpace: 3, sigmaColor: 20 },
    gateFlicker: { enabled: false, intensity: 0 },
    saturation: 1.2,
    extraPerPreset: 'none',
  },
  bw60s: {
    name: "60's B&W",
    emoji: '⬛',
    cssPreview: 'grayscale(1) contrast(1.25) brightness(0.9)',
    toneCurve: { blackLift: 8, whiteCrush: 245 },
    contrastReduce: 0.15,
    chrominanceShift: { amberYellow: 0, greenTint: 0 },
    grain: { enabled: true, scale: 0.04, intensity: 0.7, luminanceWeight: 0.8 },
    chromaticAberration: { enabled: true, redShift: 1.2, blueShift: -0.8 },
    vignette: { intensity: 0.40, cornerBlur: 0.18, cornerBlurRadius: 4 },
    halation: { enabled: true, threshold: 0.85, blurRadius: 12, intensity: 0.3 },
    antiClarity: { enabled: true, radius: 2, sigmaSpace: 3, sigmaColor: 15 },
    gateFlicker: { enabled: true, intensity: 0.05 },
    saturation: 0,
    extraPerPreset: 'bw',
  },
  polaroid: {
    name: 'Polaroid',
    emoji: '📸',
    cssPreview: 'sepia(0.2) contrast(0.95) brightness(1.12) saturate(1.35)',
    toneCurve: { blackLift: 20, whiteCrush: 250 },
    contrastReduce: 0.25,
    chrominanceShift: { amberYellow: 0.08, greenTint: 0.05 },
    grain: { enabled: true, scale: 0.07, intensity: 0.35, luminanceWeight: 0.5 },
    chromaticAberration: { enabled: false, redShift: 0, blueShift: 0 },
    vignette: { intensity: 0.18, cornerBlur: 0.08, cornerBlurRadius: 2 },
    halation: { enabled: true, threshold: 0.72, blurRadius: 25, intensity: 0.5 },
    antiClarity: { enabled: true, radius: 2, sigmaSpace: 3, sigmaColor: 22 },
    gateFlicker: { enabled: false, intensity: 0 },
    saturation: 1.15,
    extraPerPreset: 'none',
  },
  vhs: {
    name: 'VHS',
    emoji: '📼',
    cssPreview: 'sepia(0.15) contrast(1.2) brightness(0.88) saturate(0.85)',
    toneCurve: { blackLift: 15, whiteCrush: 235 },
    contrastReduce: 0.20,
    chrominanceShift: { amberYellow: 0.06, greenTint: 0.10 },
    grain: { enabled: true, scale: 0.09, intensity: 0.5, luminanceWeight: 0.6 },
    chromaticAberration: { enabled: true, redShift: 3.5, blueShift: -2.5 },
    vignette: { intensity: 0.30, cornerBlur: 0.15, cornerBlurRadius: 3 },
    halation: { enabled: true, threshold: 0.78, blurRadius: 20, intensity: 0.4 },
    antiClarity: { enabled: true, radius: 2, sigmaSpace: 3, sigmaColor: 28 },
    gateFlicker: { enabled: true, intensity: 0.05 },
    saturation: 0.7,
    extraPerPreset: 'none',
  },
  kodak: {
    name: 'Kodak',
    emoji: '🎞️',
    cssPreview: 'sepia(0.1) contrast(1.08) brightness(1.05) saturate(1.5)',
    toneCurve: { blackLift: 5, whiteCrush: 252 },
    contrastReduce: 0.18,
    chrominanceShift: { amberYellow: 0.12, greenTint: 0.02 },
    grain: { enabled: true, scale: 0.10, intensity: 0.25, luminanceWeight: 0.4 },
    chromaticAberration: { enabled: false, redShift: 0, blueShift: 0 },
    vignette: { intensity: 0.15, cornerBlur: 0.08, cornerBlurRadius: 2 },
    halation: { enabled: true, threshold: 0.82, blurRadius: 16, intensity: 0.3 },
    antiClarity: { enabled: false, radius: 0, sigmaSpace: 0, sigmaColor: 0 },
    gateFlicker: { enabled: false, intensity: 0 },
    saturation: 1.45,
    extraPerPreset: 'none',
  },
};

/* ═══════════════════════════════════════════════════════════
   PIPELINE STAGES
   ═══════════════════════════════════════════════════════════ */

/** Stage 1: Chromatic Aberration — radial RGB channel displacement */
function applyChromaticAberration(
  src: Uint8ClampedArray, w: number, h: number,
  redShift: number, blueShift: number
): Uint8ClampedArray {
  if (redShift === 0 && blueShift === 0) return src;
  const out = new Uint8ClampedArray(src.length);
  const cx = w / 2, cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxDist;

      // Red channel — shift outward from center
      const rShift = redShift * normDist;
      const rx = Math.round(x + (dx / dist) * rShift);
      const ry = Math.round(y + (dy / dist) * rShift);
      const rIdx = (clamp(ry, 0, h - 1) * w + clamp(rx, 0, w - 1)) * 4;
      out[idx] = src[rIdx];

      // Green channel — no shift (anchor)
      out[idx + 1] = src[idx + 1];

      // Blue channel — shift inward
      const bShift = blueShift * normDist;
      const bx = Math.round(x - (dx / dist) * bShift);
      const by = Math.round(y - (dy / dist) * bShift);
      const bIdx = (clamp(by, 0, h - 1) * w + clamp(bx, 0, w - 1)) * 4;
      out[idx + 2] = src[bIdx];

      out[idx + 3] = 255;
    }
  }
  return out;
}

/** Stage 2: Tone Curve Distortion — "Matte Effect" (lift blacks, crush whites) */
function applyToneCurve(
  data: Uint8ClampedArray,
  blackLift: number, whiteCrush: number
): void {
  // Build a 256-entry LUT for speed
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    // Normalize input 0..255 → 0..1
    const t = i / 255;
    // Apply tone curve: map black→blackLift, white→whiteCrush
    const lifted = blackLift + t * (whiteCrush - blackLift);
    lut[i] = clamp(Math.round(lifted), 0, 255);
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
}

/** Stage 3: Contrast Flattening — reduce global contrast */
function applyContrastReduction(
  data: Uint8ClampedArray, reduction: number
): void {
  if (reduction <= 0) return;
  // factor: 1.0 = no change, 0.65 = 35% reduction
  const factor = 1 - reduction;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = clamp(Math.round(128 + (data[i] - 128) * factor), 0, 255);
    data[i + 1] = clamp(Math.round(128 + (data[i + 1] - 128) * factor), 0, 255);
    data[i + 2] = clamp(Math.round(128 + (data[i + 2] - 128) * factor), 0, 255);
  }
}

/** Stage 4: Chrominance Shift — amber/yellow + green tint in shadows */
function applyChrominanceShift(
  data: Uint8ClampedArray,
  amberYellow: number, greenTint: number
): void {
  if (amberYellow <= 0 && greenTint <= 0) return;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = (r + g + b) / 3;
    const shadowFactor = 1 - (lum / 255); // 1 in shadows, 0 in highlights

    // Amber/yellow shift: boost R, slightly boost G, reduce B
    r = r + amberYellow * 40;
    g = g + amberYellow * 15;
    b = b - amberYellow * 25;

    // Green tint in midtones and shadows
    g = g + greenTint * shadowFactor * 30;
    r = r - greenTint * shadowFactor * 8;

    data[i]     = clamp(Math.round(r), 0, 255);
    data[i + 1] = clamp(Math.round(g), 0, 255);
    data[i + 2] = clamp(Math.round(b), 0, 255);
  }
}

/** Stage 5: Saturation control */
function applySaturation(data: Uint8ClampedArray, sat: number): void {
  if (sat === 1) return;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i]     = clamp(Math.round(gray + (r - gray) * sat), 0, 255);
    data[i + 1] = clamp(Math.round(gray + (g - gray) * sat), 0, 255);
    data[i + 2] = clamp(Math.round(gray + (b - gray) * sat), 0, 255);
  }
}

/** Stage 5b: B&W mode */
function applyBlackAndWhite(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = clamp(Math.round(gray), 0, 255);
  }
}

/** Stage 6: Anti-Clarity — simplified bilateral blur (softens fine texture) */
function applyAntiClarity(
  data: Uint8ClampedArray, w: number, h: number,
  radius: number, sigmaSpace: number, sigmaColor: number
): void {
  if (radius <= 0) return;
  const src = new Uint8ClampedArray(data);
  const twoSigmaSpace2 = 2 * sigmaSpace * sigmaSpace;
  const twoSigmaColor2 = 2 * sigmaColor * sigmaColor;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;
      const cR = src[idx], cG = src[idx + 1], cB = src[idx + 2];

      for (let dy = -radius; dy <= radius; dy++) {
        const ny = clamp(y + dy, 0, h - 1);
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = clamp(x + dx, 0, w - 1);
          const nIdx = (ny * w + nx) * 4;
          const nR = src[nIdx], nG = src[nIdx + 1], nB = src[nIdx + 2];

          // Spatial weight
          const spatialDist2 = dx * dx + dy * dy;
          const wSpatial = Math.exp(-spatialDist2 / twoSigmaSpace2);

          // Color/range weight
          const colorDist2 = (nR - cR) ** 2 + (nG - cG) ** 2 + (nB - cB) ** 2;
          const wColor = Math.exp(-colorDist2 / twoSigmaColor2);

          const weight = wSpatial * wColor;
          sumR += nR * weight;
          sumG += nG * weight;
          sumB += nB * weight;
          sumW += weight;
        }
      }

      data[idx]     = clamp(Math.round(sumR / sumW), 0, 255);
      data[idx + 1] = clamp(Math.round(sumG / sumW), 0, 255);
      data[idx + 2] = clamp(Math.round(sumB / sumW), 0, 255);
    }
  }
}

/** Stage 7: Procedural Film Grain — Perlin noise, luminance-dependent */
function applyFilmGrain(
  data: Uint8ClampedArray, w: number, h: number,
  scale: number, intensity: number, luminanceWeight: number,
  frameSeed: number = 0
): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const lum = (r + g + b) / (3 * 255); // 0..1

      // Perlin noise sample — multiple octaves for organic feel
      const nx = x * scale + frameSeed * 0.1;
      const ny = y * scale + frameSeed * 0.07;
      let noise = perlin2D(nx, ny);
      noise += 0.5 * perlin2D(nx * 2.3, ny * 2.3);
      noise += 0.25 * perlin2D(nx * 4.7, ny * 4.7);
      noise /= 1.75; // normalize to -1..1

      // Dynamic opacity: higher in midtones/shadows, lower in highlights
      const grainOpacity = intensity * (0.3 + 0.7 * luminanceWeight * (1 - lum));
      const grainValue = noise * grainOpacity * 60; // scale to pixel range

      data[idx]     = clamp(Math.round(r + grainValue), 0, 255);
      data[idx + 1] = clamp(Math.round(g + grainValue), 0, 255);
      data[idx + 2] = clamp(Math.round(b + grainValue), 0, 255);
    }
  }
}

/** Stage 8: Halation — dreamy glow around highlights */
function applyHalation(
  data: Uint8ClampedArray, w: number, h: number,
  threshold: number, blurRadius: number, blendIntensity: number
): void {
  if (blurRadius <= 0) return;

  // Extract highlight mask
  const highlightMask = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
    if (lum > threshold) {
      highlightMask[i] = (lum - threshold) / (1 - threshold); // 0..1
    }
  }

  // Box blur the highlight mask (3 passes approximates Gaussian)
  const blurred = new Float32Array(highlightMask);
  for (let pass = 0; pass < 3; pass++) {
    boxBlur1D(blurred, w, h, blurRadius, true);  // horizontal
    boxBlur1D(blurred, w, h, blurRadius, false); // vertical
  }

  // Screen blend: result = 1 - (1 - base) * (1 - blend)
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const glow = blurred[i] * blendIntensity;
    // Screen blend mode
    data[idx]     = clamp(Math.round(255 - (255 - data[idx]) * (255 - glow * 255)), 0, 255);
    data[idx + 1] = clamp(Math.round(255 - (255 - data[idx + 1]) * (255 - glow * 255)), 0, 255);
    data[idx + 2] = clamp(Math.round(255 - (255 - data[idx + 2]) * (255 - glow * 255)), 0, 255);
  }
}

/** 1D box blur pass (horizontal or vertical) */
function boxBlur1D(
  data: Float32Array, w: number, h: number,
  radius: number, horizontal: boolean
): void {
  const temp = new Float32Array(w * h);
  const r = Math.round(radius);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, count = 0;
      if (horizontal) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = clamp(x + dx, 0, w - 1);
          sum += data[y * w + nx];
          count++;
        }
      } else {
        for (let dy = -r; dy <= r; dy++) {
          const ny = clamp(y + dy, 0, h - 1);
          sum += data[ny * w + x];
          count++;
        }
      }
      temp[y * w + x] = sum / count;
    }
  }

  // Copy back
  for (let i = 0; i < data.length; i++) {
    data[i] = temp[i];
  }
}

/** Stage 9: Vignette — radial darkening + corner softness */
function applyVignette(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  intensity: number, cornerBlurFraction: number, cornerBlurRadius: number
): void {
  // Radial darkening
  if (intensity > 0) {
    const gradient = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.25,
      w / 2, h / 2, w * 0.78
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // Corner softness — radial Gaussian blur on outer region
  if (cornerBlurFraction > 0 && cornerBlurRadius > 0) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const blurStart = (1 - cornerBlurFraction) * maxDist;
    const r = Math.round(cornerBlurRadius);

    // Simple box blur only on corner pixels
    const src = new Uint8ClampedArray(data);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blurStart) continue;

        // Blend factor: 0 at blurStart, 1 at edges
        const blurFactor = Math.min(1, (dist - blurStart) / (maxDist - blurStart));
        const idx = (y * w + x) * 4;
        let sumR = 0, sumG = 0, sumB = 0, count = 0;

        for (let dy2 = -r; dy2 <= r; dy2++) {
          for (let dx2 = -r; dx2 <= r; dx2++) {
            const nx = clamp(x + dx2, 0, w - 1);
            const ny = clamp(y + dy2, 0, h - 1);
            const nIdx = (ny * w + nx) * 4;
            sumR += src[nIdx];
            sumG += src[nIdx + 1];
            sumB += src[nIdx + 2];
            count++;
          }
        }

        // Blend original with blurred
        data[idx]     = clamp(Math.round(src[idx] * (1 - blurFactor) + (sumR / count) * blurFactor), 0, 255);
        data[idx + 1] = clamp(Math.round(src[idx + 1] * (1 - blurFactor) + (sumG / count) * blurFactor), 0, 255);
        data[idx + 2] = clamp(Math.round(src[idx + 2] * (1 - blurFactor) + (sumB / count) * blurFactor), 0, 255);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

/** Gate Flicker — per-frame micro-exposure variation for video */
export function getGateFlickerEV(intensity: number): number {
  return (Math.random() - 0.5) * 2 * intensity;
}

/** Apply gate flicker as brightness adjustment */
export function applyGateFlicker(
  data: Uint8ClampedArray, ev: number
): void {
  // Convert EV to multiplier: 2^EV, but for small EV use linear approx
  const multiplier = 1 + ev * 0.5; // linear approx for small EV
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = clamp(Math.round(data[i] * multiplier), 0, 255);
    data[i + 1] = clamp(Math.round(data[i + 1] * multiplier), 0, 255);
    data[i + 2] = clamp(Math.round(data[i + 2] * multiplier), 0, 255);
  }
}

/** Add vintage date stamp (like old disposable cameras) */
function addDateStamp(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const now = new Date();
  const dateStr = `${now.getFullYear()}'${String(now.getMonth() + 1).padStart(2, '0')}'${String(now.getDate()).padStart(2, '0')}`;
  ctx.save();
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = 'rgba(255, 80, 80, 0.75)';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 1;
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, w - 12, h - 12);
  ctx.restore();
}

/** Add VHS tracking lines artifact */
function addVHSArtifacts(
  ctx: CanvasRenderingContext2D, w: number, h: number
): void {
  // Random horizontal tracking glitch lines
  ctx.save();
  const numLines = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numLines; i++) {
    const y = Math.floor(Math.random() * h);
    const lineH = 1 + Math.floor(Math.random() * 3);
    const shift = (Math.random() - 0.5) * 20;

    // Shift a horizontal strip
    const strip = ctx.getImageData(0, y, w, lineH);
    ctx.putImageData(strip, shift, y);
  }

  // Occasional color bleed bar
  if (Math.random() > 0.7) {
    const barY = Math.floor(Math.random() * h);
    const barH = 2 + Math.floor(Math.random() * 8);
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,0,100' : '0,200,255'}, 0.08)`;
    ctx.fillRect(0, barY, w, barH);
  }
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   MAIN PIPELINE — Full processing for photo capture
   ═══════════════════════════════════════════════════════════ */

export function processFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  presetKey: string,
  options?: {
    isVideoFrame?: boolean;
    frameIndex?: number;
    addStamp?: boolean;
  }
): void {
  const config = PIPELINE_PRESETS[presetKey];
  if (!config) return;

  const { isVideoFrame = false, frameIndex = 0, addStamp = false } = options || {};

  let imageData = ctx.getImageData(0, 0, w, h);
  let data = imageData.data;

  // ── Stage 1: Chromatic Aberration ──
  if (config.chromaticAberration.enabled) {
    data = applyChromaticAberration(
      data, w, h,
      config.chromaticAberration.redShift,
      config.chromaticAberration.blueShift
    ) as Uint8ClampedArray<ArrayBuffer>;
    imageData = new ImageData(data, w, h);
  }

  // ── Stage 2: Tone Curve Distortion (Matte Effect) ──
  applyToneCurve(data, config.toneCurve.blackLift, config.toneCurve.whiteCrush);

  // ── Stage 3: Contrast Flattening ──
  applyContrastReduction(data, config.contrastReduce);

  // ── Stage 4: Chrominance Shift ──
  applyChrominanceShift(data, config.chrominanceShift.amberYellow, config.chrominanceShift.greenTint);

  // ── Stage 5: Saturation / B&W ──
  if (config.extraPerPreset === 'bw') {
    applyBlackAndWhite(data);
  } else {
    applySaturation(data, config.saturation);
  }

  // ── Stage 6: Anti-Clarity (Bilateral Blur) ──
  if (config.antiClarity.enabled && config.antiClarity.radius > 0) {
    // For performance, only apply bilateral blur at reduced resolution or skip on large images
    const pixelCount = w * h;
    if (pixelCount <= 921600) { // up to ~1280x720
      applyAntiClarity(
        data, w, h,
        config.antiClarity.radius,
        config.antiClarity.sigmaSpace,
        config.antiClarity.sigmaColor
      );
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // ── Stage 7: Film Grain (Perlin) ──
  if (config.grain.enabled) {
    imageData = ctx.getImageData(0, 0, w, h);
    applyFilmGrain(
      imageData.data, w, h,
      config.grain.scale,
      config.grain.intensity,
      config.grain.luminanceWeight,
      isVideoFrame ? frameIndex : 0
    );
    ctx.putImageData(imageData, 0, 0);
  }

  // ── Stage 8: Halation (Glow) ──
  if (config.halation.enabled) {
    imageData = ctx.getImageData(0, 0, w, h);
    applyHalation(
      imageData.data, w, h,
      config.halation.threshold,
      config.halation.blurRadius,
      config.halation.intensity
    );
    ctx.putImageData(imageData, 0, 0);
  }

  // ── Stage 9: Vignette + Corner Softness ──
  applyVignette(ctx, w, h, config.vignette.intensity, config.vignette.cornerBlur, config.vignette.cornerBlurRadius);

  // ── Gate Flicker (video mode) ──
  if (isVideoFrame && config.gateFlicker.enabled) {
    const ev = getGateFlickerEV(config.gateFlicker.intensity);
    imageData = ctx.getImageData(0, 0, w, h);
    applyGateFlicker(imageData.data, ev);
    ctx.putImageData(imageData, 0, 0);
  }

  // ── VHS Artifacts ──
  if (presetKey === 'vhs') {
    addVHSArtifacts(ctx, w, h);
  }

  // ── Date Stamp ──
  if (addStamp || presetKey === 'polaroid' || presetKey === 'sepia70s') {
    addDateStamp(ctx, w, h);
  }
}

/* ═══════════════════════════════════════════════════════════
   LIGHTWEIGHT PREVIEW — for real-time canvas preview
   Skips heavy stages (bilateral blur, halation, corner blur)
   ═══════════════════════════════════════════════════════════ */

export function processPreviewFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  presetKey: string,
  frameIndex: number = 0
): void {
  const config = PIPELINE_PRESETS[presetKey];
  if (!config) return;

  let imageData = ctx.getImageData(0, 0, w, h);
  let data = imageData.data;

  // Chromatic aberration (reduced)
  if (config.chromaticAberration.enabled) {
    data = applyChromaticAberration(
      data, w, h,
      config.chromaticAberration.redShift * 0.6,
      config.chromaticAberration.blueShift * 0.6
    ) as Uint8ClampedArray<ArrayBuffer>;
    imageData = new ImageData(data, w, h);
  }

  // Tone curve
  applyToneCurve(data, config.toneCurve.blackLift, config.toneCurve.whiteCrush);

  // Contrast reduction
  applyContrastReduction(data, config.contrastReduce);

  // Chrominance shift
  applyChrominanceShift(data, config.chrominanceShift.amberYellow, config.chrominanceShift.greenTint);

  // Saturation / B&W
  if (config.extraPerPreset === 'bw') {
    applyBlackAndWhite(data);
  } else {
    applySaturation(data, config.saturation);
  }

  ctx.putImageData(imageData, 0, 0);

  // Film grain (simplified — faster scale)
  if (config.grain.enabled) {
    imageData = ctx.getImageData(0, 0, w, h);
    applyFilmGrain(
      imageData.data, w, h,
      config.grain.scale * 0.7,
      config.grain.intensity * 0.8,
      config.grain.luminanceWeight,
      frameIndex
    );
    ctx.putImageData(imageData, 0, 0);
  }

  // Simple vignette (no corner blur — too expensive for preview)
  if (config.vignette.intensity > 0) {
    const gradient = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.25,
      w / 2, h / 2, w * 0.78
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${config.vignette.intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
}

/* ──────────── HELPERS ──────────── */
function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}