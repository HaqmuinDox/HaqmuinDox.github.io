'use strict';
const { chromium } = require('playwright');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const ROOT       = path.join(__dirname, '..');
const OUT_DIR    = path.join(ROOT, '_screenshots');
const PORT       = 4321;
const LIGHT_MODE = process.argv.includes('--light');
const SUFFIX     = LIGHT_MODE ? '-light' : '';
const THEME      = LIGHT_MODE ? 'light' : 'dark';

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900  },
];

const PAGES = [
  { slug: 'home',    path: '/' },
  { slug: 'writing', path: '/writing/' },
  { slug: 'article', path: '/writing/profiling-tau-perf.html' },
];

// Skip tablet for writing/article pages (only home gets a tablet shot)
const SKIP = new Set(['writing-tablet', 'article-tablet']);

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.join(ROOT, pathname);
    const ext  = path.extname(file);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const server  = await startServer();
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    for (const pg of PAGES) {
      const key = `${pg.slug}-${vp.name}`;
      if (SKIP.has(key)) continue;

      const ctx = await browser.newContext({
        viewport:    { width: vp.width, height: vp.height },
        colorScheme: THEME,  // force dark/light regardless of OS setting
      });
      const page = await ctx.newPage();

      // Force theme via localStorage before any page script runs
      await ctx.addInitScript((t) => localStorage.setItem('dc-theme', t), THEME);

      // Inject CSS to make all scroll-reveal elements immediately visible —
      // headless browsers don't scroll, so intersection observers never fire
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = '[data-reveal]{opacity:1!important;transform:none!important;transition:none!important}';
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
      });

      await page.goto(`http://localhost:${PORT}${pg.path}`, { waitUntil: 'networkidle' });

      // Let fonts, animations, and the typewriter settle
      await page.waitForTimeout(800);

      const file = path.join(OUT_DIR, `${key}${SUFFIX}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ✓ ${path.basename(file)}`);

      await ctx.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`\nScreenshots saved to _screenshots/`);
}

run().catch(err => { console.error(err); process.exit(1); });
