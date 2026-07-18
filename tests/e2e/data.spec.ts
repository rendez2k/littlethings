import { expect, test } from './fixtures';

test('export, reset and re-import restores the data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first habit' }).click();
  await page.getByLabel('Name').fill('Meditate');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Meditate')).toBeVisible();

  // Export a backup.
  await page.getByRole('link', { name: 'Settings' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();

  // Reset everything.
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await expect(page.getByRole('heading', { name: 'Build better days.' })).toBeVisible();

  // Re-import the backup (merge).
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Choose a backup file' }).click();
  await page.locator('input[type=file]').setInputFiles(backupPath);
  await expect(page.getByText(/Found 1 habits/)).toBeVisible();
  await page.getByRole('button', { name: 'Merge' }).click();

  // After the reload, the habit is back.
  await page.getByRole('link', { name: 'Today' }).click();
  await expect(page.getByText('Meditate')).toBeVisible();
});
