import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: recruitment closed. The fixtures route accepts sign-ups without storing them.

test('join says recruitment is closed and offers the waitlist', async ({ page }) => {
  await page.goto('/join');
  await expect(page.getByRole('heading', { level: 1, name: 'Join the club' })).toBeVisible();
  await expect(page.getByText('Recruitment is closed right now. Leave your email and we’ll tell you when it opens.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell me when it opens' })).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('a VIT address gets the success answer, and focus moves to it', async ({ page }) => {
  await page.goto('/join');
  await page.getByLabel('Your name').fill('Test Student');
  await page.getByLabel('VIT email').fill('test.student@vitstudent.ac.in');
  await page.getByRole('button', { name: 'Tell me when it opens' }).click();
  const heading = page.getByRole('heading', { name: 'You’re on the list.' });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
});

test('another domain is refused in the browser, before anything is sent', async ({ page }) => {
  await page.goto('/join');
  let posted = false;
  page.on('request', req => {
    if (req.url().includes('/api/waitlist')) posted = true;
  });
  await page.getByLabel('Your name').fill('Test Student');
  await page.getByLabel('VIT email').fill('someone@gmail.com');
  await page.getByRole('button', { name: 'Tell me when it opens' }).click();
  await expect(page.getByText('Use your VIT email. It ends in @vitstudent.ac.in.')).toBeVisible();
  expect(posted).toBe(false);
});

test('the API refuses another domain too', async ({ request }) => {
  const res = await request.post('/api/waitlist', { data: { fullName: 'Test', email: 'someone@gmail.com', website: '' } });
  expect(res.status()).toBe(400);
  expect(await res.json()).toEqual({ error: 'invalid', field: 'email', code: 'email-domain' });
});

for (const width of [360, 390]) {
  test(`join has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/join');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the plain heading over the poster', async ({ page }) => {
    await page.goto('/join');
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    await expect(page.locator('picture img')).toHaveAttribute('src', '/join/fluid-1440.webp');
  });
});
