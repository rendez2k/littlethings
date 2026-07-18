import { expect, test } from './fixtures';

test('insights show metrics and switch range', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Mark Meditate done' }).click();
  await expect(page.getByText('1 of 1 complete')).toBeVisible();

  await page.getByRole('link', { name: 'Insights' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Insights' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Completion trend' })).toBeVisible();
  await expect(page.getByText('Completion this week', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Habit performance' })).toBeVisible();

  // Range switch keeps the screen coherent.
  await page.getByRole('radio', { name: 'Month' }).click();
  await expect(page.getByText('Perfect days this month')).toBeVisible();
});

test('insights show an encouraging empty state with no habits', async ({ page }) => {
  await page.goto('/insights');
  await expect(page.getByText('No insights yet')).toBeVisible();
});
