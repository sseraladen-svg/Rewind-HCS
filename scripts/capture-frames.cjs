const { chromium } = require('playwright-core');
const fs = require('fs');

const CHROME = '/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const DIR = '/home/z/my-project/download/frames_v6';
const W = 390, H = 844;
let idx = 0;

const cap = async (page, n) => {
  for (let i = 0; i < n; i++) {
    await page.screenshot({ path: `${DIR}/f${String(idx).padStart(5,'0')}.png` });
    idx++;
    if (i < n-1) await new Promise(r => setTimeout(r, 200));
  }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const titleUrl = (t, s) => `data:text/html,<!DOCTYPE html><html><head><meta charset=utf-8></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:%230a0a14;flex-direction:column;font-family:Georgia,serif"><div style="position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(%20to%20bottom,%20%23b050c8,%20transparent)"></div><div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(%20to%20top,%20%23b050c8,%20transparent)"></div><h1 style="color:%23ffd896;font-size:48px;margin:0;text-shadow:0%200%2020px%20%23b050c8">${t}</h1><p style="color:%23b0b0c8;font-size:18px;margin-top:16px">${s}</p></body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // 1. Title (20f = 5s)
  console.log('1/12 Title...');
  await page.goto(titleUrl('REWIND','A Nostalgia App Experience'));
  await wait(300); await cap(page, 20);

  // 2. Load app & capture boot + main UI (40f = 10s)
  console.log('2/12 Loading app...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 20000 });
  for (let i = 0; i < 40; i++) { await cap(page, 1); await wait(250); }

  // Helper
  const clickTab = async (label) => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await b.textContent();
      if (t && t.toLowerCase().includes(label)) { await b.click(); await wait(800); return; }
    }
  };

  // 3. Reel (16f = 4s)
  console.log('3/12 Reel...'); await cap(page, 16);
  await page.evaluate(() => window.scrollBy(0,400)); await wait(400); await cap(page, 12);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // 4. Movies (16f = 4s)
  console.log('4/12 Movies...'); await clickTab('movie'); await cap(page, 16);
  await page.evaluate(() => window.scrollBy(0,400)); await wait(400); await cap(page, 12);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // 5. Journal (16f = 4s)
  console.log('5/12 Journal...'); await clickTab('journal'); await cap(page, 16);
  await page.evaluate(() => window.scrollBy(0,300)); await wait(400); await cap(page, 12);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // 6. Games (16f = 4s)
  console.log('6/12 Games...'); await clickTab('game'); await cap(page, 16);
  await page.evaluate(() => window.scrollBy(0,300)); await wait(400); await cap(page, 12);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // 7. Contacts folders (8f)
  console.log('7/12 Contacts...'); await clickTab('contact'); await cap(page, 8);

  // 7a. Rotary Phone
  console.log('  Rotary...');
  const p = await page.$('text=Rotary');
  if (p) { await p.click(); await wait(800); await cap(page, 12);
    const b = await page.$('text=Back'); if(b){await b.click();await wait(500);} }

  // 7b. Voice
  console.log('  Voice...');
  const v = await page.$('text=Voice');
  if (v) { await v.click(); await wait(800); await cap(page, 10);
    const b2 = await page.$('text=Back'); if(b2){await b2.click();await wait(500);} }

  // 7c. Chat (with dial-up)
  console.log('  Chat...');
  const c = await page.$('text=Chat');
  if (c) { await c.click();
    for (let i=0;i<20;i++){await wait(250);await cap(page,1);}
    const b3 = await page.$('text=Back'); if(b3){await b3.click();await wait(500);} }

  // 8. Memory (12f = 3s)
  console.log('8/12 Memory...'); await clickTab('memory'); await cap(page, 12);

  // 9. Timeline (16f = 4s)
  console.log('9/12 Timeline...'); await clickTab('timeline'); await cap(page, 8);
  await page.evaluate(() => window.scrollBy(0,400)); await wait(400); await cap(page, 12);

  // 10. Camera overlay
  console.log('10/12 Camera...');
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if (b.querySelector('[data-lucide="camera"]')) b.click();
    });
  });
  await wait(1000); await cap(page, 12);
  await page.keyboard.press('Escape'); await wait(500);

  // 11. Back to Reel (8f)
  console.log('11/12 Back to Reel...'); await clickTab('reel'); await cap(page, 8);

  // 12. End card (20f = 5s)
  console.log('12/12 End card...');
  await page.goto(titleUrl('Made with \u2764','Rewind App \u2022 2025'));
  await wait(300); await cap(page, 20);

  await browser.close();
  console.log(`DONE: ${idx} frames captured`);
  fs.writeFileSync(`${DIR}/count.txt`, String(idx));
})();