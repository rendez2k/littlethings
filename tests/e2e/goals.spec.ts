import { expect, test } from './fixtures';

test('plant a seed (goal) and sprout it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Seeds' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Seed packet' })).toBeVisible();
  await expect(page.getByText(/No seeds yet/)).toBeVisible();

  await page.getByRole('button', { name: 'Add seed' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Name it').fill('Visit Japan');
  // The icon is suggested from the title ("Visit Japan" → plane).
  await expect(page.getByRole('button', { name: 'plane' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Add to the packet' }).click();

  await expect(page.getByText('Visit Japan')).toBeVisible();

  // Plant it → it sprouts.
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByText('Sprouted')).toBeVisible();
});
