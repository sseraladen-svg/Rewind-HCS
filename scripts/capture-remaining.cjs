const { chromium } = require('playwright-core');
const fs = require('fs');

const CHROME = '/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const DIR = '/home/z/my-project/download/frames_v6';
let idx = 252; // continue from where we left off

const cap = async (page, n) => {
  for (let i = 0; i < n; i++) {
    await page.screenshot({ path: `${DIR}/f${String(idx).padStart(5,'0')}.png` });
    idx++;
    if (i < n-1) await new Promise(r => setTimeout(r, 150));
  }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // Skip boot - go straight to app
  console.log('Loading app (skip boot)...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await wait(8000); // wait for boot to finish
  console.log('Boot done, navigating tabs...');

  const clickTab = async (label) => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await b.textContent();
      if (t && t.toLowerCase().includes(label)) { await b.click(); await wait(600); return; }
    }
  };

  // Movies (scroll)
  console.log('Movies...'); await clickTab('movie'); await cap(page, 10);
  await page.evaluate(() => window.scrollBy(0,400)); await wait(300); await cap(page, 10);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // Journal
  console.log('Journal...'); await clickTab('journal'); await cap(page, 10);
  await page.evaluate(() => window.scrollBy(0,300)); await wait(300); await cap(page, 10);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // Games
  console.log('Games...'); await clickTab('game'); await cap(page, 12);
  await page.evaluate(() => window.scrollBy(0,300)); await wait(300); await cap(page, 10);
  await page.evaluate(() => window.scrollTo(0,0)); await wait(200);

  // Contacts folders
  console.log('Contacts...'); await clickTab('contact'); await cap(page, 8);

  // Rotary Phone
  console.log('  Rotary...');
  const p = await page.$('text=Rotary');
  if (p) { await p.click(); await wait(600); await cap(page, 10);
    const b = await page.$('text=Back'); if(b){await b.click();await wait(400);} }

  // Voice
  console.log('  Voice...');
  const v = await page.$('text=Voice');
  if (v) { await v.click(); await wait(600); await cap(page, 8);
    const b2 = await page.$('text=Back'); if(b2){await b2.click();await wait(400);} }

  // Chat (dial-up)
  console.log('  Chat...');
  const c = await page.$('text=Chat');
  if (c) { await c.click();
    for (let i=0;i<16;i++){await wait(200);await cap(page,1);}
    const b3 = await page.$('text=Back'); if(b3){await b3.click();await wait(400);} }

  // Memory
  console.log('Memory...'); await clickTab('memory'); await cap(page, 12);

  // Timeline
  console.log('Timeline...'); await clickTab('timeline'); await cap(page, 8);
  await page.evaluate(() => window.scrollBy(0,400)); await wait(300); await cap(page, 10);

  // Camera overlay
  console.log('Camera...');
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if (b.querySelector('[data-lucide="camera"]')) b.click();
    });
  });
  await wait(800); await cap(page, 10);
  await page.keyboard.press('Escape'); await wait(400);

  // Back to Reel
  console.log('Reel...'); await clickTab('reel'); await cap(page, 8);

  // End card
  console.log('End card...');
  const titleUrl = (t,s) => `data:text/html,<!DOCTYPE html><html><head><meta charset=utf-8></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:%230a0a14;flex-direction:column;font-family:Georgia,serif"><div style="position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(%20to%20bottom,%20%23b050c8,%20transparent)"></div><div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(%20to%20top,%20%23b050c8,%20transparent)"></div><h1 style="color:%23ffd896;font-size:48px;margin:0;text-shadow:0%200%2020px%20%23b050c8">${t}</h1><p style="color:%23b0b0c8;font-size:18px;margin-top:16px">${s}</p></body></html>`;
  await page.goto(titleUrl('Made with \u2764','Rewind App \u2022 2025'));
  await wait(300); await cap(page, 20);

  await browser.close();
  console.log(`DONE: total ${idx} frames`);
})();
