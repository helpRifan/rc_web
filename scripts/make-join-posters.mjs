// Captures the Join poster images: the reduced-motion still of the LiquidEther fluid, with the copy
// and header hidden, at 1440x900 and 390x844 (DPR 1), saved as WebP in public/join/.
// The still is seeded, so the poster and the live canvas's first frame are the same picture.
//
//   npm run build && node scripts/make-join-posters.mjs
//
// Re-run it whenever the fluid's values in JoinField change.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3160;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/join`)).ok) break;
    } catch {
      // not up yet
    }
    await sleep(300);
  }
  mkdirSync(join(ROOT, 'public', 'join'), { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  });
  for (const size of [{ name: '1440', width: 1440, height: 900 }, { name: '390', width: 390, height: 844 }]) {
    const page = await browser.newPage();
    await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`http://localhost:${PORT}/join`, { waitUntil: 'load' });
    await page.addStyleTag({ content: '[data-join-content],header,footer{visibility:hidden!important} picture{visibility:hidden!important}' });
    await page.waitForSelector('canvas', { timeout: 20000 });
    await sleep(2500); // the 150-step still is pre-simulated over ~15 frames, then presented
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: size.width, height: size.height } });
    const out = join(ROOT, 'public', 'join', `fluid-${size.name}.webp`);
    const info = await sharp(png).webp({ quality: 80 }).toFile(out);
    console.log(`${out}: ${Math.round(info.size / 1024)} KB`);
    await page.close();
  }
  await browser.close();
} finally {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  else server.kill('SIGTERM');
}
