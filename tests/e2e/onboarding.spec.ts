import { expect, test } from '@playwright/test';

// Uses the raw base (no onboarding pre-dismissal) to exercise first-run.
test('shows onboarding once, then not again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to Little Things' })).toBeVisible();
  await page.getByRole('button', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to Little Things' })).toHaveCount(0);

  // Reloading does not show it again.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to Little Things' })).toHaveCount(0);
});
