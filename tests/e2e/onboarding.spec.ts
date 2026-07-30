import { expect, test } from '@playwright/test';

// Uses the raw base (no onboarding pre-dismissal) to exercise first-run.
test('shows onboarding once, then not again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Welcome to Little Things' })).toBeVisible();

  // Three garden slides: Continue, Continue, then "Plant your first".
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Plant your first/ }).click();
  await expect(page.getByRole('dialog', { name: 'Welcome to Little Things' })).toHaveCount(0);

  // Reloading does not show it again.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Your garden' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Welcome to Little Things' })).toHaveCount(0);
});
