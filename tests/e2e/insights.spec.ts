import { expect, test } from './fixtures';

test('season shows plots over time and switches range', async ({ page }) => {
  // Plant a habit and tend it so the season has growth to show.
  await page.goto('/');
  await page.getByRole('link', { name: 'Plant your first' }).click();
  await page.getByLabel('Name it').fill('Meditate');
  await page.getByRole('button', { name: 'Plant', exact: true }).click();
  await page.getByRole('link', { name: 'Garden' }).click();
  await page.getByRole('button', { name: 'Tend Meditate' }).first().click();
  await expect(page.getByRole('img', { name: '1 of 1 tended' })).toBeVisible();

  await page.getByRole('link', { name: 'Season' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your garden');
  await expect(page.getByText('Each plot over time')).toBeVisible();
  await expect(page.getByText('Tallest plant')).toBeVisible();

  // The range toggle keeps the screen coherent.
  await page.getByRole('button', { name: '6m' }).click();
  await expect(page.getByRole('button', { name: '6m' })).toHaveAttribute('aria-pressed', 'true');
});

test('season greets an empty garden gently', async ({ page }) => {
  await page.goto('/insights');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your garden is waking');
});
