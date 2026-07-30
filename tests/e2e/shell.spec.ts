import { expect, test } from './fixtures';

/**
 * Smoke journeys for the garden shell: the five bottom-nav destinations, and a
 * theme + palette selection persisting across a reload.
 */
test('bottom navigation moves between the five destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Your garden' })).toBeVisible();

  await page.getByRole('link', { name: 'Plants' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'All plants' })).toBeVisible();

  await page.getByRole('link', { name: 'Seeds' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Seed packet' })).toBeVisible();

  await page.getByRole('link', { name: 'Season' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your garden');

  await page.getByRole('link', { name: 'Shed' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'The shed' })).toBeVisible();

  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your garden' })).toBeVisible();
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
