# /check-responsive

Verify that the desktop and mobile layouts of the site are intact by capturing screenshots at multiple viewports and visually inspecting them.

## First-time setup (once only)

If Playwright's Chromium browser has never been installed, run this first:

```bash
npm run screenshot:setup
```

This downloads the Chromium binary (~150 MB). You only need to do this once per machine.

## Steps

**1. Capture screenshots**

Run the screenshot script:

```bash
npm run screenshot
```

This starts a local static server on port 4321, opens Chromium at three viewport widths, and saves 7 full-page PNGs to `_screenshots/`:

| File | Page | Viewport |
|---|---|---|
| `home-desktop.png` | `/` | 1440px |
| `home-tablet.png` | `/` | 768px |
| `home-mobile.png` | `/` | 375px |
| `writing-desktop.png` | `/writing/` | 1440px |
| `writing-mobile.png` | `/writing/` | 375px |
| `article-desktop.png` | article | 1440px |
| `article-mobile.png` | article | 375px |

To also check the light theme, run: `node scripts/screenshot.js --light` (saves `*-light.png` variants).

**2. Read every screenshot**

Use the Read tool to load each PNG from `_screenshots/` and visually inspect it.

**3. Check each image for these issues**

For **desktop** screenshots (1440px):
- [ ] Header shows logo + full nav links + theme toggle; no overflow
- [ ] Three-column layout (sidebar / main / rail) renders correctly on home page
- [ ] Project cards display horizontally in the gallery
- [ ] Section headings, experience grid, skills grid, writing list all render as expected
- [ ] No hamburger button visible

For **tablet** screenshots (768px, home only):
- [ ] Two-column layout (sidebar + main, rail hidden)
- [ ] Header intact

For **mobile** screenshots (375px):
- [ ] Header shows logo + hamburger `☰` button only (nav links hidden)
- [ ] Single-column layout; sidebar stacked above main content
- [ ] Experience and education entries: date stacks above description (not side-by-side)
- [ ] Writing list rows: single-column (date above title, readtime hidden)
- [ ] Skills groups: label stacks above skill tags
- [ ] Project gallery: cards visible and scrollable, no prev/next arrow buttons
- [ ] No content clipped at viewport edges; padding looks reasonable
- [ ] CTA buttons (Private Cloud, Get in touch) are full-width and tappable-looking

For **writing index** (`writing-*.png`):
- [ ] Desktop: full-width post list with date / title / readtime columns
- [ ] Mobile: single-column list (date above title, readtime hidden), header compact

For **article** (`article-*.png`):
- [ ] Desktop: two-column layout (article + ToC sidebar)
- [ ] Mobile: single-column (ToC hidden), readable prose, compact header

**4. Report findings**

List each file and its status. Example format:

```
home-desktop.png   ✓ clean
home-tablet.png    ✓ clean
home-mobile.png    ⚠ hamburger button not visible — may be a z-index issue
...
```

If everything looks good: "All viewports look good — no layout issues found."
If issues are found: describe exactly what's wrong and which element is affected so a fix can be made immediately.
