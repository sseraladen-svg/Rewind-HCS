import { chromium } from 'playwright-core';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = '/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const FRAMES_DIR = '/home/z/my-project/download/frames_v6';
const OUTPUT = '/home/z/my-project/download/rewind-app-demo.mp4';
const W = 390, H = 844;
const FPS = 4; // 4 frames per second = 0.25s per frame

// Clean frames dir
if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameIdx = 0;
const capture = async (page, count = 1) => {
  for (let i = 0; i < count; i++) {
    await page.screenshot({ path: `${FRAMES_DIR}/frame_${String(frameIdx).padStart(5, '0')}.png`, fullPage: false });
    frameIdx++;
    if (i < count - 1) await new Promise(r => setTimeout(r, 1000 / FPS * 1000));
  }
};

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const copyAsFrames = (srcPath, count) => {
  const data = fs.readFileSync(srcPath);
  for (let i = 0; i < count; i++) {
    fs.writeFileSync(`${FRAMES_DIR}/frame_${String(frameIdx).padStart(5, '0')}.png`, data);
    frameIdx++;
  }
};

const generateTitleCard = (title, subtitle, outPath) => {
  // We'll generate via Node canvas or just use a simple HTML screenshot
  // For now, create via HTML in the browser
  return `
    data:text/html,<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a14;flex-direction:column;font-family:serif;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(to bottom, #b050c8, transparent)"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top, #b050c8, transparent)"></div>
    <h1 style="color:#ffd896;font-size:48px;margin:0;text-shadow:0 0 20px #b050c8">${title}</h1>
    <p style="color:#b0b0c8;font-size:18px;margin-top:16px">${subtitle}</p>
    </body></html>
  `;
};

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

  // ============ TITLE CARD ============
  console.log('Creating title card...');
  await page.goto(generateTitleCard('REWIND', 'A Nostalgia App Experience'));
  await wait(500);
  for (let i = 0; i < 24; i++) await capture(page, 1); // 6s title

  // ============ CRT BOOT SCREEN ============
  console.log('Loading app (CRT boot)...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(500);
  for (let i = 0; i < 30; i++) { // 7.5s boot
    await capture(page, 1);
    await wait(250);
  }

  // Wait for main UI to appear (boot screen finishes)
  console.log('Waiting for main UI...');
  try {
    await page.waitForSelector('[class*="tab"]', { timeout: 15000 });
  } catch {
    console.log('Tab selector not found, waiting anyway...');
  }
  await wait(2000);
  await capture(page, 4); // 1s of main UI

  // Helper: click a tab button
  const clickTab = async (tabLabel) => {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.toLowerCase().includes(tabLabel.toLowerCase())) {
        await tab.click();
        await wait(800);
        return true;
      }
    }
    return false;
  };

  // ============ REEL TAB (default) ============
  console.log('Capturing Reel tab...');
  await capture(page, 8); // 2s
  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 8); // 2s
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ============ MOVIES TAB ============
  console.log('Capturing Movies tab...');
  await clickTab('movie');
  await capture(page, 8);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 8);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ============ JOURNAL TAB ============
  console.log('Capturing Journal tab...');
  await clickTab('journal');
  await capture(page, 8);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(500);
  await capture(page, 8);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ============ GAMES TAB ============
  console.log('Capturing Games tab...');
  await clickTab('game');
  await capture(page, 12); // 3s
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(500);
  await capture(page, 8);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // ============ CONTACTS TAB ============
  console.log('Capturing Contacts tab...');
  await clickTab('contact');
  await capture(page, 8); // folders view

  // Click Rotary Phone folder
  console.log('  Opening Rotary Phone...');
  const phoneBtn = await page.$('text=Rotary');
  if (phoneBtn) {
    await phoneBtn.click();
    await wait(800);
    await capture(page, 12); // 3s
    // Click back
    const backBtn = await page.$('text=Back');
    if (backBtn) { await backBtn.click(); await wait(500); }
  }

  // Click Voice Messages folder
  console.log('  Opening Voice Messages...');
  const voiceBtn = await page.$('text=Voice');
  if (voiceBtn) {
    await voiceBtn.click();
    await wait(800);
    await capture(page, 10); // 2.5s
    const backBtn2 = await page.$('text=Back');
    if (backBtn2) { await backBtn2.click(); await wait(500); }
  }

  // Click Retro Chat folder
  console.log('  Opening Retro Chat...');
  const chatBtn = await page.$('text=Chat');
  if (chatBtn) {
    await chatBtn.click();
    await wait(1500); // dial-up animation
    for (let i = 0; i < 16; i++) { // 4s of dial-up + chat
      await capture(page, 1);
      await wait(250);
    }
    const backBtn3 = await page.$('text=Back');
    if (backBtn3) { await backBtn3.click(); await wait(500); }
  }

  // ============ MEMORY TAB ============
  console.log('Capturing Memory tab...');
  await clickTab('memory');
  await capture(page, 12);

  // ============ TIMELINE TAB ============
  console.log('Capturing Timeline tab...');
  await clickTab('timeline');
  await capture(page, 8);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(500);
  await capture(page, 8);

  // ============ CAMERA OVERLAY ============
  console.log('Opening Camera overlay...');
  // Click camera icon in header
  const cameraIcon = await page.$('[class*="camera"], svg.lucide-camera');
  if (cameraIcon) {
    await cameraIcon.click();
    await wait(1000);
    await capture(page, 12); // 3s
    // Close
    const closeBtn = await page.$('text=Close, text=X');
    const escKey = page.keyboard.press('Escape');
    await escKey;
    await wait(500);
  }

  // ============ BACK TO REEL ============
  console.log('Back to Reel...');
  await clickTab('reel');
  await capture(page, 8);

  // ============ END CARD ============
  console.log('Creating end card...');
  await page.goto(generateTitleCard('Made with \u2764', 'Rewind App \u2022 2025'));
  await wait(500);
  for (let i = 0; i < 24; i++) await capture(page, 1); // 6s

  await browser.close();
  console.log(`Captured ${frameIdx} frames total.`);

  // ============ COMPILE VIDEO ============
  console.log('Compiling video with ffmpeg...');
  const duration = frameIdx / FPS;
  console.log(`Expected duration: ${duration.toFixed(1)}s (${(duration/60).toFixed(1)} min)`);

  // Check sequential integrity
  for (let i = 0; i < frameIdx; i++) {
    const f = `${FRAMES_DIR}/frame_${String(i).padStart(5, '0')}.png`;
    if (!fs.existsSync(f)) {
      console.error(`MISSING FRAME: ${f}`);
      // Duplicate last existing frame
      const prev = `${FRAMES_DIR}/frame_${String(Math.max(0, i-1)).padStart(5, '0')}.png`;
      if (fs.existsSync(prev)) fs.copyFileSync(prev, f);
    }
  }
  console.log('All frames verified.');

  const fadeOutStart = Math.max(0, duration - 2);
  const cmd = `
    ffmpeg -y -framerate ${FPS} -i ${FRAMES_DIR}/frame_%05d.png \
    -c:v libx264 -pix_fmt yuv420p -crf 23 -preset fast \
    -vf "scale=780:1688:flags=lanczos,fade=t=in:st=0:d=1.5,fade=t=out:st=${fadeOutStart}:d=2" \
    -movflags +faststart \
    ${OUTPUT}
  `;

  try {
    execSync(cmd, { stdio: 'inherit', timeout: 120000 });
    console.log(`\nVideo saved to: ${OUTPUT}`);
    const size = fs.statSync(OUTPUT).size;
    console.log(`File size: ${(size / 1048576).toFixed(1)} MB`);
  } catch (e) {
    console.error('ffmpeg failed:', e.message);
  }

  // Cleanup frames
  // fs.rmSync(FRAMES_DIR, { recursive: true });
  // console.log('Cleaned up frames.');
})();
