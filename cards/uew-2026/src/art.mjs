// Seasonal line-art for the UEW 2026 greeting cards.
//
// Every motif is derived from the client's own mark: the caduceus sits inside
// three crossed ellipses with three "electron" dots. Those ellipses and dots
// reappear here as a wreath, an ornament and a star so the artwork reads as
// UEW's rather than as generic seasonal clip-art.

const TAU = Math.PI * 2;
const rad = (deg) => (deg * Math.PI) / 180;
const n = (v) => Number(v.toFixed(3));

/** Deterministic PRNG so every build produces byte-identical art. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pointed almond — one wheat grain, one berry husk, one leaf blade. */
function almond(cx, cy, len, wid, angle) {
  const dx = Math.cos(angle) * len;
  const dy = Math.sin(angle) * len;
  const mx = cx + dx * 0.42;
  const my = cy + dy * 0.42;
  const nx = -Math.sin(angle) * wid;
  const ny = Math.cos(angle) * wid;
  return (
    `M${n(cx)} ${n(cy)}` +
    `Q${n(mx + nx)} ${n(my + ny)} ${n(cx + dx)} ${n(cy + dy)}` +
    `Q${n(mx - nx)} ${n(my - ny)} ${n(cx)} ${n(cy)}Z`
  );
}

/**
 * One stalk of wheat, base at the origin, growing along -Y.
 * Returns { fills, strokes } so the caller can render grains solid and awns hairline.
 */
export function wheatStalk({
  length = 100,
  grains = 9,
  grainLen = 20,
  grainWid = 4.6,
  spread = 38,
  awns = true,
  awnScale = 0.62,
  start = 0.4,
  lean = 0.05,
} = {}) {
  const fills = [];
  const strokes = [];
  // stem, with a slight natural lean
  strokes.push(
    `M0 0C${n(length * lean)} ${n(-length * 0.34)} ${n(length * lean * 1.6)} ${n(
      -length * 0.66,
    )} ${n(length * lean * 1.1)} ${n(-length)}`,
  );

  const stemX = (t) => length * lean * (1.9 * t - 0.95 * t * t);
  for (let i = 0; i < grains; i++) {
    const t = grains === 1 ? 1 : i / (grains - 1);
    const y = -length * (start + (1 - start) * t);
    const x = stemX(start + (1 - start) * t);
    const scale = 1 - 0.42 * t;
    const gl = grainLen * scale;
    const gw = grainWid * scale;
    for (const side of [-1, 1]) {
      const a = rad(-90 + side * spread * (1 - 0.25 * t));
      fills.push(almond(x, y, gl, gw, a));
      if (awns) {
        const tipX = x + Math.cos(a) * gl;
        const tipY = y + Math.sin(a) * gl;
        strokes.push(
          `M${n(tipX)} ${n(tipY)}L${n(tipX + Math.cos(a - 0.12) * gl * awnScale)} ${n(
            tipY + Math.sin(a - 0.12) * gl * awnScale,
          )}`,
        );
      }
    }
  }
  // crown grain
  const topX = stemX(1);
  const topY = -length;
  fills.push(almond(topX, topY, grainLen * 0.62, grainWid * 0.58, rad(-90)));
  if (awns) {
    strokes.push(`M${n(topX)} ${n(topY - grainLen * 0.62)}L${n(topX)} ${n(topY - grainLen * 1.25)}`);
  }
  return { fills, strokes };
}

/** A simple pointed leaf with a midrib, base at origin, growing along -Y. */
export function leaf({ length = 46, width = 15, veins = 3 } = {}) {
  const fills = [almond(0, 0, length, width, rad(-90))];
  const strokes = [`M0 0L0 ${n(-length)}`];
  for (let i = 1; i <= veins; i++) {
    const t = i / (veins + 1);
    const y = -length * (0.18 + 0.62 * t);
    const w = width * 1.42 * (1 - t) * 0.8;
    strokes.push(`M0 ${n(y)}L${n(-w)} ${n(y - w * 0.75)}`);
    strokes.push(`M0 ${n(y)}L${n(w)} ${n(y - w * 0.75)}`);
  }
  return { fills, strokes };
}

/** Three crossed ellipses + three dots — the mark's atom, abstracted. */
function atomRings(r, { squash = 0.42, rotations = [0, 60, 120] } = {}) {
  return rotations
    .map(
      (deg) =>
        `<ellipse cx="0" cy="0" rx="${n(r * squash)}" ry="${n(r)}" transform="rotate(${deg})"/>`,
    )
    .join('');
}

function atomDots(r, fill, size = 3.2, angles = [-52, 62, 186]) {
  return angles
    .map((deg) => {
      const a = rad(deg);
      return `<circle cx="${n(Math.cos(a) * r)}" cy="${n(Math.sin(a) * r)}" r="${n(
        size,
      )}" fill="${fill}" stroke="none"/>`;
    })
    .join('');
}

/**
 * Harvest wreath — wheat laid tangentially around a ring, with the mark's three
 * electron dots sitting on the ring in their logo positions.
 */
/**
 * Collects paths per colour so one drawing can carry several tones without
 * emitting a separate <g> for every single stalk.
 */
function toneBuckets() {
  const map = new Map();
  const get = (tone) => {
    if (!map.has(tone)) map.set(tone, { fills: [], strokes: [] });
    return map.get(tone);
  };
  const render = (strokeWidth = 1, fillOpacity = 0.93, strokeOpacity = 0.6) =>
    [...map]
      .map(
        ([tone, g]) =>
          `<g fill="${tone}" stroke="none" opacity="${fillOpacity}">${g.fills.join('')}</g>` +
          `<g fill="none" stroke="${tone}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${strokeOpacity}">${g.strokes.join('')}</g>`,
      )
      .join('');
  return { get, render };
}

export function wheatWreath({
  size = 320,
  radius = 116,
  stalks = 20,
  ink = '#133D64',
  inks = null, // several wheat tones, cycled — for the autumn palette
  leaves = 0, // foliage tucked into the ring
  leafInks = null,
  accent = '#F15933',
  seed = 7,
} = {}) {
  const r = rng(seed);
  const wheatTones = inks && inks.length ? inks : [ink];
  const leafTones = leafInks && leafInks.length ? leafInks : [ink];
  const b = toneBuckets();

  // The stalk is drawn growing along -Y, so rotating it by (angle + 180deg)
  // lays it along the tangent; the extra tilt curls the head back toward the
  // ring instead of letting the chord bulge outward.
  const place = (part, a, rr, tilt) => {
    const deg = (a * 180) / Math.PI + 180 + tilt;
    const tx = Math.cos(a) * rr;
    const ty = Math.sin(a) * rr;
    const open = `<g transform="translate(${n(tx)} ${n(ty)}) rotate(${n(deg)})">`;
    return {
      fill: open + part.fills.map((d) => `<path d="${d}"/>`).join('') + '</g>',
      stroke: open + part.strokes.map((d) => `<path d="${d}"/>`).join('') + '</g>',
    };
  };

  for (let i = 0; i < stalks; i++) {
    const a = (i / stalks) * TAU - Math.PI / 2;
    const s = wheatStalk({
      length: 84 + r() * 10,
      grains: 7,
      grainLen: 16,
      grainWid: 3.7,
      spread: 32,
      awnScale: 0.46,
      lean: 0.05,
    });
    const g = b.get(wheatTones[i % wheatTones.length]);
    const p = place(s, a, radius + (r() - 0.5) * 6, 21 + (r() - 0.5) * 5);
    g.fills.push(p.fill);
    g.strokes.push(p.stroke);
  }

  for (let i = 0; i < leaves; i++) {
    const a = ((i + 0.5) / leaves) * TAU - Math.PI / 2;
    const l = leaf({ length: 30 + r() * 8, width: 10.5, veins: 2 });
    const g = b.get(leafTones[i % leafTones.length]);
    const p = place(l, a, radius + 5 + (r() - 0.5) * 8, 44 + (r() - 0.5) * 26);
    g.fills.push(p.fill);
    g.strokes.push(p.stroke);
  }

  const half = size / 2;
  return `<svg viewBox="${-half} ${-half} ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  ${b.render(1, 0.93, 0.55)}
  <g fill="${accent}">
    <circle cx="-5.5" cy="${n(radius + 3)}" r="4.6"/>
    <circle cx="4" cy="${n(radius + 6)}" r="3.8"/>
    <circle cx="1.5" cy="${n(radius - 3.5)}" r="3.2"/>
  </g>
</svg>`;
}

/** Wheat and leaves fanned into an arc — the formal harvest card. */
export function harvestArc({
  width = 460,
  height = 190,
  spread = 82,
  stalkLen = 132,
  strokeOpacity = 0.55,
  ink = '#D9B368',
  inks = null,
  leafInks = null,
  accent = '#F8A484',
  seed = 21,
} = {}) {
  const r = rng(seed);
  const wheatTones = inks && inks.length ? inks : [ink];
  const leafTones = leafInks && leafInks.length ? leafInks : [ink];
  const b = toneBuckets();
  const push = (part, deg, tx, ty, tone) => {
    const open = `<g transform="translate(${n(tx)} ${n(ty)}) rotate(${n(deg)})">`;
    const g = b.get(tone);
    g.fills.push(open + part.fills.map((d) => `<path d="${d}"/>`).join('') + '</g>');
    g.strokes.push(open + part.strokes.map((d) => `<path d="${d}"/>`).join('') + '</g>');
  };
  const count = 11;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const deg = -spread + t * spread * 2;
    const s = wheatStalk({
      length: stalkLen - Math.abs(deg) * 0.5 + r() * 8,
      grains: 8,
      grainLen: 17.5,
      grainWid: 4,
      spread: 34,
      awnScale: 0.5,
      // grains start high so the stems stay open at the base instead of
      // massing into a solid wedge where they converge
      start: 0.52,
      lean: 0.045 + r() * 0.025,
    });
    // fan the origins along a shallow arc rather than one point
    push(s, deg, Math.sin(rad(deg)) * 9, Math.cos(rad(deg)) * -3, wheatTones[i % wheatTones.length]);
  }
  [-104, -86, 88, 106].forEach((deg, i) => {
    push(leaf({ length: 48, width: 15, veins: 3 }), deg, 0, -6, leafTones[i % leafTones.length]);
  });
  // binding, so the stems read as a gathered sheaf
  const tie = `<g fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" opacity="0.85">
    <path d="M-21 -20Q0 -8 21 -20"/><path d="M-19 -12Q0 0 19 -12"/>
  </g>`;
  return `<svg viewBox="${-width / 2} ${-height} ${width} ${height + 26}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  ${b.render(1.05, 0.95, strokeOpacity)}
  ${tie}
  <circle cx="0" cy="-16" r="3.2" fill="${accent}"/>
</svg>`;
}

/** A tight, precise cluster of three leaves for the editorial card. */
export function leafCluster({ ink = '#133D64', inks = null, accent = '#F15933', size = 150 } = {}) {
  const parts = [
    { deg: -26, scale: 1, len: 62, wid: 18 },
    { deg: 10, scale: 0.88, len: 62, wid: 18 },
    { deg: 44, scale: 0.74, len: 62, wid: 18 },
  ];
  const tones = inks && inks.length ? inks : [ink];
  const fills = [];
  const strokes = [];
  parts.forEach((p, i) => {
    const l = leaf({ length: p.len, width: p.wid, veins: 3 });
    const open = `<g transform="rotate(${p.deg}) scale(${p.scale})">`;
    const tone = tones[i % tones.length];
    fills.push(`<g stroke="${tone}">` + open + l.fills.map((d) => `<path d="${d}"/>`).join('') + '</g></g>');
    strokes.push(`<g stroke="${tone}">` + open + l.strokes.map((d) => `<path d="${d}"/>`).join('') + '</g></g>');
  });
  return `<svg viewBox="${-size / 2} ${-size * 0.78} ${size} ${size * 0.92}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g fill="none" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round">${fills.join('')}</g>
  <g fill="none" stroke="${ink}" stroke-width="1" stroke-linecap="round" opacity="0.5">${strokes.join('')}</g>
  <circle cx="0" cy="4" r="4.2" fill="${accent}"/>
</svg>`;
}

/**
 * The atom as an ornament: the mark's three ellipses hung on a thread.
 * `hang` extends the thread up out of the artboard so it can run to the trim.
 */
export function atomOrnament({
  r = 84,
  ink = '#D9B368',
  accent = '#F8A484',
  hang = 250,
  width = 260,
} = {}) {
  const capW = 17;
  const capH = 13;
  const top = -r - capH - 5;
  return `<svg viewBox="${-width / 2} ${-hang} ${width} ${hang + r + 40}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g fill="none" stroke="${ink}" stroke-width="1.5">
    <path d="M0 ${n(-hang)}L0 ${n(top - 9)}"/>
    <path d="M${n(-capW / 2)} ${n(top)}h${capW}v${capH}h${-capW}z"/>
    <path d="M0 ${n(top)}a5.4 5.4 0 0 1 0-10.8 5.4 5.4 0 0 1 0 10.8" stroke-width="1.5"/>
  </g>
  <g fill="none" stroke="${ink}" stroke-width="1.9">
    <circle cx="0" cy="0" r="${n(r)}"/>
  </g>
  <g fill="none" stroke="${ink}" stroke-width="1.15" opacity="0.85">${atomRings(r * 0.94)}</g>
  ${atomDots(r * 0.94, accent, 4.2)}
</svg>`;
}

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/**
 * A soft halo built from concentric *opaque* rings.
 *
 * The obvious way to do this is a radial gradient with alpha, but Skia
 * flattens that to a 72 dpi bitmap on the way into the PDF — a 2.5in raster
 * in an otherwise all-vector print file. Interpolating the colour against a
 * known background instead keeps every ring a flat fill, so the file stays
 * vector and the vendor gets no low-resolution image to flag.
 */
function halo(radius, tint, background, { strength = 0.3, steps = 28, falloff = 2.2 } = {}) {
  const t0 = hex2rgb(tint);
  const bg = hex2rgb(background);
  const out = [];
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    // sample the falloff at the ring's midpoint so the innermost disc, which
    // covers the centre, still lands at near-full strength
    const a = strength * Math.pow(1 - (i - 0.5) / steps, falloff);
    const c = rgb2hex(t0.map((v, k) => a * v + (1 - a) * bg[k]));
    out.push(`<circle cx="0" cy="0" r="${n(radius * t)}" fill="${c}"/>`);
  }
  return out.join('');
}

/** Eight-point star with two orbits — the luminous Christmas card. */
export function starBurst({
  size = 340,
  ink = '#D9B368',
  accent = '#F8A484',
  glow = true,
  glowOn = '#0a2340',
} = {}) {
  const long = size * 0.46;
  const short = size * 0.2;
  const waist = size * 0.036;
  const ray = (len, deg) =>
    `<path transform="rotate(${deg})" d="M0 ${n(-len)}Q${n(waist * 0.55)} ${n(-waist * 1.4)} ${n(
      waist,
    )} 0Q${n(waist * 0.55)} ${n(waist * 1.4)} 0 ${n(len)}Q${n(-waist * 0.55)} ${n(
      waist * 1.4,
    )} ${n(-waist)} 0Q${n(-waist * 0.55)} ${n(-waist * 1.4)} 0 ${n(-len)}Z"/>`;
  const half = size / 2;
  const rx = size * 0.185;
  const ry = size * 0.435;
  // electrons ride the orbit rings rather than floating loose in the field
  const onOrbit = (rot, t, rr = 3) => {
    const x = rx * Math.cos(rad(t));
    const y = ry * Math.sin(rad(t));
    const c = Math.cos(rad(rot));
    const s = Math.sin(rad(rot));
    return `<circle cx="${n(x * c - y * s)}" cy="${n(x * s + y * c)}" r="${rr}" fill="${accent}"/>`;
  };
  return `<svg viewBox="${-half} ${-half} ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  ${glow ? halo(half, ink, glowOn, { strength: 0.3, steps: 30 }) : ''}
  <g fill="none" stroke="${ink}" stroke-width="1" opacity="0.55">
    <ellipse rx="${n(rx)}" ry="${n(ry)}" transform="rotate(28)"/>
    <ellipse rx="${n(rx)}" ry="${n(ry)}" transform="rotate(-28)"/>
  </g>
  <g fill="${ink}">${ray(long, 0)}${ray(short * 1.35, 90)}</g>
  <g fill="${ink}" opacity="0.72">${ray(short, 45)}${ray(short, -45)}</g>
  ${onOrbit(28, -66, 3.2)}${onOrbit(28, 124, 2.4)}${onOrbit(-28, 58, 3.2)}
</svg>`;
}

/** Fir sprig with berries — the light, modern Christmas card. */
export function firSprig({
  length = 250,
  ink = '#133D64',
  accent = '#F15933',
  pairs = 24,
  berries = true,
  seed = 3,
} = {}) {
  const r = rng(seed);
  const strokes = [];

  /** One needled shoot: needles sweep up hard and stay near-constant length,
   *  which is what separates a fir branch from a fern frond. */
  function shoot(len, count, tx, ty, deg, scale = 1) {
    const parts = [`M0 0C${n(len * 0.03)} ${n(-len * 0.4)} ${n(-len * 0.02)} ${n(-len * 0.72)} 0 ${n(-len)}`];
    for (let i = 0; i < count; i++) {
      const t = 0.05 + (i / (count - 1)) * 0.93;
      const y = -len * t;
      const nl = len * 0.15 * (1 - 0.42 * t * t) + 2.5 + (r() - 0.5) * len * 0.012;
      for (const side of [-1, 1]) {
        const a = rad(-90 + side * (46 - 20 * t)) + (r() - 0.5) * 0.08;
        const ex = Math.cos(a) * nl;
        const ey = y + Math.sin(a) * nl;
        const bow = nl * 0.1;
        const cx = Math.cos(a) * nl * 0.55 + Math.cos(a - Math.PI / 2) * bow * side;
        const cy = y + Math.sin(a) * nl * 0.55 + Math.sin(a - Math.PI / 2) * bow * side;
        parts.push(`M0 ${n(y)}Q${n(cx)} ${n(cy)} ${n(ex)} ${n(ey)}`);
      }
    }
    strokes.push(
      `<g transform="translate(${n(tx)} ${n(ty)}) rotate(${n(deg)}) scale(${n(scale)})">${parts
        .map((d) => `<path d="${d}"/>`)
        .join('')}</g>`,
    );
  }

  // main shoot plus two branchlets, so the silhouette is a branch not a frond
  shoot(length, pairs, 0, 0, 0);
  shoot(length * 0.34, Math.round(pairs * 0.42), -1, -length * 0.3, -34);
  shoot(length * 0.29, Math.round(pairs * 0.38), 1, -length * 0.19, 31);

  const berryArt = berries
    ? `<g fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round">
    <path d="M0 ${n(-length * 0.07)}Q${n(-length * 0.05)} ${n(-length * 0.1)} ${n(
        -length * 0.062,
      )} ${n(-length * 0.132)}"/>
  </g>
  <g fill="${accent}">
    <circle cx="${n(-length * 0.062)}" cy="${n(-length * 0.148)}" r="${n(length * 0.023)}"/>
    <circle cx="${n(-length * 0.016)}" cy="${n(-length * 0.116)}" r="${n(length * 0.019)}"/>
    <circle cx="${n(-length * 0.086)}" cy="${n(-length * 0.104)}" r="${n(length * 0.016)}"/>
  </g>`
    : '';

  return `<svg viewBox="${-length * 0.36} ${-length * 1.06} ${length * 0.72} ${length * 1.14}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round">${strokes.join('')}</g>
  ${berryArt}
</svg>`;
}

/** Hairline rule with the mark's three dots centred in it. */
export function dottedRule({ width = 150, ink = '#133D64', accent = '#F15933' } = {}) {
  const gap = 26;
  return `<svg viewBox="0 0 ${width} 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g stroke="${ink}" stroke-width="0.8" opacity="0.55">
    <line x1="0" y1="5" x2="${n(width / 2 - gap / 2)}" y2="5"/>
    <line x1="${n(width / 2 + gap / 2)}" y1="5" x2="${width}" y2="5"/>
  </g>
  <circle cx="${n(width / 2)}" cy="5" r="2.6" fill="${accent}"/>
  <circle cx="${n(width / 2 - 9)}" cy="5" r="1.5" fill="${ink}" opacity="0.6"/>
  <circle cx="${n(width / 2 + 9)}" cy="5" r="1.5" fill="${ink}" opacity="0.6"/>
</svg>`;
}
