import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: the nine real gallery photos with draft captions, so the page is in its dome state.

test('gallery shows the dome state and lists all nine photos', async ({ page }) => {
  await page.goto('/gallery');
  await expect(page.getByRole('heading', { level: 1, name: 'The club in photos' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'All 9 photos' })).toBeAttached();
  await expect(page.locator('#all-photos').getByRole('link')).toHaveCount(9);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('a grid photo opens in the viewer, Escape closes it and focus returns', async ({ page }) => {
  await page.goto('/gallery');
  const first = page.getByRole('link', { name: /^Open photo: Club group photo/ });
  await first.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Club group photo on the steps', { exact: false })).toBeVisible();
  await expect(page).toHaveURL(/\?photo=/);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('Students soldering at an outdoor workbench.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/\?photo=/);
  await expect(first).toBeFocused();
});

test('a shared photo link opens that photo', async ({ page }) => {
  await page.goto('/gallery?photo=00000000-0000-4000-9000-000000000002');
  await expect(page.getByRole('dialog').getByText('Students soldering at an outdoor workbench.')).toBeVisible();
});

test('tapping a dome tile opens that photo in the viewer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/gallery');
  // The dome mounts once its nine tiles have decoded (from ImageKit).
  await expect(page.locator('.item__image img').first()).toBeAttached({ timeout: 20_000 });
  await page.waitForTimeout(900); // the 600ms intro turn
  await page.mouse.click(720, 300);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('the dome is hidden from assistive tech and out of the tab order', async ({ page }) => {
  await page.goto('/gallery');
  const focusableTiles = await page.locator('.item__image[tabindex="0"]').count();
  expect(focusableTiles).toBe(0);
});

for (const width of [360, 390]) {
  test(`gallery has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/gallery');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the heading is plain and the viewer opens instantly', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    await page.getByRole('link', { name: /^Open photo: Students soldering/ }).click();
    await expect(page.getByRole('dialog').getByText('Students soldering at an outdoor workbench.')).toBeVisible();
  });
});
