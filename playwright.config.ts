import { defineConfig, devices } from '@playwright/test';

// Deliberately NOT 4321: that is `astro dev`'s default port. This suite must
// only ever see `astro preview` serving dist/.
const PORT = 4322;
const BASE_URL = `http://localhost:${PORT}`;

// Smoke + a11y run against the production build via `astro preview`, matching
// what ships. CI builds first, then Playwright boots the preview server.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: BASE_URL,
    // Never reuse. `test:e2e` rebuilds dist/ and must test *that* build; any
    // server already on this port is by definition not the one we just built
    // for. This previously read `!process.env.CI`, which silently handed the
    // whole suite to a dev server running on the shared port — the dev
    // toolbar's markup then failed assertions in ways that looked like app
    // bugs. Starting a server costs ~1s; a green run against the wrong
    // artifact costs a lot more.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
