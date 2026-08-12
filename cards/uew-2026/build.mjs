#!/usr/bin/env node
// Builds the UEW 2026 card set: HTML -> print-ready PDF via headless Chromium.
//
//   node build.mjs            # print PDFs + proof PDFs
//   node build.mjs --html     # write HTML only (for browser review)
//
// Chromium emits 618.96 x 438.96pt because it round-trips the page size through
// microns; finalize.py rescales each page to the exact 619.2 x 439.2pt the
// vendor template specifies and stamps the Trim/Bleed boxes.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildCards, renderCard } from './src/cards.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'out');
const HTML_DIR = join(OUT, 'html');

const CHROME =
  process.env.CHROME_BIN || '/opt/pw-browsers/chromium-1232/chrome-linux/chrome';

/** Inline an SVG file: drop the fixed width/height so CSS sizes it. */
function inlineLogo(name) {
  let svg = readFileSync(join(ROOT, 'assets', `${name}.svg`), 'utf8');
  svg = svg.replace(/<svg([^>]*?)\s(width|height)="[\d.]+"/g, '<svg$1').replace(
    /<svg([^>]*?)\s(width|height)="[\d.]+"/g,
    '<svg$1',
  );
  return svg.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
}

/**
 * Inlined SVGs share an id namespace once they land in one document, and the
 * extracted logos all define clip_1..clip_n. Scope every id to its own <svg>.
 */
function scopeSvgIds(html) {
  let n = 0;
  return html.replace(/<svg[\s\S]*?<\/svg>/g, (svg) => {
    const prefix = `s${n++}`;
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    let out = svg;
    for (const id of new Set(ids)) {
      const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out
        .replace(new RegExp(`\\sid="${esc}"`, 'g'), ` id="${prefix}-${id}"`)
        .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}-${id})`)
        .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${prefix}-${id}"`);
    }
    return out;
  });
}

function chromePdf(htmlPath, pdfPath) {
  execFileSync(
    CHROME,
    [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      '--no-pdf-header-footer',
      '--virtual-time-budget=8000',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
}

const htmlOnly = process.argv.includes('--html');

rmSync(HTML_DIR, { recursive: true, force: true });
mkdirSync(HTML_DIR, { recursive: true });
mkdirSync(join(OUT, 'print'), { recursive: true });
mkdirSync(join(OUT, 'proof'), { recursive: true });

const logos = {
  master: inlineLogo('logo'),
  masterWhite: inlineLogo('logo-white'),
  brightmore: inlineLogo('logo-brightmore'),
  brightmoreWhite: inlineLogo('logo-brightmore-white'),
};

const cards = buildCards(logos);
const index = [];

for (const card of cards) {
  for (const proof of [false, true]) {
    const suffix = proof ? '-proof' : '';
    const file = `${card.id}${suffix}.html`;
    const html = scopeSvgIds(
      renderCard(card, { proof, cssHref: '../../src/base.css' }),
    );
    const htmlPath = join(HTML_DIR, file);
    writeFileSync(htmlPath, html);
    if (htmlOnly) continue;
    const pdfPath = join(OUT, proof ? 'proof' : 'print', `UEW-2026-${card.id}${suffix}.pdf`);
    chromePdf(htmlPath, pdfPath);
    process.stdout.write(`  ${proof ? 'proof' : 'print'}  ${card.id}\n`);
  }
  index.push({
    id: card.id,
    holiday: card.holiday,
    number: card.number,
    name: card.name,
    direction: card.direction,
    variant: Boolean(card.variant),
    blurb: card.blurb,
  });
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 2));

// A single page that shows all twelve panels side by side in the browser.
const gallery = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>UEW 2026 cards — all concepts</title>
<link rel="stylesheet" href="../../src/base.css">
<style>
  body { background:#5b6570; font-family:'Montserrat',sans-serif; margin:0; padding:24px; }
  h1 { color:#fff; font-size:16px; letter-spacing:.18em; text-transform:uppercase; margin:0 0 20px; }
  h2 { color:#fff; font-size:12px; letter-spacing:.14em; text-transform:uppercase; margin:26px 0 8px; font-weight:600; }
  .row { display:flex; gap:14px; flex-wrap:wrap; }
  .thumb { width:8.6in; transform:scale(.52); transform-origin:top left; margin:0 -4.13in -5.86in 0; }
  iframe { width:8.6in; height:12.2in; border:0; display:block; }
</style></head><body><h1>UEW Healthcare — 2026 card concepts</h1>
${cards
  .map(
    (c) => `<h2>${c.holiday} ${c.number} · ${c.name} · ${c.direction}</h2>
<div class="row">
  <div class="thumb"><iframe src="./${c.id}.html" scrolling="no"></iframe></div>
</div>`,
  )
  .join('\n')}
</body></html>`;
writeFileSync(join(HTML_DIR, 'gallery.html'), gallery);

console.log(`\n${cards.length} concepts -> ${OUT}`);
