import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: the five TechnoVIT '26 events, all completed, undated, with no description or photos.

test('an event page shows its series, title and status, and the events either side', async ({ page }) => {
  await page.goto('/events/obstacle-race');
  await expect(page).toHaveTitle('Obstacle Race | Robotics Club, VIT Chennai');
  await expect(page.getByRole('heading', { level: 1, name: 'Obstacle Race' })).toBeVisible();
  await expect(page.getByText("TechnoVIT '26", { exact: true })).toBeVisible();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'All events' })).toHaveAttribute('href', '/events');
  const more = page.getByRole('navigation', { name: 'More events' });
  await expect(more.getByRole('link', { name: 'Previous: Line Follower' })).toHaveAttribute('href', '/events/line-follower');
  await expect(more.getByRole('link', { name: 'Next: Robo Race' })).toHaveAttribute('href', '/events/robo-race');
  await expect(page.getByRole('heading', { name: 'Register' })).toHaveCount(0);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('an unknown event is a 404', async ({ page }) => {
  const res = await page.goto('/events/no-such-event');
  expect(res?.status()).toBe(404);
});

test('an event page has no horizontal overflow at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/events/robo-soccer');
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the road poster and the plain title', async ({ page }) => {
    await page.goto('/events/robo-sumo');
    await expect(page.getByTestId('road-poster')).toBeAttached();
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Robo Sumo');
  });
});
