import { expect, test } from './fixtures';

const CLASSIC = JSON.stringify({
  theme: 'light',
  palette: 'lavender',
  density: 'comfortable',
  reducedMotion: false,
  look: 'classic',
});

test('classic look renders the classic shell and switches back to garden', async ({ page }) => {
  await page.addInitScript((v) => {
    try {
      localStorage.setItem('little-things.appearance.v1', v);
    } catch {
      /* ignore */
    }
  }, CLASSIC);

  await page.goto('/');
  // Classic bottom nav (Today / Habits / Goals / Insights / Settings), not garden.
  await expect(page.getByRole('link', { name: 'Habits', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Plants' })).toHaveCount(0);

  // Flip back to garden from Settings.
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await page.getByRole('radio', { name: 'Garden' }).click();

  // The garden shell takes over (Plants / Seeds / Season / Shed).
  await expect(page.getByRole('link', { name: 'Plants' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Shed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Habits', exact: true })).toHaveCount(0);
});
