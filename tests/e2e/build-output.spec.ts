import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';

const dist = new URL('../../dist/', import.meta.url);

/** Every built page as [path, html]. */
function builtPages(): Array<[string, string]> {
  return fs
    .readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file, fs.readFileSync(new URL(file, dist), 'utf8')]);
}

// Astro copies a full-size original into dist/_astro whenever code reads its
// metadata directly (e.g. image.width). Originals can carry details the
// resized versions don't show, so every image there must be one a built page
// actually references.
test('ships no image that no page references', () => {
  const html = builtPages()
    .map(([, page]) => page)
    .join('\n');
  const images = fs
    .readdirSync(new URL('_astro/', dist))
    .filter((file) => /\.(avif|webp|jpe?g|png)$/.test(file));

  expect(images.length).toBeGreaterThan(0);
  expect(images.filter((file) => !html.includes(file))).toEqual([]);
});

// The site deploys to Cloudflare Pages, which ignores Apache config.
test('ships no Apache config', () => {
  expect(fs.existsSync(new URL('.htaccess', dist))).toBe(false);
});

// Cloudflare Pages reads dist/_headers. HSTS stays max-age only: the domain's
// Microsoft 365 subdomains must never inherit it.
test('ships the Cloudflare Pages headers from public/', () => {
  const built = new URL('_headers', dist);
  expect(fs.existsSync(built)).toBe(true);
  const file = fs.readFileSync(built, 'utf8');
  expect(file).toBe(
    fs.readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8'),
  );

  // Path line, then its indented "Name: value" lines.
  const rules: Record<string, Record<string, string>> = {};
  let path = '';
  for (const line of file.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      path = line.trim();
      rules[path] = {};
      continue;
    }
    const [name, ...value] = line.trim().split(':');
    rules[path]![name!.trim()] = value.join(':').trim();
  }

  expect(rules).toEqual({
    '/*': {
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    '/_astro/*': {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
  // The comment explains why; only the rules themselves are checked here.
  const active = file
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
  expect(active).not.toMatch(/includeSubDomains|preload/i);
});

// Cloudflare Pages reads dist/_redirects. It carries only the old-URL
// redirects; https and the host redirect live in Cloudflare itself.
test('ships the Cloudflare Pages redirects from public/', () => {
  const built = new URL('_redirects', dist);
  expect(fs.existsSync(built)).toBe(true);
  const rules = fs.readFileSync(built, 'utf8');
  expect(rules).toBe(
    fs.readFileSync(
      new URL('../../public/_redirects', import.meta.url),
      'utf8',
    ),
  );
  const active = rules
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/));
  expect(active).toEqual([
    ['/about', '/about/', '301'],
    ['/contact', '/contact/', '301'],
    ['/sitemap.xml', '/sitemap-index.xml', '301'],
  ]);
});

test('lists exactly the indexable pages in the sitemap', () => {
  const sitemapPaths = fs
    .readdirSync(dist)
    .filter((file) => /^sitemap-\d+\.xml$/.test(file))
    .flatMap((file) =>
      [
        ...fs
          .readFileSync(new URL(file, dist), 'utf8')
          .matchAll(/<loc>([^<]+)<\/loc>/g),
      ].map(([, loc]) => new URL(loc!).pathname),
    )
    .sort();
  const pages = builtPages().map(([file, html]) => ({
    path: `/${file.replace(/index\.html$/, '')}`,
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    canonical: /<link rel="canonical"/.test(html),
  }));

  const indexable = pages.filter((page) => !page.noindex);
  expect(sitemapPaths).toEqual(indexable.map((page) => page.path).sort());
  // About has its real copy now, so it's indexed and listed.
  expect(sitemapPaths).toContain('/about/');
  // A page kept out of search names no canonical URL either.
  expect(pages.filter((page) => page.noindex && page.canonical)).toEqual([]);
  expect(pages.filter((page) => !page.noindex && !page.canonical)).toEqual([]);
});

test('every tel: link dials SITE.phone, and none exist while it is unset', () => {
  const telLinks = builtPages().flatMap(([file, html]) =>
    [...html.matchAll(/href=["']?(tel:[^"' >]*)/gi)].map(
      ([, href]) => [file, href] as const,
    ),
  );
  if (SITE.phone === null) {
    expect(telLinks).toEqual([]);
  } else {
    expect(telLinks.length).toBeGreaterThan(0);
    const expected = `tel:${SITE.phone.e164}`;
    expect(telLinks.filter(([, href]) => href !== expected)).toEqual([]);
  }
});

test('never shows the old number, which was never DYJK’s, or Stan’s cell', () => {
  // The cell stays on his business card and door flyer only.
  const withWrongNumber = builtPages()
    .filter(([, html]) => /960\W?3396|573\W?6774/.test(html))
    .map(([file]) => file);
  expect(withWrongNumber).toEqual([]);
});

/** A page's <link> tags, as attribute maps. */
function links(html: string): Array<Record<string, string>> {
  return [...html.matchAll(/<link\b([^>]*)>/g)].map(([, attributes]) =>
    Object.fromEntries(
      [...attributes!.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(
        ([, name, value]) => [name!, value ?? ''],
      ),
    ),
  );
}

// Google's result shows the site icon, so every page names the same set.
test('every page links the site icons', () => {
  const wanted = [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ];
  const missing: string[] = [];
  for (const [file, html] of builtPages()) {
    const found = links(html);
    for (const want of wanted) {
      const ok = found.some((link) =>
        Object.entries(want).every(([name, value]) => link[name] === value),
      );
      if (!ok) missing.push(`${file}: ${JSON.stringify(want)}`);
    }
    if (html.includes('favicon.svg')) missing.push(`${file}: favicon.svg`);
  }
  expect(missing).toEqual([]);
});

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(file: URL): [number, number] {
  const bytes = fs.readFileSync(file);
  expect(bytes.subarray(1, 4).toString('latin1'), String(file)).toBe('PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

/** The square sizes inside an .ico (a 0 byte means 256). */
function icoSizes(file: URL): number[] {
  const bytes = fs.readFileSync(file);
  return Array.from(
    { length: bytes.readUInt16LE(4) },
    (_, entry) => bytes[6 + 16 * entry] || 256,
  ).sort((a, b) => a - b);
}

test('ships the site icons at their pixel sizes', () => {
  expect(icoSizes(new URL('favicon.ico', dist))).toEqual([16, 32, 48]);
  for (const [file, size] of [
    ['icon-48.png', 48],
    ['icon-96.png', 96],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180],
  ] as const) {
    expect(pngSize(new URL(file, dist)), file).toEqual([size, size]);
  }
  expect(fs.existsSync(new URL('favicon.svg', dist))).toBe(false);

  const manifest = JSON.parse(
    fs.readFileSync(new URL('site.webmanifest', dist), 'utf8'),
  ) as {
    theme_color: string;
    icons: Array<{ src: string; sizes: string }>;
  };
  expect(manifest.theme_color).toBe('#14517d');
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual([
    '192x192',
    '512x512',
  ]);
  for (const icon of manifest.icons) {
    const [width, height] = pngSize(new URL(icon.src.slice(1), dist));
    expect(`${width}x${height}`, icon.src).toBe(icon.sizes);
  }
});
