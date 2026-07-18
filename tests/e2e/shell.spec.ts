import { expect, test } from './fixtures';

/**
 * Phase 1 smoke journeys for the application shell: navigation between the four
 * destinations, and switching to dark mode + a different palette persisting
 * across a reload.
 */
test('bottom navigation moves between the four destinations', async ({ page }) => {
  await page.goto('/');
  // A fresh install shows the welcome state on Today.
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toBeVisible();

  await page.getByRole('link', { name: 'Habits' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Habits' })).toBeVisible();

  await page.getByRole('link', { name: 'Insights' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Insights' })).toBeVisible();

  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

  await page.getByRole('link', { name: 'Today' }).click();
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toBeVisible();
});

test('theme and palette selections persist across reload', async ({ page }) => {
  await page.goto('/settings');

  await page.getByRole('radio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('radio', { name: 'Mint' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'mint');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'mint');
});

test('the date strip can move to next week (viewing future days)', async ({ page }) => {
  await page.goto('/');
  // Need at least one habit so Today renders the date strip.
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();

  const nextWeek = page.getByRole('button', { name: 'Next week' });
  await expect(nextWeek).toBeEnabled();
  await nextWeek.click();
  // "Back to today" appears once we've navigated away from today.
  await expect(page.getByRole('button', { name: /Back to today/ })).toBeVisible();
});
