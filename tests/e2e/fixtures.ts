import { test as base, expect } from '@playwright/test';

/**
 * Shared test base that pre-dismisses the first-run onboarding so functional
 * tests aren't blocked by it, and pins the garden look (the app default is
 * classic) so the garden journeys test the garden UI. Tests that want classic
 * override the appearance in their own init script (see look.spec.ts); the
 * onboarding flow is covered explicitly in onboarding.spec.ts using the raw
 * @playwright/test base.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('little-things.onboarded.v1', '1');
        // Seed the garden look only if the test hasn't set an appearance,
        // so this doesn't clobber changes across a reload.
        if (!localStorage.getItem('little-things.appearance.v1')) {
          localStorage.setItem(
            'little-things.appearance.v1',
            JSON.stringify({
              theme: 'system',
              palette: 'lavender',
              density: 'comfortable',
              reducedMotion: false,
              look: 'garden',
            }),
          );
        }
      } catch {
        // ignore
      }
    });
    await use(page);
  },
});

export { expect };
