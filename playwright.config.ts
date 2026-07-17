import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

// In some managed environments a Chromium binary is pre-installed at a fixed
// path rather than via `playwright install`. Use it when present; otherwise
// fall back to Playwright's own managed browser.
const PREINSTALLED_CHROMIUM =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const launchOptions = PREINSTALLED_CHROMIUM ? { executablePath: PREINSTALLED_CHROMIUM } : undefined;

/**
 * Playwright drives the important user journeys against a production build.
 * Tests use deterministic dates where relevant (see individual specs).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      // Mobile Chromium matches the primary ~390px target and runs with the
      // pre-installed browser. To also exercise WebKit/iOS Safari locally,
      // run `npx playwright install webkit` and add an `iPhone 13` project.
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], launchOptions },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
