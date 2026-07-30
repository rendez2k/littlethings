import { expect, test } from './fixtures';

/** Local date key (YYYY-MM-DD) matching the app's local-time keys. */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Plant a new habit from the garden editor, ending on the Plants screen. */
async function plant(page: import('@playwright/test').Page, name: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Plant your first' }).click();
  await page.getByLabel('Name it').fill(name);
  await page.getByRole('button', { name: 'Plant', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'All plants' })).toBeVisible();
}

test('plant the first habit from the empty garden', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Your garden' })).toBeVisible();
  await expect(page.getByText('Nothing planted yet')).toBeVisible();

  await page.getByRole('link', { name: 'Plant your first' }).click();
  await expect(page.getByRole('heading', { name: /Plant a new/ })).toBeVisible();
  await page.getByLabel('Name it').fill('Drink water');
  await page.getByRole('button', { name: 'Plant', exact: true }).click();

  // Lands on Plants with the new plant, and it shows on Today.
  await expect(page.getByRole('heading', { level: 1, name: 'All plants' })).toBeVisible();
  await expect(page.getByText('Drink water')).toBeVisible();
  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByText('Drink water')).toBeVisible();
  await expect(page.getByText('Nothing planted yet')).toHaveCount(0);
});

test('tend and un-tend a plant, updating the summary and streak', async ({ page }) => {
  await plant(page, 'Meditate');
  await page.getByRole('link', { name: 'Garden' }).click();

  await expect(page.getByRole('img', { name: '0 of 1 tended' })).toBeVisible();

  // Tend it on the plot (the tile is the first of the tile/row pair).
  await page.getByRole('button', { name: 'Tend Meditate' }).first().click();
  await expect(page.getByRole('img', { name: '1 of 1 tended' })).toBeVisible();
  const tended = page.getByRole('button', { name: /Meditate, tended/ });
  await expect(tended).toBeVisible();

  // Un-tend it via the tend sheet.
  await tended.click();
  await expect(page.getByRole('dialog', { name: 'Tend Meditate' })).toBeVisible();
  await page.getByRole('button', { name: 'Un-tend' }).click();
  await expect(page.getByRole('img', { name: '0 of 1 tended' })).toBeVisible();
});

test('open a plant and tend a day in its calendar', async ({ page }) => {
  await plant(page, 'Walk');

  await page.getByRole('link', { name: /Walk/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Walk');

  // Fix a day: tend today's cell in the month calendar.
  const k = todayKey();
  await page.getByRole('button', { name: k, exact: true }).click();
  await expect(page.getByRole('button', { name: `${k}, tended` })).toBeVisible();
});

test('rest, wake and pull up a plant', async ({ page }) => {
  await plant(page, 'Read');

  // Rest (archive) — returns to Plants with the plant in the Resting bed.
  await page.getByRole('link', { name: /Read/ }).click();
  await page.getByRole('button', { name: 'Archive' }).click();
  await expect(page.getByText('Resting · 1')).toBeVisible();

  // Wake (unarchive) — the plant returns to the active beds.
  await page.getByRole('link', { name: /Read/ }).click();
  await page.getByRole('button', { name: 'Unarchive' }).click();
  await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();
  await page.getByRole('link', { name: '‹ All plants' }).click();
  await expect(page.getByText('Resting')).toHaveCount(0);

  // Pull up (delete) with confirmation.
  await page.getByRole('link', { name: /Read/ }).click();
  await page.getByRole('button', { name: 'Pull up' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Pull it up' }).click();
  await expect(page.getByText('Nothing growing yet')).toBeVisible();
});
