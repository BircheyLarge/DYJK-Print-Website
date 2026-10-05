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

test('ships the Apache config from public/', () => {
  const built = new URL('.htaccess', dist);
  expect(fs.existsSync(built)).toBe(true);
  expect(fs.readFileSync(built, 'utf8')).toBe(
    fs.readFileSync(new URL('../../public/.htaccess', import.meta.url), 'utf8'),
  );
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
