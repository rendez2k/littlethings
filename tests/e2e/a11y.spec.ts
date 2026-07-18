import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * Automated accessibility checks on the main screens (brief §10). We gate on
 * serious/critical violations; automated checks complement, not replace, manual
 * review.
 */
async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test('main screens have no serious accessibility violations', async ({ page }) => {
  // Seed a habit and a goal so screens have content to audit.
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Mark Meditate done' }).click();
  await expect(page.getByText('1 of 1 complete')).toBeVisible();

  expect(await scan(page), 'Today').toEqual([]);

  await page.getByRole('link', { name: 'Habits' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Habits' })).toBeVisible();
  expect(await scan(page), 'Habits').toEqual([]);

  await page.getByRole('link', { name: 'Goals' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Goals' })).toBeVisible();
  expect(await scan(page), 'Goals').toEqual([]);

  await page.getByRole('link', { name: 'Insights' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Insights' })).toBeVisible();
  expect(await scan(page), 'Insights').toEqual([]);

  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  expect(await scan(page), 'Settings').toEqual([]);
});
