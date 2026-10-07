import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: Grace is the Board's Secretary, between Ihsan and Vinayak; Karthik heads Projects.

test('a profile shows the member and their neighbours in the same group', async ({ page }) => {
  await page.goto('/team/grace');
  await expect(page).toHaveTitle('Grace | Robotics Club, VIT Chennai');
  await expect(page.getByRole('heading', { level: 1, name: 'Grace' })).toBeVisible();
  await expect(page.getByRole('paragraph').filter({ hasText: /^Secretary$/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'All members' })).toHaveAttribute('href', '/team');
  const more = page.getByRole('navigation', { name: 'More members' });
  await expect(more.getByRole('link', { name: 'Previous: Ihsan' })).toHaveAttribute('href', '/team/ihsan');
  await expect(more.getByRole('link', { name: 'Next: Vinayak' })).toHaveAttribute('href', '/team/vinayak');
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('neighbours stay inside the division, and the ends have one side', async ({ page }) => {
  await page.goto('/team/karthik');
  await expect(page.getByRole('paragraph').filter({ hasText: /^Projects$/ })).toBeVisible();
  const more = page.getByRole('navigation', { name: 'More members' });
  await expect(more.getByRole('link')).toHaveText(['Next: Akshaj']);
});

test('an unknown member is a 404', async ({ page }) => {
  const res = await page.goto('/team/no-such-person');
  expect(res?.status()).toBe(404);
});

for (const width of [360, 390]) {
  test(`a profile has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/team/grace');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the HTML badge and no canvas', async ({ page }) => {
    await page.goto('/team/grace');
    await expect(page.locator('.badge-static-art')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});
