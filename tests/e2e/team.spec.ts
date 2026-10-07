import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: the Board (Ihsan, Grace, Vinayak) and 14 core members, all without photos.

test('team shows the board, the core team and the faculty coordinator', async ({ page }) => {
  await page.goto('/team');
  await expect(page.getByRole('heading', { level: 1, name: 'The team' })).toBeVisible();
  const board = page.getByRole('list', { name: 'The board' });
  for (const name of ['Ihsan', 'Grace', 'Vinayak']) await expect(board.getByRole('link', { name: new RegExp(`^${name}`) })).toBeVisible();
  await expect(board.getByRole('link', { name: /^Grace/ })).toHaveAttribute('href', '/team/grace');
  await expect(page.getByRole('heading', { level: 2, name: 'Core team' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Faculty coordinator' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Join the club' })).toHaveAttribute('href', '/join');
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('/team#projects opens the list filtered to Projects', async ({ page }) => {
  await page.goto('/team#projects');
  await expect(page.getByRole('button', { name: 'Projects' })).toHaveAttribute('aria-pressed', 'true');
  const names = page.locator('#core-team h3');
  await expect(names).toHaveText(['Karthik', 'Akshaj', 'Tarun']);
});

for (const width of [360, 390]) {
  test(`team has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/team');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the HTML badges and the list, with no canvas', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('[data-board-stage]')).toHaveAttribute('data-mode', 'static-row');
    await expect(page.locator('.badge-static-art').first()).toBeVisible();
    await expect(page.getByRole('group', { name: 'Filter by division' })).toBeVisible();
    await expect(page.locator('#core-team h3')).toHaveCount(14);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});
