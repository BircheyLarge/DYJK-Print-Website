// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical production origin. Used for sitemap, canonical URLs and JSON-LD.
const SITE_URL = 'https://www.dyjkprint.com';

// Pages that set `noindex` stay out of the sitemap too (404 is left out by
// the sitemap integration itself). tests/e2e/build-output.spec.ts checks the
// two agree.
// TODO(about-content): remove '/about/' once Stanley sends the About copy.
const NOINDEX_PATHS = ['/about/'];

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Consistent trailing-slash policy → one canonical URL shape, no duplicate-content splits.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.includes(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
