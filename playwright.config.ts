import { defineConfig, devices } from '@playwright/test';

// Deliberately NOT 4321: that is `astro dev`'s default port. This suite must
// only ever see `astro preview` serving what `test:e2e` just built.
const PORT = 4322;
// The same site built with the quote form switched on (npm run build:form).
const FORM_PORT = 4323;

// Smoke + a11y run against the production build via `astro preview`, matching
// what ships. `test:e2e` builds both versions first.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /quote-form\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PORT}`,
      },
    },
    {
      name: 'quote-form',
      testMatch: /quote-form\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${FORM_PORT}`,
      },
    },
  ],
  // Never reuse a server: any server already on these ports is, by
  // definition, not serving the build `test:e2e` just made.
  webServer: [
    {
      command: `npm run preview -- --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm run preview -- --port ${FORM_PORT}`,
      env: { ASTRO_OUT_DIR: 'dist-form' },
      url: `http://localhost:${FORM_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
