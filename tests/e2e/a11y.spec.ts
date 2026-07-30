import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * Automated accessibility checks on the main garden screens (brief §10). We gate
 * on serious/critical violations; automated checks complement, not replace,
 * manual review.
 */
async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test('main screens have no serious accessibility violations', async ({ page }) => {
  // Seed a habit so the screens have content to audit.
  await page.goto('/');
  await page.getByRole('link', { name: 'Plant your first' }).click();
  await page.getByLabel('Name it').fill('Meditate');
  await page.getByRole('button', { name: 'Plant', exact: true }).click();
  await page.getByRole('link', { name: 'Garden' }).click();
  await page.getByRole('button', { name: 'Tend Meditate' }).first().click();
  await expect(page.getByRole('img', { name: '1 of 1 tended' })).toBeVisible();

  expect(await scan(page), 'Garden').toEqual([]);

  await page.getByRole('link', { name: 'Plants' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'All plants' })).toBeVisible();
  expect(await scan(page), 'Plants').toEqual([]);

  await page.getByRole('link', { name: 'Seeds' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Seed packet' })).toBeVisible();
  expect(await scan(page), 'Seeds').toEqual([]);

  await page.getByRole('link', { name: 'Season' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your garden');
  expect(await scan(page), 'Season').toEqual([]);

  await page.getByRole('link', { name: 'Shed' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'The shed' })).toBeVisible();
  expect(await scan(page), 'Shed').toEqual([]);
});
