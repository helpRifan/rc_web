import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Runs against the real-content fixtures (DATA_FIXTURES=1): the five TechnoVIT '26 events, all past.
const TITLES = ['Line Follower', 'Obstacle Race', 'Robo Race', 'Robo Soccer', 'Robo Sumo'];

test('events tells the truth about today and lists every past event', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByRole('heading', { level: 1, name: 'Events' })).toBeVisible();
  await expect(page.getByText('Nothing is scheduled right now, so here’s what we’ve run so far.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'See past events' })).toHaveAttribute('href', '#past');
  await expect(page.getByRole('heading', { level: 2, name: 'Past events' })).toBeVisible();
  for (const title of TITLES) {
    await expect(page.getByRole('heading', { level: 4, name: title })).toBeAttached();
  }
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('an event card links to its page', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByRole('link', { name: 'Robo Sumo' })).toHaveAttribute('href', '/events/robo-sumo');
});

for (const width of [360, 390]) {
  test(`events has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/events');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the deck is a plain list and the heading doesn’t scramble', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    const sticky = await page.locator('li[data-card]').evaluateAll(cards => cards.filter(c => getComputedStyle(c).position === 'sticky').length);
    expect(sticky).toBe(0);
    await expect(page.getByTestId('road-poster')).toBeAttached();
  });
});

test('the events API rejects a bad status', async ({ request }) => {
  const res = await request.get('/api/events?status=bogus');
  expect(res.status()).toBe(400);
  const ok = await request.get('/api/events?status=completed');
  expect((await ok.json()).events).toHaveLength(5);
});
