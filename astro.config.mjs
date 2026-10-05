// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical production origin. Used for sitemap, canonical URLs and JSON-LD.
const SITE_URL = 'https://www.dyjkprint.com';

// Pages that set `noindex` stay out of the sitemap too (404 is left out by
// the sitemap integration itself). tests/e2e/build-output.spec.ts checks the
// two agree.
/** @type {string[]} */
const NOINDEX_PATHS = [];

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Consistent trailing-slash policy → one canonical URL shape, no duplicate-content splits.
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Card B type (#myfkg6). <Font> in BaseHead emits the @font-face rules and
  // the first-screen preloads; global.css maps these to --font-sans/--font-display.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Outfit',
      cssVariable: '--font-outfit',
      // Astro derives the metric-matched Arial fallback from the first file.
      // Outfit's average width barely moves across these weights (0.445 to
      // 0.454em), so one set of metrics fits all three.
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/outfit/outfit-latin-400.woff2'],
          },
          {
            weight: 500,
            style: 'normal',
            src: ['./src/assets/fonts/outfit/outfit-latin-500.woff2'],
          },
          {
            weight: 600,
            style: 'normal',
            src: ['./src/assets/fonts/outfit/outfit-latin-600.woff2'],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Syne',
      cssVariable: '--font-syne',
      // Syne widens sharply with weight (0.508em at 600, 0.789em at 800), which
      // one set of metrics per family can't match, so its fallback faces are
      // written per weight in global.css instead.
      optimizedFallbacks: false,
      fallbacks: ['Syne Fallback', 'sans-serif'],
      options: {
        variants: [
          {
            weight: 600,
            style: 'normal',
            src: ['./src/assets/fonts/syne/syne-latin-600.woff2'],
          },
          {
            weight: 700,
            style: 'normal',
            src: ['./src/assets/fonts/syne/syne-latin-700.woff2'],
          },
          {
            weight: 800,
            style: 'normal',
            src: ['./src/assets/fonts/syne/syne-latin-800.woff2'],
          },
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.includes(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
