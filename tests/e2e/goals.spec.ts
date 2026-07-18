import { expect, test } from './fixtures';

test('add a bucket-list goal and mark it done', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Goals' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Goals' })).toBeVisible();
  await expect(page.getByText('Dream a little')).toBeVisible();

  await page.getByRole('button', { name: 'Add a goal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Goal', { exact: true }).fill('Visit Japan');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Visit Japan')).toBeVisible();

  // Mark done → moves to the Done section.
  await page.getByRole('checkbox', { name: 'Mark Visit Japan done' }).click();
  await expect(page.getByRole('heading', { name: /Done \(1\)/ })).toBeVisible();
});
