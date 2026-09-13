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

test('tick a habit off from the month calendar', async ({ page }) => {
  await plant(page, 'Stretch');
  await page.getByRole('link', { name: 'Garden' }).click();
  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();

  // Today is selected on arrival and shows the habit as still open.
  const k = todayKey();
  const cell = page.locator(`[data-date="${k}"]`);
  await expect(cell).toHaveAttribute('aria-pressed', 'true');
  await expect(cell).toHaveAttribute('aria-label', /0 of 1 done/);
  await expect(page.getByRole('heading', { level: 2, name: 'Today' })).toBeVisible();

  // Tick it off in the day panel → the cell's roll-up follows.
  await page.getByRole('button', { name: 'Mark Stretch done' }).click();
  await expect(cell).toHaveAttribute('aria-label', /1 of 1 done/);
  await expect(page.getByRole('button', { name: 'Mark Stretch not done' })).toBeVisible();
  await expect(page.getByText('1 of 1 done so far this month')).toBeVisible();
});

test('skip and un-skip a habit on a day', async ({ page }) => {
  await plant(page, 'Read');
  await page.goto('/calendar');

  await page.getByRole('button', { name: 'Skip Read' }).click();
  await expect(page.getByText('Skipped — the streak holds')).toBeVisible();
  await page.getByRole('button', { name: 'Undo skip' }).click();
  await expect(page.getByRole('button', { name: 'Mark Read done' })).toBeVisible();
});

test('add a habit from the calendar, dated to the selected day', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
  await expect(page.getByText(/Nothing scheduled/)).toBeVisible();

  await page.getByRole('button', { name: 'Add habit' }).click();
  await expect(page.getByRole('heading', { name: /Plant a new/ })).toBeVisible();
  // The editor opens pre-dated to the selected day, with the date in view.
  await expect(page.getByLabel('Start date')).toHaveValue(todayKey());
  await page.getByLabel('Name it').fill('Journal');
  await page.getByRole('button', { name: 'Plant', exact: true }).click();

  await page.goto('/calendar');
  await expect(page.getByRole('link', { name: 'Open Journal' })).toBeVisible();
  await expect(page.locator(`[data-date="${todayKey()}"]`)).toHaveAttribute(
    'aria-label',
    /0 of 1 done/,
  );
});

test('moving months keeps the day panel in view and offers a way back', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();

  await page.getByRole('button', { name: 'Next month' }).click();
  // The "Today" shortcut only appears once you've left the current month.
  const back = page.getByRole('button', { name: 'Today', exact: true });
  await expect(back).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Today' })).toHaveCount(0);

  await back.click();
  await expect(back).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'Today' })).toBeVisible();
});
