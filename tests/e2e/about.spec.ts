import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: no partners are published, so /partners is hidden.

test('about tells the club story, its aims and its faculty coordinator', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: 'About the club' })).toBeVisible();
  await expect(page.getByText(/^The Robotics Club at VIT Chennai is a dynamic student-driven community/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'How we work' })).toBeVisible();

  const aims = page.getByRole('region', { name: 'What we aim to do' }).getByRole('listitem');
  await expect(aims).toHaveCount(5);

  const faculty = page.getByRole('region', { name: 'Faculty coordinator' });
  await expect(faculty.getByText('Dr. Arockia Selvakumar', { exact: true })).toBeVisible();
  await expect(faculty.getByRole('link', { name: /View VIT profile/ })).toHaveAttribute(
    'href',
    'https://chennai.vit.ac.in/member/dr-arockia-selvakumar/',
  );
  expect(await seriousAxeViolations(page)).toEqual([]);
});

// The href, not a click: under five parallel WebGL home pages a client navigation can outlast the
// timeout, and the page itself is covered above.
test('the footer links to about', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'About the club' })).toHaveAttribute('href', '/about');
});

test('partners is hidden while none are published', async ({ page }) => {
  const res = await page.goto('/partners');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Partners' })).toHaveCount(0);
});

for (const width of [360, 390]) {
  test(`about has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/about');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
