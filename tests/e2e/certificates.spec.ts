import { createHmac } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { horizontalOverflow, seriousAxeViolations } from './helpers';

// Fixtures: two synthetic certificates, RC26-TEST000001 (valid) and RC26-TEST000002 (revoked), for
// test.participant@example.com. Fixture links are signed with the public fixtures-only secret.
const FIXTURE_SECRET = 'fixtures-only-cert-link-secret-never-real';
function fixtureToken(email: string, minutes = 30): string {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + minutes * 60 })).toString('base64url');
  return `${payload}.${createHmac('sha256', FIXTURE_SECRET).update(payload).digest('base64url')}`;
}

test('the certificates page offers both jobs and passes axe', async ({ page }) => {
  await page.goto('/certificates');
  await expect(page.getByRole('heading', { level: 1, name: 'Certificates' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Find my certificates' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Verify a certificate' })).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('the verify form refuses a non-ID and opens a pasted link', async ({ page }) => {
  await page.goto('/certificates');
  const field = page.getByLabel('Verify link or certificate ID');
  await field.fill('hello');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByText('That doesn’t look like a certificate ID. Check it and try again.')).toBeVisible();
  await field.fill('https://example.com/certificates/rc26-test000001/');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page).toHaveURL(/\/certificates\/RC26-TEST000001$/);
});

test('a valid certificate shows its details and downloads', async ({ page, request }) => {
  await page.goto('/certificates/RC26-TEST000001');
  await expect(page.getByRole('heading', { level: 1, name: 'Certificate RC26-TEST000001' })).toBeVisible();
  const details = page.locator('dl');
  await expect(details).toContainText('Test Participant');
  await expect(details).toContainText("Robo Sumo, TechnoVIT '26");
  await expect(details).toContainText('Participation');
  await expect(details).toContainText('17 September 2026');
  await expect(details).toContainText('Valid');
  const download = page.getByRole('link', { name: 'Download PDF' });
  await expect(download).toHaveAttribute('href', '/api/certificates/RC26-TEST000001/pdf');
  const pdf = await request.get('/api/certificates/RC26-TEST000001/pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('a revoked certificate says so and offers no download', async ({ page }) => {
  await page.goto('/certificates/RC26-TEST000002');
  await expect(page.getByText('This certificate has been revoked.')).toBeVisible();
  await expect(page.locator('dl')).toContainText('Revoked');
  await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveCount(0);
});

test('unknown and malformed IDs get the same not-found answer', async ({ page }) => {
  for (const id of ['RC26-7KQ2M9XH4D', 'not-an-id']) {
    const res = await page.goto(`/certificates/${id}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'No certificate with that ID' })).toBeVisible();
  }
});

test('a lower-case ID lands on its canonical address', async ({ page }) => {
  await page.goto('/certificates/rc26-test000001');
  await expect(page).toHaveURL(/\/certificates\/RC26-TEST000001$/);
});

test('the find form gives the same answer for any address', async ({ page }) => {
  await page.goto('/certificates');
  await page.getByLabel('Email address your team registered with').fill('test.participant@example.com');
  await page.getByRole('button', { name: 'Email me my certificates' }).click();
  await expect(page.getByText('If that address has certificates, we’ve emailed a link. It works for 30 minutes.')).toBeVisible();
});

test('a valid link lists that address’s certificates, and never leaks through the referrer', async ({ page }) => {
  const res = await page.goto(`/certificates/mine?token=${fixtureToken('test.participant@example.com')}`);
  expect(res?.headers()['referrer-policy']).toBe('no-referrer');
  await expect(page.getByRole('heading', { level: 1, name: 'Your certificates' })).toBeVisible();
  await expect(page.getByText('Certificates for test.participant@example.com.')).toBeVisible();
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /^Download PDF/ })).toHaveCount(1);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test('an expired or forged link explains how to get a new one', async ({ page }) => {
  for (const token of [fixtureToken('test.participant@example.com', -1), 'forged.token']) {
    await page.goto(`/certificates/mine?token=${token}`);
    await expect(page.getByRole('heading', { level: 1, name: 'This link has expired' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Find my certificates' })).toHaveAttribute('href', '/certificates');
  }
});

for (const path of ['/certificates', '/certificates/RC26-TEST000001']) {
  test(`${path} has no horizontal overflow at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
