import { expect, test } from './fixtures';

/**
 * Verifies the PWA works offline: after a first online load the app shell and
 * data survive losing connectivity (brief §4). The service worker registers in
 * the production build the Playwright server runs.
 */
test('keeps working after going offline', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Meditate')).toBeVisible();

  // Wait for the service worker to take control and cache the shell/assets.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForTimeout(1500);

  // Go offline and reload.
  await context.setOffline(true);
  await page.reload();

  // The app shell loads from cache and local data is intact.
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await expect(page.getByText('Meditate')).toBeVisible();

  // Local navigation still works while offline.
  await page.getByRole('link', { name: 'Habits' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Habits' })).toBeVisible();

  await context.setOffline(false);
});
