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
  // Outfit, the site's one typeface. <Font> in BaseHead emits the @font-face
  // rules and the first-screen preloads; global.css maps it to --font-sans.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Outfit',
      cssVariable: '--font-outfit',
      // Headings are Outfit 700, 3.6% wider than 400, so one set of fallback
      // metrics no longer fits every weight: the fallback faces are written
      // per weight in global.css.
      optimizedFallbacks: false,
      fallbacks: ['Outfit Fallback', 'sans-serif'],
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
          {
            weight: 700,
            style: 'normal',
            src: ['./src/assets/fonts/outfit/outfit-latin-700.woff2'],
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
