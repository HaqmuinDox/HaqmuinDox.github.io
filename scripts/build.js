'use strict';
const fs   = require('fs');
const path = require('path');
const matter  = require('gray-matter');
const { marked } = require('marked');

const ROOT     = path.join(__dirname, '..');
const SRC_DIR  = path.join(ROOT, 'writing', '_src');
const OUT_DIR  = path.join(ROOT, 'writing');
const TMPL     = path.join(OUT_DIR, '_template.html');

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addHeadingIds(html) {
  return html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, level, inner) => {
    const plain = inner.replace(/<[^>]+>/g, '');
    const id    = slugify(plain);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

function extractHeadings(html) {
  const headings = [];
  const re = /<h([23]) id="([^"]+)">(.*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    headings.push({
      level: parseInt(m[1]),
      id:    m[2],
      text:  m[3].replace(/<[^>]+>/g, ''),
    });
  }
  return headings;
}

function buildToc(headings) {
  if (headings.length === 0) return '';
  let html = '<ul class="toc-list">';
  for (const h of headings) {
    const cls = h.level === 3 ? ' class="toc-h3"' : '';
    html += `<li${cls}><a href="#${h.id}" class="toc-link">${h.text}</a></li>`;
  }
  html += '</ul>';
  return html;
}

function formatDate(raw) {
  // "2026-03" → "2026 · 03"
  return String(raw).replace('-', ' · ');
}

function buildPrevNext(posts, idx) {
  // posts[0] = newest; prev = older (higher idx), next = newer (lower idx)
  const older  = posts[idx + 1] || null;
  const newer  = posts[idx - 1] || null;
  const prev   = older  ? `<a href="/writing/${older.slug}.html"  class="pag-link pag-prev">← ${older.title}</a>`  : '';
  const next   = newer  ? `<a href="/writing/${newer.slug}.html"  class="pag-link pag-next">${newer.title} →</a>` : '';
  return { prev, next };
}

function buildIndexPage(posts) {
  const json = JSON.stringify(posts);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Writing &amp; Notes — dan.cardoz</title>
<script>(function(){var t;try{t=localStorage.getItem('dc-theme')}catch(e){}if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}if(t==='light')document.documentElement.setAttribute('data-theme','light')})();<\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tokens.css">
<style>
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; font-family: 'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; color: var(--txt); min-height: 100vh; }
  @keyframes pulseDot { 0%,100%{box-shadow:0 0 0 0 rgba(102,179,255,.55)} 65%{box-shadow:0 0 0 7px rgba(102,179,255,0)} }
  #search:focus { border-color: var(--accent) !important; }
  .post-row:hover { padding-left: 14px !important; }

  /* ── Mobile header & listing ── */
  @media (max-width: 640px) {
    header > div { padding-left: 16px !important; padding-right: 16px !important; }
    header nav { gap: 14px !important; }
    #wl-content { padding: 36px 20px 80px !important; }
  }
  @media (max-width: 480px) {
    header nav { gap: 10px !important; }
    header nav a, header nav button { font-size: 0.65rem !important; }
    header nav a:nth-of-type(3) { display: none !important; }
    #wl-content { padding: 24px 14px 60px !important; }
    .post-row { grid-template-columns: 1fr !important; gap: 2px !important; padding: 12px 6px !important; }
    .post-row > span:last-child { display: none; }
    .post-row > span:nth-child(2) { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
  }
</style>
</head>
<body>
<div aria-hidden="true" style="position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle,color-mix(in oklab,var(--txt) 7%,transparent) 1px,transparent 1px);background-size:28px 28px;"></div>
<div id="prog" aria-hidden="true" style="position:fixed;top:0;left:0;z-index:100;height:2px;width:0%;background:linear-gradient(90deg,var(--accent),color-mix(in oklab,var(--accent) 60%,#fff));pointer-events:none;transition:width .1s linear;"></div>
<div aria-hidden="true" style="position:fixed;inset:0;z-index:-1;background:var(--page-bg);transition:background .45s ease;pointer-events:none;"></div>

<header style="position:sticky;top:0;z-index:40;border-bottom:1px solid var(--section-border);background:color-mix(in oklab,var(--page-bg) 80%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);">
  <div style="max-width:1440px;margin:0 auto;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
    <a href="/" style="font-family:'Space Mono',ui-monospace,monospace;font-weight:700;font-size:0.86rem;letter-spacing:.06em;color:var(--txt);text-decoration:none;display:inline-flex;align-items:center;gap:9px;flex:none;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--accent);animation:pulseDot 2.8s ease-in-out infinite;"></span>
      dan.cardoz
    </a>
    <nav style="display:flex;align-items:center;gap:22px;">
      <a href="/#projects" style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.7rem;color:var(--txt3);text-decoration:none;transition:color .2s;">Projects</a>
      <a href="/writing/" style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.7rem;color:var(--accent);text-decoration:none;">Writing</a>
      <a href="https://nextcloud.home.dancardoz.de" target="_blank" rel="noopener" style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.7rem;color:var(--txt3);text-decoration:none;transition:color .2s;">Cloud ↗</a>
      <button id="theme-btn" aria-label="Toggle theme" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--btn-border);color:var(--txt2);font-family:'Space Mono',ui-monospace,monospace;font-size:0.7rem;padding:7px 12px;border-radius:6px;transition:border-color .2s,color .2s;white-space:nowrap;"></button>
    </nav>
  </div>
</header>

<div id="wl-content" style="max-width:780px;margin:0 auto;padding:52px 48px 120px;position:relative;z-index:1;">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
    <a href="/" style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.7rem;color:var(--txt3);text-decoration:none;transition:color .2s;">← home</a>
    <span style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.72rem;color:var(--accent);">05</span>
    <h1 style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.72rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--txt);margin:0;">Writing &amp; Notes</h1>
    <span style="flex:1;height:1px;background:var(--section-border);"></span>
  </div>
  <p style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.74rem;color:var(--txt3);margin:0 0 24px;">// a small digital garden — work in progress</p>

  <input type="search" id="search" placeholder="Search posts..." autocomplete="off"
         style="width:100%;font-family:'Space Mono',ui-monospace,monospace;font-size:0.78rem;background:var(--card-bg);border:0.5px solid var(--card-border);border-radius:7px;padding:10px 14px;color:var(--txt);outline:none;transition:border-color .2s;backdrop-filter:blur(10px);margin-bottom:24px;display:block;">

  <div id="post-list"></div>
  <p id="no-results" style="display:none;font-family:'Space Mono',ui-monospace,monospace;font-size:0.78rem;color:var(--txt3);padding:20px 6px;">No posts match your search.</p>
</div>

<script>
const POSTS = ${json};

function renderPosts(list) {
  const el = document.getElementById('post-list');
  el.innerHTML = list.map(p => \`
    <a href="\${p.href}" class="post-row" style="display:grid;grid-template-columns:80px 1fr auto;gap:16px;align-items:center;padding:15px 6px;border-top:1px solid var(--section-border);text-decoration:none;transition:padding-left .18s;">
      <span style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.68rem;color:var(--txt3);">\${p.date}</span>
      <span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;">
        <span style="font-weight:600;font-size:0.93rem;color:var(--txt);">\${p.title}</span>
        <span style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.62rem;color:var(--accent);background:var(--skill-bg);border:0.5px solid var(--skill-border);border-radius:3px;padding:2px 7px;flex:none;">\${p.tag}</span>
      </span>
      <span style="font-family:'Space Mono',ui-monospace,monospace;font-size:0.67rem;color:var(--txt3);white-space:nowrap;">\${p.readtime} ↗</span>
    </a>
  \`).join('');
}

const searchEl = document.getElementById('search');
const noRes    = document.getElementById('no-results');

searchEl.addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  const filtered = q
    ? POSTS.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q))
    : POSTS;
  renderPosts(filtered);
  noRes.style.display = (q && filtered.length === 0) ? 'block' : 'none';
});

renderPosts(POSTS);
<\/script>

<script>
(function() {
  function getTheme() {
    var t; try { t = localStorage.getItem('dc-theme'); } catch(e) {}
    return t || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = t === 'light' ? '☾ Dark' : '☀ Light';
  }
  applyTheme(getTheme());
  document.getElementById('theme-btn').addEventListener('click', function() {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('dc-theme', next); } catch(e) {}
    applyTheme(next);
  });
  window.addEventListener('scroll', function() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    document.getElementById('prog').style.width = (pct * 100) + '%';
  }, { passive: true });
})();
<\/script>
</body>
</html>`;
}

function updateHomepage(posts) {
  const indexPath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const postsLines = posts.map(p =>
    `        { date: '${esc(p.date)}', title: '${esc(p.title)}', tag: '${esc(p.tag)}', readtime: '${esc(p.readtime)}', href: '${esc(p.href)}' }`
  ).join(',\n');

  html = html.replace(
    /posts:\s*\[[\s\S]*?\n\s*\],/,
    `posts: [\n${postsLines}\n      ],`
  );

  const latest = posts[0];
  html = html.replace(
    /latestPost:\s*\{[^}]*\},/,
    `latestPost: { date: '${esc(latest.date)}', title: '${esc(latest.title)}', href: '${esc(latest.href)}' },`
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Updated: index.html');
}

function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    if (data.draft) continue;

    const rawHtml  = marked.parse(content);
    const bodyHtml = addHeadingIds(rawHtml);
    const headings = extractHeadings(bodyHtml);
    const tocHtml  = buildToc(headings);

    posts.push({
      slug:     data.slug,
      title:    data.title,
      date:     formatDate(data.date),
      tag:      data.tag,
      readtime: data.readtime,
      excerpt:  data.excerpt,
      href:     `/writing/${data.slug}.html`,
      bodyHtml,
      tocHtml,
    });
  }

  // Newest first
  posts.sort((a, b) => b.date.localeCompare(a.date));

  const template = fs.readFileSync(TMPL, 'utf8');

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const { prev, next } = buildPrevNext(posts, i);

    const html = template
      .replace(/\{\{TITLE\}\}/g,    p.title)
      .replace(/\{\{DATE\}\}/g,     p.date)
      .replace(/\{\{TAG\}\}/g,      p.tag)
      .replace(/\{\{READTIME\}\}/g, p.readtime)
      .replace(/\{\{EXCERPT\}\}/g,  p.excerpt)
      .replace(/\{\{TOC_HTML\}\}/g, p.tocHtml)
      .replace(/\{\{BODY_HTML\}\}/g,p.bodyHtml)
      .replace(/\{\{PREV_HTML\}\}/g,prev)
      .replace(/\{\{NEXT_HTML\}\}/g,next);

    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.html`), html, 'utf8');
    console.log(`Built: writing/${p.slug}.html`);
  }

  const searchData = posts.map(({ slug, title, date, tag, readtime, href, excerpt }) =>
    ({ slug, title, date, tag, readtime, href, excerpt }));

  fs.writeFileSync(path.join(OUT_DIR, 'search.json'), JSON.stringify(searchData, null, 2), 'utf8');
  console.log('Built: writing/search.json');

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildIndexPage(searchData), 'utf8');
  console.log('Built: writing/index.html');

  updateHomepage(searchData);
}

main();
