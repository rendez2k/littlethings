import { expect, test } from './fixtures';

test('export, reset and re-import restores the data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Plant your first' }).click();
  await page.getByLabel('Name it').fill('Meditate');
  await page.getByRole('button', { name: 'Plant', exact: true }).click();
  await expect(page.getByText('Meditate')).toBeVisible();

  // Export a backup.
  await page.getByRole('link', { name: 'Shed' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();

  // Reset everything. This restores the default appearance (classic), so
  // re-pin the garden look and reload to keep this journey in the garden.
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await page.waitForURL('**/');
  await page.evaluate(() =>
    localStorage.setItem(
      'little-things.appearance.v1',
      JSON.stringify({ theme: 'system', palette: 'lavender', density: 'comfortable', reducedMotion: false, look: 'garden' }),
    ),
  );
  await page.goto('/');
  await expect(page.getByText('Nothing planted yet')).toBeVisible();

  // Re-import the backup (merge).
  await page.getByRole('link', { name: 'Shed' }).click();
  await page.getByRole('button', { name: 'Choose a backup file' }).click();
  await page.locator('input[type=file]').setInputFiles(backupPath);
  await expect(page.getByText(/Found 1 habits/)).toBeVisible();
  await page.getByRole('button', { name: 'Merge' }).click();

  // After the reload, the habit is back on Today.
  await page.waitForTimeout(1200);
  await page.goto('/');
  await expect(page.getByText('Meditate').first()).toBeVisible();
});
