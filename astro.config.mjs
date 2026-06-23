// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical production origin. Used for sitemap, canonical URLs and JSON-LD.
const SITE_URL = 'https://www.dyjkprint.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Consistent trailing-slash policy → one canonical URL shape, no duplicate-content splits.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
