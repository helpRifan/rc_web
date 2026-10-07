// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Synthetic certificates and addresses only.
const state = vi.hoisted(() => ({
  allow: [] as boolean[],
  ready: true,
  count: 0,
  certificate: null as unknown,
  file: null as null | { pdfPath: string; status: 'issued' | 'revoked' },
  sent: [] as { to: string; link: string }[],
}));

vi.mock('next/server', async importOriginal => ({ ...(await importOriginal<typeof import('next/server')>()), after: (task: () => unknown) => task() }));
vi.mock('@/lib/rate-limit', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/rate-limit')>()),
  rateLimit: vi.fn(async () => state.allow.shift() ?? true),
}));
vi.mock('@/lib/data/certificates', () => ({
  countCertificatesForEmail: vi.fn(async () => state.count),
  getCertificateByPublicId: vi.fn(async () => state.certificate),
  getCertificateFile: vi.fn(async () => state.file),
  signedPdfUrl: vi.fn(async (path: string) => `https://storage.example/signed/${path}?token=abc`),
}));
vi.mock('@/lib/email/send', () => ({
  emailReady: () => state.ready,
  sendEmail: vi.fn(async (to: string, email: { text: string }) => void state.sent.push({ to, link: email.text.match(/https:\S+/)![0] })),
}));
vi.mock('@/lib/certificates/secret', () => ({ certLinkSecret: () => 'test-secret-that-is-at-least-32-chars-long' }));
vi.mock('@/lib/env', () => ({ serverEnv: () => ({ NEXT_PUBLIC_SITE_URL: 'https://robotics.example' }) }));

import { GET as verify } from './[publicId]/route';
import { GET as pdf } from './[publicId]/pdf/route';
import { POST as find } from './find/route';

const ID = 'RC26-7KQ2M9XH4D';
const context = (publicId: string) => ({ params: Promise.resolve({ publicId }) });
const findRequest = (body: unknown) =>
  find(new NextRequest('http://localhost/api/certificates/find', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }));

beforeEach(() => {
  vi.stubEnv('DATA_FIXTURES', '');
  Object.assign(state, { allow: [], ready: true, count: 0, certificate: null, file: null, sent: [] });
});

describe('POST /api/certificates/find', () => {
  it('answers known and unknown addresses identically, and emails only the known one', async () => {
    state.count = 2;
    const known = await findRequest({ email: 'Lead@Example.com' });
    state.count = 0;
    const unknown = await findRequest({ email: 'nobody@example.com' });
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(await known.json()).toEqual(await unknown.json());
    expect(state.sent).toHaveLength(1);
    expect(state.sent[0].to).toBe('lead@example.com');
    expect(state.sent[0].link).toMatch(/^https:\/\/robotics\.example\/certificates\/mine\?token=[\w-]+\.[\w-]+$/);
  });

  it('refuses when rate-limited, by IP or by email', async () => {
    state.allow = [false];
    expect((await findRequest({ email: 'a@example.com' })).status).toBe(429);
    state.allow = [true, false];
    expect((await findRequest({ email: 'a@example.com' })).status).toBe(429);
  });

  it('rejects a malformed address, and says so plainly when email is off', async () => {
    expect((await findRequest({ email: 'not-an-email' })).status).toBe(400);
    state.ready = false;
    expect((await findRequest({ email: 'a@example.com' })).status).toBe(503);
  });
});

describe('GET /api/certificates/[publicId]', () => {
  it('answers unknown and malformed IDs with the same shape', async () => {
    const unknown = await verify(new Request(`http://localhost/api/certificates/${ID}`), context(ID));
    const malformed = await verify(new Request('http://localhost/api/certificates/nope'), context('nope'));
    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(await unknown.json()).toEqual({ found: false });
    expect(await malformed.json()).toEqual({ found: false });
  });

  it('returns the public fields of a known certificate, privately cached', async () => {
    state.certificate = { publicId: ID, name: 'Test Person', type: 'winner', place: 1, issuedOn: '2026-09-18', status: 'issued', event: { slug: 'robo-sumo', title: 'Robo Sumo', series: "TechnoVIT '26" } };
    const res = await verify(new Request(`http://localhost/api/certificates/${ID}`), context(ID.toLowerCase()));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(await res.json()).toEqual({ found: true, name: 'Test Person', event: { title: 'Robo Sumo', series: "TechnoVIT '26" }, type: 'winner', place: 1, issuedOn: '2026-09-18', status: 'issued' });
  });

  it('is rate-limited', async () => {
    state.allow = [false];
    expect((await verify(new Request(`http://localhost/api/certificates/${ID}`), context(ID))).status).toBe(429);
  });
});

describe('GET /api/certificates/[publicId]/pdf', () => {
  it('redirects an issued certificate to a short-lived signed URL', async () => {
    state.file = { pdfPath: `robo-sumo/${ID}.pdf`, status: 'issued' };
    const res = await pdf(new Request(`http://localhost/api/certificates/${ID}/pdf`), context(ID));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`https://storage.example/signed/robo-sumo/${ID}.pdf?token=abc`);
  });

  it('gives a revoked certificate the same 404 as an unknown one', async () => {
    state.file = { pdfPath: `robo-sumo/${ID}.pdf`, status: 'revoked' };
    const revoked = await pdf(new Request(`http://localhost/api/certificates/${ID}/pdf`), context(ID));
    state.file = null;
    const unknown = await pdf(new Request(`http://localhost/api/certificates/${ID}/pdf`), context(ID));
    expect(revoked.status).toBe(404);
    expect(unknown.status).toBe(404);
    expect(await revoked.json()).toEqual(await unknown.json());
  });

  it('is rate-limited', async () => {
    state.allow = [false];
    expect((await pdf(new Request(`http://localhost/api/certificates/${ID}/pdf`), context(ID))).status).toBe(429);
  });
});
