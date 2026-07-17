import { expect, test } from '@playwright/test';

/**
 * Phase 3 journey: first launch → create the first habit → it appears on Today,
 * and the welcome state is replaced. Each test gets an isolated IndexedDB.
 */
test('create the first habit from the welcome screen', async ({ page }) => {
  await page.goto('/');

  // First-launch welcome.
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toBeVisible();

  await page.getByRole('button', { name: 'Create my first habit' }).click();

  // Editor sheet opens.
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Name').fill('Drink water');
  await page.getByRole('button', { name: 'Save' }).click();

  // Back on Today, the habit is listed and the welcome is gone.
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await expect(page.getByText('Drink water')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toHaveCount(0);
});

test('create a habit from a template', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Use a template' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  // Pick the "Meditate" template.
  await page.getByRole('button', { name: /Meditate/ }).click();

  // The create form is prefilled; save it.
  await expect(page.getByLabel('Name')).toHaveValue('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Meditate')).toBeVisible();
});

test('complete and undo a habit, updating the summary and streak', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();

  // Complete it.
  await page.getByRole('button', { name: 'Mark Meditate done' }).click();
  await expect(page.getByRole('button', { name: 'Mark Meditate not done' })).toBeVisible();
  await expect(page.getByText('1 of 1 complete')).toBeVisible();
  await expect(page.getByLabel('1 day streak')).toBeVisible();

  // Undo it.
  await page.getByRole('button', { name: 'Mark Meditate not done' }).click();
  await expect(page.getByRole('button', { name: 'Mark Meditate done' })).toBeVisible();
  await expect(page.getByText('0 of 1 complete')).toBeVisible();
});
