// The six 2026 card concepts for United Energy Workers Healthcare.
//
// Three per holiday, deliberately spread across one axis so the client is
// choosing a direction rather than picking between three versions of the
// same card:
//
//   1  Traditional  — cream stock, line art, one script word
//   2  Formal       — deep navy full bleed, gold art
//   3  Editorial    — cream stock, large flush-left type, coral accent
//
// The Thanksgiving and Christmas cards are numbered to match, so 01/01, 02/02
// or 03/03 can be chosen together as a matched pair for the season.

import {
  wheatWreath,
  harvestArc,
  leafCluster,
  atomOrnament,
  starBurst,
  firSprig,
  wheatStalk,
  dottedRule,
} from './art.mjs';

const NAVY = '#133d64';
const CORAL = '#f15933';
const CORAL_LIGHT = '#f8a484';
const GOLD = '#cba55f';
const GOLD_LIGHT = '#e2c68d';
const CREAM = '#faf5ec';
const OAT = '#f7eddc';
const HUSK = '#e0c395';
const AMBER = '#de9a3e';
const GOLDENROD = '#b8842b';
const PUMPKIN = '#c9622a';
const RUST = '#a8431e';
const RUST_DEEP = '#8e3616';
const CHESTNUT = '#8a4e2b';
const CRANBERRY = '#8e2f3c';
const MOSS = '#878b57';
const OLIVE = '#6b7148';
const NAVY_NIGHT = '#0a2340'; // must match --navy-night; the halo blends against it

/** A single wheat stalk, used quietly on the inside-left write-in panel. */
function wheatSprig({ ink = NAVY, accent = CORAL } = {}) {
  const s = wheatStalk({ length: 150, grains: 8, grainLen: 22, grainWid: 5, spread: 36 });
  return `<svg viewBox="-60 -190 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g fill="${ink}" opacity="0.9">${s.fills.map((d) => `<path d="${d}"/>`).join('')}</g>
  <g fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round" opacity="0.6">${s.strokes
    .map((d) => `<path d="${d}"/>`)
    .join('')}</g>
  <circle cx="0" cy="0" r="3.2" fill="${accent}"/>
</svg>`;
}

/* --------------------------------------------------------------------------
   Shared panels
   -------------------------------------------------------------------------- */

/** Back cover — the entity lockup, nothing else. It is the quietest panel. */
function backPanel(logoSvg) {
  return `<div class="stack stack--center">
        <div class="logo back-logo">${logoSvg}</div>
      </div>`;
}

/** Inside-left stays open on purpose: these cards get handwritten in. */
function insideLeftPanel(artSvg, cls = '') {
  return `<div class="stack">
        <div class="inside-art ${cls}">${artSvg}</div>
      </div>`;
}

function insideRightPanel({ eyebrow, headline, paras, signoff, logoSvg, ruleSvg }) {
  return `<div class="stack stack--center inside-msg">
        <p class="eyebrow inside-eyebrow">${eyebrow}</p>
        <h2 class="display inside-head">${headline}</h2>
        <div class="inside-rule">${ruleSvg}</div>
        ${paras.map((p) => `<p class="body">${p}</p>`).join('\n        ')}
        <p class="signoff">${signoff}</p>
        <div class="logo inside-logo">${logoSvg}</div>
      </div>`;
}

/* --------------------------------------------------------------------------
   Concepts
   -------------------------------------------------------------------------- */

export function buildCards(logos) {
  const { master, masterWhite, brightmore, brightmoreWhite } = logos;

  return [
    /* ------------------------------------------------------------------ */
    {
      id: 'thanksgiving-01-gathered',
      holiday: 'Thanksgiving',
      number: '01',
      name: 'Gathered',
      direction: 'Traditional',
      blurb:
        'Oat stock, a wheat-and-foliage wreath in amber, rust and olive, one script word. The safest, warmest of the three.',
      outsideBg: OAT,
      insideBg: OAT,
      front: `<div class="stack stack--center">
        <div class="t1-wreath">
          ${wheatWreath({
            size: 372, radius: 132, stalks: 22,
            inks: [GOLDENROD, CHESTNUT, AMBER], leaves: 7, leafInks: [PUMPKIN, OLIVE, MOSS],
            accent: CRANBERRY, seed: 11,
          })}
          <p class="script t1-word">grateful</p>
        </div>
        <p class="caps t1-sub">Happy Thanksgiving</p>
      </div>`,
      back: backPanel(master),
      insideLeft: insideLeftPanel(wheatSprig({ ink: CHESTNUT, accent: CRANBERRY }), 'inside-art--wheat'),
      insideRight: insideRightPanel({
        eyebrow: 'With gratitude',
        headline: 'Thank&nbsp;you.',
        paras: [
          'Thank you for serving our country — for the work you did long before we ever met you.',
          'And thank you for being part of the UEW family. May your table be full and your home be warm this Thanksgiving.',
        ],
        signoff: '— Everyone at United Energy Workers Healthcare',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: CHESTNUT, accent: RUST }),
      }),
      css: `
        .inside-eyebrow { color: var(--fall-rust); }
        .inside-head { color: var(--fall-rust-deep); }
        .t1-wreath { position: relative; width: 3.02in; margin-top: -0.16in; }
        .t1-wreath svg { display: block; width: 100%; height: auto; }
        .t1-word {
          position: absolute; inset: 0; display: flex;
          align-items: center; justify-content: center;
          font-size: 41pt; color: var(--fall-rust-deep);
          transform: translateY(-0.05in);
        }
        .t1-sub {
          margin-top: 0.34in; font-size: 12.5pt; color: var(--navy);
          letter-spacing: 0.26em; text-indent: 0.26em;
        }
        .inside-art--wheat { width: 0.9in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'thanksgiving-02-harvest',
      holiday: 'Thanksgiving',
      number: '02',
      name: 'Harvest',
      direction: 'Formal',
      blurb:
        'Deep sienna across the whole outside, wheat-gold harvest sheaf, script and letterspaced caps. The premium option, and the most seasonal.',
      outsideBg: RUST_DEEP,
      insideBg: OAT,
      front: `<div class="stack stack--center t2-front">
        <p class="script t2-happy">Happy</p>
        <p class="caps t2-thanks">Thanksgiving</p>
        <div class="t2-arc">${harvestArc({
          width: 430, height: 218, spread: 74, stalkLen: 160,
          inks: [HUSK, CREAM, AMBER], leafInks: [AMBER, HUSK],
          accent: HUSK, seed: 31,
        })}</div>
      </div>`,
      back: backPanel(masterWhite),
      insideLeft: insideLeftPanel(wheatSprig({ ink: CHESTNUT, accent: CRANBERRY }), 'inside-art--wheat'),
      insideRight: insideRightPanel({
        eyebrow: 'Thanksgiving 2026',
        headline: 'With&nbsp;gratitude.',
        paras: [
          'Thank you for serving our country. You spent your working life on something far bigger than yourself, and this country is still living on the strength of it.',
          'Thank you, too, for being part of the UEW family. Caring for you is the privilege of our year.',
        ],
        signoff: '— Your team at United Energy Workers Healthcare',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: CHESTNUT, accent: RUST }),
      }),
      css: `
        .inside-eyebrow { color: var(--fall-rust); }
        .inside-head { color: var(--fall-rust-deep); }
        .t2-front { color: var(--cream); padding-bottom: 0.18in; }
        .t2-happy { font-size: 44pt; color: ${HUSK}; }
        .t2-thanks {
          margin-top: 0.16in; font-size: 17pt; color: var(--cream);
          letter-spacing: 0.28em; text-indent: 0.28em;
        }
        .t2-arc { width: 3.37in; margin-top: 0.24in; }
        .t2-arc svg { display: block; width: 100%; height: auto; }
        .inside-art--wheat { width: 0.9in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'thanksgiving-02b-harvest-navy',
      holiday: 'Thanksgiving',
      number: '02b',
      name: 'Harvest — navy colourway',
      direction: 'Formal',
      variant: true,
      blurb:
        'The same card keeping the 2025 navy field, with the autumn palette carried in the sheaf instead. Navy is the one field colour Thanksgiving and Christmas would otherwise no longer share.',
      outsideBg: 'var(--navy-deep)',
      insideBg: OAT,
      front: `<div class="stack stack--center t2-front">
        <p class="script t2-happy">Happy</p>
        <p class="caps t2-thanks">Thanksgiving</p>
        <div class="t2-arc">${harvestArc({
          width: 430, height: 218, spread: 74, stalkLen: 160,
          inks: [HUSK, AMBER, GOLDENROD], leafInks: [AMBER, GOLDENROD],
          accent: PUMPKIN, seed: 31,
        })}</div>
      </div>`,
      back: backPanel(masterWhite),
      insideLeft: insideLeftPanel(wheatSprig({ ink: CHESTNUT, accent: CRANBERRY }), 'inside-art--wheat'),
      insideRight: insideRightPanel({
        eyebrow: 'Thanksgiving 2026',
        headline: 'With&nbsp;gratitude.',
        paras: [
          'Thank you for serving our country. You spent your working life on something far bigger than yourself, and this country is still living on the strength of it.',
          'Thank you, too, for being part of the UEW family. Caring for you is the privilege of our year.',
        ],
        signoff: '— Your team at United Energy Workers Healthcare',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: CHESTNUT, accent: RUST }),
      }),
      css: `
        .inside-eyebrow { color: var(--fall-rust); }
        .inside-head { color: var(--fall-rust-deep); }
        .t2-front { color: var(--cream); padding-bottom: 0.18in; }
        .t2-happy { font-size: 44pt; color: ${HUSK}; }
        .t2-thanks {
          margin-top: 0.16in; font-size: 17pt; color: var(--cream);
          letter-spacing: 0.28em; text-indent: 0.28em;
        }
        .t2-arc { width: 3.37in; margin-top: 0.24in; }
        .t2-arc svg { display: block; width: 100%; height: auto; }
        .inside-art--wheat { width: 0.9in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'thanksgiving-03-give-thanks',
      holiday: 'Thanksgiving',
      number: '03',
      name: 'Give Thanks',
      direction: 'Editorial',
      blurb:
        'Oat stock, oversized flush-left type in sienna, amber rule, a rust-and-olive leaf cluster. The modern option — reads as a brand piece, not a greeting card.',
      outsideBg: OAT,
      insideBg: OAT,
      front: `<div class="stack t3-front">
        <p class="eyebrow t3-eyebrow">Thanksgiving 2026</p>
        <div class="t3-head">
          <h1 class="display t3-h">Give<br>thanks<span class="t3-dot">.</span></h1>
          <div class="t3-rule"></div>
        </div>
        <div class="t3-leaf">${leafCluster({ inks: [RUST, GOLDENROD, OLIVE], accent: CRANBERRY })}</div>
      </div>`,
      back: `<div class="stack stack--end">
        <div class="logo back-logo back-logo--left">${master}</div>
      </div>`,
      insideLeft: insideLeftPanel(leafCluster({ inks: [RUST, GOLDENROD, OLIVE], accent: CRANBERRY }), 'inside-art--leaf'),
      insideRight: insideRightPanel({
        eyebrow: 'Happy Thanksgiving',
        headline: 'For all of it,<br>thank&nbsp;you.',
        paras: [
          'For serving our country. For hands that built something bigger than themselves. For the families who stood behind them.',
          'And for being part of the UEW family — thank you. Happy Thanksgiving from all of us.',
        ],
        signoff: '— With gratitude, your care team',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: CHESTNUT, accent: RUST }),
      }),
      css: `
        .inside-eyebrow { color: var(--fall-rust); }
        .inside-head { color: var(--fall-rust-deep); }
        .t3-front { color: var(--fall-rust-deep); }
        .t3-eyebrow { color: var(--fall-rust); }
        .t3-head { margin-top: 0.52in; }
        .t3-h { font-size: 54pt; line-height: 0.9; font-weight: 500; }
        .t3-dot { color: var(--fall-rust); }
        .t3-rule {
          margin-top: 0.24in; width: 0.86in; height: 1.6pt;
          background: var(--fall-rust);
        }
        .t3-leaf {
          width: 1.78in; align-self: flex-end;
          margin: auto -0.56in -0.52in 0;
        }
        .t3-leaf svg { display: block; width: 100%; height: auto; }
        .back-logo--left { align-self: flex-start; }
        .inside-art--leaf { width: 0.84in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'christmas-01-ornament',
      holiday: 'Christmas',
      number: '01',
      name: 'Ornament',
      direction: 'Traditional',
      blurb:
        'Cream stock. The ornament is the client’s own atom — three crossed ellipses and three electrons — hung on a thread. Script and letterspaced caps.',
      outsideBg: CREAM,
      insideBg: CREAM,
      front: `<div class="stack c1-front">
        <div class="c1-orn">${atomOrnament({ r: 100, ink: NAVY, accent: CORAL, hang: 232, width: 300 })}</div>
        <div class="c1-type">
          <p class="script c1-merry">Merry</p>
          <p class="caps c1-christmas">Christmas</p>
        </div>
      </div>`,
      back: backPanel(master),
      insideLeft: insideLeftPanel(
        atomOrnament({ r: 40, ink: NAVY, accent: CORAL, hang: 190, width: 140 }),
        'inside-art--orn',
      ),
      insideRight: insideRightPanel({
        eyebrow: 'Christmas 2026',
        headline: 'Peace to<br>your&nbsp;home.',
        paras: [
          'Thank you for serving our country, and for being part of the UEW family. Caring for you is a privilege we do not take lightly.',
          'May your Christmas be warm and unhurried, spent with the people you love most, and may the new year be gentle and good to you.',
        ],
        signoff: '— Everyone at United Energy Workers Healthcare',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: NAVY, accent: CORAL }),
      }),
      css: `
        .c1-front { color: var(--navy); }
        .c1-orn {
          position: absolute; top: calc(-1 * var(--safe-inset)); left: 50%;
          width: 2.85in; transform: translateX(-50%);
        }
        .c1-orn svg { display: block; width: 100%; height: auto; }
        .c1-type { margin-top: auto; text-align: center; width: 100%; padding-bottom: 0.34in; }
        .c1-merry { font-size: 42pt; color: var(--navy); }
        .c1-christmas {
          margin-top: 0.1in; font-size: 15pt; color: var(--navy);
          letter-spacing: 0.3em; text-indent: 0.3em;
        }
        .inside-art--orn { width: 0.72in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'christmas-02-starlight',
      holiday: 'Christmas',
      number: '02',
      name: 'Starlight',
      direction: 'Formal',
      blurb:
        'Deep navy across the whole outside with a gold star and two orbit rings. The direct successor to the 2025 card, without the stock photo.',
      outsideBg: 'var(--navy-night)',
      insideBg: CREAM,
      front: `<div class="stack stack--center c2-front">
        <div class="c2-star">${starBurst({ size: 340, ink: GOLD_LIGHT, accent: CORAL_LIGHT, glowOn: NAVY_NIGHT })}</div>
        <p class="caps c2-merry">Merry Christmas</p>
        <p class="c2-sub">peace, joy and light</p>
      </div>`,
      back: backPanel(masterWhite),
      insideLeft: insideLeftPanel(
        starBurst({ size: 200, ink: NAVY, accent: CORAL, glow: false }),
        'inside-art--star',
      ),
      insideRight: insideRightPanel({
        eyebrow: 'Christmas 2026',
        headline: 'May your season<br>be&nbsp;bright.',
        paras: [
          'Thank you for serving our country, and for another year as part of the UEW family.',
          'Wishing you a Christmas full of light, a home full of family, and a new year that treats you well.',
        ],
        signoff: '— With warmest wishes, your care team',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: NAVY, accent: CORAL }),
      }),
      css: `
        .c2-front { color: var(--cream); }
        .c2-star { width: 2.5in; }
        .c2-star svg { display: block; width: 100%; height: auto; }
        .c2-merry {
          margin-top: 0.34in; font-size: 15pt; color: var(--cream);
          letter-spacing: 0.3em; text-indent: 0.3em;
        }
        .c2-sub {
          margin: 0.14in 0 0; font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-size: 12.5pt; color: ${GOLD_LIGHT};
          letter-spacing: 0.04em;
        }
        .inside-art--star { width: 0.78in; }
      `,
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'christmas-03-evergreen',
      holiday: 'Christmas',
      number: '03',
      name: 'Evergreen',
      direction: 'Editorial',
      blurb:
        'Cream stock, oversized flush-left type, a single fir sprig with coral berries bleeding off the outer edge. The modern option.',
      outsideBg: CREAM,
      insideBg: CREAM,
      front: `<div class="stack c3-front">
        <p class="eyebrow c3-eyebrow">Christmas 2026</p>
        <div class="c3-head">
          <h1 class="display c3-h">Merry<br>Christmas</h1>
          <p class="c3-sub">&amp; a bright new year</p>
        </div>
        <div class="c3-sprig">${firSprig({ ink: NAVY, accent: CORAL, length: 250, pairs: 28, seed: 5 })}</div>
      </div>`,
      back: `<div class="stack stack--end">
        <div class="logo back-logo back-logo--left">${master}</div>
      </div>`,
      insideLeft: insideLeftPanel(
        firSprig({ ink: NAVY, accent: CORAL, length: 190, pairs: 20, seed: 5 }),
        'inside-art--fir',
      ),
      insideRight: insideRightPanel({
        eyebrow: 'Merry Christmas',
        headline: 'From our family<br>to&nbsp;yours.',
        paras: [
          'Thank you for serving our country, and for being part of the UEW family this year. It has been the honor of our work.',
          'Wishing you a Christmas of good health and good company, and a new year that is kind to you and yours.',
        ],
        signoff: '— Everyone at United Energy Workers Healthcare',
        logoSvg: master,
        ruleSvg: dottedRule({ width: 150, ink: NAVY, accent: CORAL }),
      }),
      css: `
        .c3-front { color: var(--navy); }
        .c3-eyebrow { color: var(--coral); }
        .c3-head { margin-top: 0.5in; }
        .c3-h { font-size: 44pt; line-height: 0.96; font-weight: 500; }
        .c3-sub {
          margin: 0.2in 0 0; font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-size: 15pt; color: var(--navy); opacity: 0.85;
        }
        .c3-sprig {
          width: 1.74in; align-self: flex-end;
          margin: auto -0.6in -0.64in 0;
        }
        .c3-sprig svg { display: block; width: 100%; height: auto; }
        .inside-art--fir { width: 0.82in; }
      `,
    },
  ];
}

/* --------------------------------------------------------------------------
   Page assembly
   -------------------------------------------------------------------------- */

const GUIDES = (l, r) => `<div class="guides">
      <i class="trim"></i><i class="safe"></i>
      <i class="safe-fold-l"></i><i class="safe-fold-r"></i><i class="fold"></i>
      <b class="l">${l}</b><b class="r">${r}</b>
    </div>`;

export function renderCard(card, { proof = false, cssHref = './base.css' } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>UEW 2026 — ${card.holiday} ${card.number} ${card.name}</title>
<link rel="stylesheet" href="${cssHref}">
<style>
  .sheet--outside { --sheet-bg: ${card.outsideBg}; background: ${card.outsideBg}; }
  .sheet--inside  { --sheet-bg: ${card.insideBg};  background: ${card.insideBg}; }

  .back-logo { width: 2.02in; }
  .inside-msg { text-align: center; color: var(--ink); }
  .inside-eyebrow { color: var(--coral); }
  .inside-head {
    margin-top: 0.16in; font-size: 26pt; line-height: 1.06; color: var(--navy);
  }
  .inside-rule { width: 1.5in; margin: 0.18in 0 0.24in; }
  .inside-rule svg { display: block; width: 100%; height: auto; }
  .inside-msg .body { max-width: 3.2in; }
  .inside-msg .signoff { margin-top: 0.26in; color: var(--navy); }
  .inside-logo { width: 1.42in; margin-top: 0.3in; }
  .inside-art {
    position: absolute; left: calc(-1 * var(--safe-inset) + 0.34in);
    bottom: calc(-1 * var(--safe-inset));
  }
  .inside-art svg { display: block; width: 100%; height: auto; }
${card.css}
</style>
</head>
<body>
  <div class="sheet sheet--outside">
    <div class="panel panel--left">${card.back}</div>
    <div class="panel panel--right">${card.front}</div>
    ${proof ? GUIDES('Back cover', 'Front cover') : ''}
  </div>
  <div class="sheet sheet--inside">
    <div class="panel panel--left">${card.insideLeft}</div>
    <div class="panel panel--right">${card.insideRight}</div>
    ${proof ? GUIDES('Inside left', 'Inside right') : ''}
  </div>
</body>
</html>`;
}
