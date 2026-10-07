import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Next's route announcer is also role="alert", so alerts are matched by their text.

async function seriousAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
}

test('home renders its headline and passes axe', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Robotics Club' })).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('security headers are set', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
});

// The proxy redirects before routing, so a path that doesn't exist is gated the same way.
for (const path of [
  '/admin',
  '/admin/anything',
  '/admin/events',
  '/admin/events/new',
  '/admin/gallery',
  '/admin/gallery/new',
  '/admin/members',
  '/admin/partners',
  '/admin/partners/new',
  '/admin/settings',
  '/admin/waitlist',
]) {
  test(`${path} redirects signed-out visitors to sign-in`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/admin/sign-in\\?next=${encodeURIComponent(path)}$`));
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in to admin' })).toBeVisible();
  });
}

test('the waitlist export refuses signed-out visitors', async ({ request }) => {
  const res = await request.get('/api/admin/waitlist/export', { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(res.status());
  expect(res.headers()['location']).toMatch(/\/admin\/sign-in/);
  expect(res.headers()['content-type'] ?? '').not.toContain('text/csv');
});

test('sign-in explains a refused account and passes axe', async ({ page }) => {
  await page.goto('/admin/sign-in?error=not_admin');
  await expect(page).toHaveTitle('Sign in | Admin | Robotics Club, VIT Chennai');
  await expect(page.getByRole('alert').filter({ hasText: /isn.t a club admin\. Ask an owner to add you\./ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('the OAuth callback without a code goes back to sign-in', async ({ page }) => {
  await page.goto('/admin/auth/callback?next=//evil.com');
  await expect(page).toHaveURL(/\/admin\/sign-in\?error=failed$/);
  await expect(page.getByRole('alert').filter({ hasText: /Sign-in didn.t complete\. Try again\./ })).toBeVisible();
});

test('unknown pages return 404 with a way home', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Go to the homepage' })).toBeVisible();
});

for (const width of [360, 390]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the real headline with no scramble', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Robotics Club');
  });
});
