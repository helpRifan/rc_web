import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeDb } from '../../../tests/helpers/fake-db';
import { CERT_VERIFY_COLUMNS } from './types';

const fake = vi.hoisted(() => ({ current: null as null | { client: unknown } }));
vi.mock('@/lib/supabase/admin', () => ({ db: () => fake.current!.client }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('DATA_FIXTURES', '');
});
afterEach(() => vi.unstubAllEnvs());

describe('certificate lookups', () => {
  it('never select the contact email, the PDF path, the team or the normalised name', () => {
    const names = CERT_VERIFY_COLUMNS.split(/[\s,()]+/).map(s => s.replace(/^.*:/, ''));
    for (const secret of ['contact_email', 'pdf_path', 'team_name', 'name_norm', 'institution', 'pdf_sha256']) expect(names).not.toContain(secret);
  });

  it('reads one certificate by ID with the verify columns, and refuses malformed IDs before any query', async () => {
    const db = fakeDb({ certificates: { data: null, error: null } });
    fake.current = db;
    const { getCertificateByPublicId } = await import('./certificates');
    expect(await getCertificateByPublicId('not-an-id')).toBeNull();
    expect(db.calls).toHaveLength(0);
    expect(await getCertificateByPublicId('RC26-7KQ2M9XH4D')).toBeNull();
    expect(db.trace('certificates')).toEqual(['from("certificates")', `select(${JSON.stringify(CERT_VERIFY_COLUMNS)})`, 'eq("public_id", "RC26-7KQ2M9XH4D")', 'maybeSingle()']);
  });

  it('looks emails up in lower case', async () => {
    const db = fakeDb({ certificates: { data: [], error: null } });
    fake.current = db;
    const { getCertificatesByEmail } = await import('./certificates');
    await getCertificatesByEmail(' Lead@Example.COM ');
    expect(db.trace('certificates')).toContain('eq("contact_email", "lead@example.com")');
  });

  it('serves the synthetic fixture certificates without their email', async () => {
    vi.stubEnv('DATA_FIXTURES', '1');
    const { getCertificateByPublicId, getCertificatesByEmail, countCertificatesForEmail } = await import('./certificates');
    const one = await getCertificateByPublicId('RC26-TEST000001');
    expect(one).toMatchObject({ name: 'Test Participant', status: 'issued' });
    expect(one).not.toHaveProperty('contactEmail');
    expect(await getCertificatesByEmail('test.participant@example.com')).toHaveLength(2);
    expect(await countCertificatesForEmail('test.participant@example.com')).toBe(1);
  });
});
