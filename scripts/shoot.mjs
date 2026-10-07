// GPU screenshots for the quality gate (spec 4.7, item 1).
//
//   node scripts/shoot.mjs [baseUrl|local] [--port <n>] [--no-webgl] [--reduced-motion] [path...]
//
// With no baseUrl, or the word "local", it starts `next start -p <port>` (default 3100) from this
// repo as a child process (run `npm run build` first), waits for HTTP 200, shoots, then stops
// it, including on error. Each path is shot at 1440x900 and at 390x844 (touch, DPR 2), once idle
// and once after a mouse sweep, into shots/<name>-<size>[-nowebgl][-reduced]-<state>.png. It
// prints one JSON line per path and size: the WebGL renderer string, the h1 text and any
// console errors.
//   --no-webgl        launch Chrome with WebGL disabled, to judge each page's poster fallback
//   --reduced-motion  emulate prefers-reduced-motion: reduce, to judge the still fallbacks
//   --full            also save the whole page (<name>-full.png)
//   --scroll <px>     also save a shot scrolled to that offset (<name>-at-<px>.png)
// In Git Bash, pass paths without the leading slash or set MSYS_NO_PATHCONV=1.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'shots');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DEFAULT_PORT = 3100;

// sweepEnd is where the mouse sweep stops (0 to 1, y down): open field, away from where the
// home hero's cursor halo starts, so the "mouse" shot shows the halo has followed the pointer.
const SIZES = [
  { label: '1440x900', viewport: { width: 1440, height: 900, deviceScaleFactor: 1 }, sweepEnd: [0.65, 0.78] },
  { label: '390x844', viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, sweepEnd: [0.72, 0.3] },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Paths may be given with or without the leading slash ("events" or "/events"). Git Bash
// rewrites a bare "/events" into a Windows path, so those are refused with a hint.
function normalisePath(path) {
  if (/^[a-z]:[\\/]/i.test(path)) {
    throw new Error(`"${path}" looks like a shell-rewritten path. Pass it without the leading slash, or set MSYS_NO_PATHCONV=1.`);
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function parseArgs(argv) {
  const options = { baseUrl: null, port: DEFAULT_PORT, noWebgl: false, reducedMotion: false, full: false, scroll: 0, paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--full') {
      options.full = true;
    } else if (arg === '--scroll') {
      const y = Number(argv[++i]);
      if (!Number.isFinite(y) || y < 0) throw new Error('--scroll needs a pixel offset, for example --scroll 1800');
      options.scroll = y;
    } else if (arg === '--port') {
      const port = Number(argv[++i]);
      if (!Number.isInteger(port) || port <= 0) throw new Error('--port needs a number, for example --port 3102');
      options.port = port;
    } else if (arg === '--no-webgl') {
      options.noWebgl = true;
    } else if (arg === '--reduced-motion') {
      options.reducedMotion = true;
    } else if (arg.startsWith('--')) {
      throw new Error(`unknown option ${arg}`);
    } else if (i === 0 && /^https?:\/\//.test(arg)) {
      options.baseUrl = arg.replace(/\/$/, '');
    } else if (!(i === 0 && arg === 'local')) {
      options.paths.push(normalisePath(arg));
    }
  }
  return options;
}

function shotName(path) {
  const name = path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-');
  return name || 'home';
}

async function waitForServer(url, child, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) throw new Error(`next start exited early with code ${child.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.status === 200) return;
    } catch {
      // not listening yet
    }
    await sleep(400);
  }
  throw new Error(`no HTTP 200 from ${url} within ${timeoutMs / 1000}s`);
}

function startLocalServer(port) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  return { child, output: () => output };
}

function stopLocalServer(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  const exited = new Promise(resolve => child.once('exit', resolve));
  if (process.platform === 'win32') {
    // next start can run its server in a child process; take down the whole tree.
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
  return Promise.race([exited, sleep(10_000)]);
}

// A visitor-like sweep: from the left of the screen, wiggling, to sweepEnd.
async function sweep(page, { width, height }, [endX, endY]) {
  const [startX, startY] = [0.15, 0.5];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = width * (startX + (endX - startX) * t);
    const y = height * (startY + (endY - startY) * t + Math.sin(t * Math.PI * 2) * 0.12);
    await page.mouse.move(x, y);
    await sleep(25);
  }
  await sleep(600);
}

async function shoot(browser, baseUrl, path, { suffix, reducedMotion, full, scroll }) {
  const results = [];
  for (const size of SIZES) {
    const page = await browser.newPage();
    if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const errors = [];
    const httpErrors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('response', response => {
      if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url().replace(baseUrl, '')}`);
    });
    await page.setViewport(size.viewport);
    const pending = new Set();
    page.on('request', request => pending.add(request.url()));
    page.on('requestfinished', request => pending.delete(request.url()));
    page.on('requestfailed', request => pending.delete(request.url()));
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'load', timeout: 30_000 });
    // Lazy chunks (the WebGL field) load after first paint; give them a moment to settle.
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10_000 }).catch(() => {
      errors.push(`network still busy after 10s: ${[...pending].slice(0, 4).join(', ')}`);
    });

    const renderer = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (!gl) return 'no webgl';
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return name;
    });

    const base = join(OUT, `${shotName(path)}-${size.label}${suffix}`);
    await sleep(3500);
    if (full) {
      // The whole page as laid out, for judging sections below the fold.
      await page.screenshot({ path: `${base}-full.png`, fullPage: true });
    }
    if (scroll) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
      await sleep(900);
      await page.screenshot({ path: `${base}-at-${scroll}.png` });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(400);
    }
    await page.screenshot({ path: `${base}-idle.png` });
    await sweep(page, size.viewport, size.sweepEnd);
    await page.screenshot({ path: `${base}-mouse.png` });

    // The h1 as assistive tech reads it: the scramble layers are aria-hidden.
    const h1 = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.cloneNode(true);
      if (!heading) return null;
      heading.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
      return heading.textContent.trim();
    });
    const canvas = await page.evaluate(() => {
      const el = document.querySelector('canvas');
      return el ? `${el.width}x${el.height} backbuffer for ${el.clientWidth}x${el.clientHeight} css px` : null;
    });
    results.push({ path, size: size.label, renderer, h1, canvas, errors, httpErrors });
    await page.close();
  }
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const paths = options.paths.length ? options.paths : ['/'];
  const suffix = `${options.noWebgl ? '-nowebgl' : ''}${options.reducedMotion ? '-reduced' : ''}`;
  mkdirSync(OUT, { recursive: true });

  let server;
  let browser;
  try {
    let baseUrl = options.baseUrl;
    if (!baseUrl) {
      baseUrl = `http://localhost:${options.port}`;
      server = startLocalServer(options.port);
      try {
        await waitForServer(baseUrl, server.child);
      } catch (error) {
        console.error(server.output());
        throw error;
      }
    }

    const gpuArgs = options.noWebgl
      ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis']
      : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: [...gpuArgs, '--hide-scrollbars'],
      defaultViewport: null,
    });

    for (const path of paths) {
      for (const result of await shoot(browser, baseUrl, path, { suffix, reducedMotion: options.reducedMotion, full: options.full, scroll: options.scroll })) {
        console.log(JSON.stringify(result));
      }
    }
  } finally {
    await browser?.close().catch(() => {});
    await stopLocalServer(server?.child);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
