const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');

const CHROME = '/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const FRAMES_DIR = '/home/z/my-project/download/frames_v6';
const OUTPUT = '/home/z/my-project/download/rewind-app-demo.mp4';
const W = 390, H = 844;
const FPS = 4;

// Clean frames dir
if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameIdx = 0;
const capture = async (page, count = 1) => {
  for (let i = 0; i < count; i++) {
    await page.screenshot({ path: `${FRAMES_DIR}/frame_${String(frameIdx).padStart(5, '0')}.png`, fullPage: false });
    frameIdx++;
    if (i < count - 1) await new Promise(r => setTimeout(r, 250));
  }
};

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const titleHTML = (title, subtitle) =>
  `data:text/html,<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:%230a0a14;flex-direction:column;font-family:Georgia,serif;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(to%20bottom,%20%23b050c8,%20transparent)"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to%20top,%20%23b050c8,%20transparent)"></div>
    <h1 style="color:%23ffd896;font-size:48px;margin:0;text-shadow:0%200%2020px%20%23b050c8">${title}</h1>
    <p style="color:%23b0b0c8;font-size:18px;margin-top:16px">${subtitle}</p>
    </body></html>`;

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2
  });
  const page = await ctx.newPage();

  // ===== TITLE CARD (6s = 24 frames) =====
  console.log('[1/12] Title card...');
  await page.goto(titleHTML('REWIND', 'A Nostalgia App Experience'));
  await wait(500);
  for (let i = 0; i < 24; i++) await capture(page, 1);

  // ===== CRT BOOT (8s = 32 frames) =====
  console.log('[2/12] CRT boot screen...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(500);
  for (let i = 0; i < 32; i++) {
    await capture(page, 1);
    await wait(200);
  }

  // Wait for main UI
  console.log('Waiting for main UI to load...');
  await wait(8000);
  await capture(page, 4);

  // Tab clicker
  const clickTab = async (label) => {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const txt = await btn.textContent();
      if (txt && txt.toLowerCase().includes(label.toLowerCase())) {
        await btn.click();
        await wait(1000);
        return true;
      }
    }
    return false;
  };

  // ===== REEL (6s = 24 frames) =====
  console.log('[3/12] Reel tab...');
  await capture(page, 12);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 12);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ===== MOVIES (6s = 24 frames) =====
  console.log('[4/12] Movies tab...');
  await clickTab('movie');
  await capture(page, 12);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 12);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ===== JOURNAL (5s = 20 frames) =====
  console.log('[5/12] Journal tab...');
  await clickTab('journal');
  await capture(page, 10);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(500);
  await capture(page, 10);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ===== GAMES (5s = 20 frames) =====
  console.log('[6/12] Games tab...');
  await clickTab('game');
  await capture(page, 12);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(500);
  await capture(page, 8);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ===== CONTACTS - FOLDERS VIEW (3s) =====
  console.log('[7/12] Contacts tab...');
  await clickTab('contact');
  await capture(page, 12);

  // Rotary Phone subfolder
  console.log('  -> Rotary Phone...');
  const phoneEl = await page.$('text=Rotary');
  if (phoneEl) {
    await phoneEl.click(); await wait(1000);
    await capture(page, 12);
    const back = await page.$('text=Back');
    if (back) { await back.click(); await wait(600); }
  } else { console.log('  Rotary btn not found'); }

  // Voice Messages subfolder
  console.log('  -> Voice Messages...');
  const voiceEl = await page.$('text=Voice');
  if (voiceEl) {
    await voiceEl.click(); await wait(1000);
    await capture(page, 10);
    const back2 = await page.$('text=Back');
    if (back2) { await back2.click(); await wait(600); }
  } else { console.log('  Voice btn not found'); }

  // Retro Chat subfolder
  console.log('  -> Retro Chat (dial-up)...');
  const chatEl = await page.$('text=Chat');
  if (chatEl) {
    await chatEl.click();
    // Capture dial-up animation over 5 seconds
    for (let i = 0; i < 20; i++) {
      await wait(250);
      await capture(page, 1);
    }
    const back3 = await page.$('text=Back');
    if (back3) { await back3.click(); await wait(600); }
  } else { console.log('  Chat btn not found'); }

  // ===== MEMORY (4s = 16 frames) =====
  console.log('[8/12] Memory tab...');
  await clickTab('memory');
  await capture(page, 16);

  // ===== TIMELINE (5s = 20 frames) =====
  console.log('[9/12] Timeline tab...');
  await clickTab('timeline');
  await capture(page, 10);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 10);

  // ===== CAMERA OVERLAY (3s = 12 frames) =====
  console.log('[10/12] Camera overlay...');
  const camBtn = await page.$('button:has(svg.lucide-camera), button:has([data-lucide="camera"])');
  if (!camBtn) {
    // Try clicking by evaluating
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.querySelector('[data-lucide="camera"]') || b.innerHTML.includes('camera')) {
          b.click(); break;
        }
      }
    });
  } else {
    await camBtn.click();
  }
  await wait(1000);
  await capture(page, 12);
  await page.keyboard.press('Escape');
  await wait(500);

  // ===== BACK TO REEL (2s) =====
  console.log('[11/12] Back to Reel...');
  await clickTab('reel');
  await capture(page, 8);

  // ===== END CARD (6s = 24 frames) =====
  console.log('[12/12] End card...');
  await page.goto(titleHTML('Made with \u2764', 'Rewind App \u2022 2025'));
  await wait(500);
  for (let i = 0; i < 24; i++) await capture(page, 1);

  await browser.close();
  console.log(`\nCaptured ${frameIdx} frames.`);

  // ===== VERIFY FRAMES =====
  console.log('Verifying frames...');
  for (let i = 0; i < frameIdx; i++) {
    const f = `${FRAMES_DIR}/frame_${String(i).padStart(5, '0')}.png`;
    if (!fs.existsSync(f)) {
      console.warn(`Filling gap at frame ${i}`);
      const prev = `${FRAMES_DIR}/frame_${String(Math.max(0, i-1)).padStart(5, '0')}.png`;
      if (fs.existsSync(prev)) fs.copyFileSync(prev, f);
      else { console.error(`Cannot fill gap at ${i}, no previous frame`); process.exit(1); }
    }
  }
  console.log('All frames OK.');

  // ===== COMPILE WITH FFMPEG =====
  const duration = frameIdx / FPS;
  const fadeOutStart = Math.max(0, duration - 2);
  console.log(`Compiling: ${duration.toFixed(1)}s video at ${FPS}fps...`);

  const cmd = [
    'ffmpeg', '-y',
    `-framerate`, String(FPS),
    `-i`, `${FRAMES_DIR}/frame_%05d.png`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'fast',
    '-vf', `scale=780:1688:flags=lanczos,fade=t=in:st=0:d=1.5,fade=t=out:st=${fadeOutStart}:d=2`,
    '-movflags', '+faststart',
    OUTPUT
  ];

  try {
    execSync(cmd.join(' '), { stdio: 'inherit', timeout: 180000 });
    const size = fs.statSync(OUTPUT).size;
    console.log(`\nDONE! ${OUTPUT}`);
    console.log(`Size: ${(size/1048576).toFixed(1)} MB | Duration: ${duration.toFixed(1)}s`);
  } catch (e) {
    console.error('ffmpeg error:', e.message);
    process.exit(1);
  }
})();
