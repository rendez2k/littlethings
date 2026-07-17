import { test as base, expect } from '@playwright/test';

/**
 * Shared test base that pre-dismisses the first-run onboarding so functional
 * tests aren't blocked by it. The onboarding itself is covered explicitly in
 * onboarding.spec.ts using the raw @playwright/test base.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('little-things.onboarded.v1', '1');
      } catch {
        // ignore
      }
    });
    await use(page);
  },
});

export { expect };
