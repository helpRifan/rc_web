// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from './instrumentation';

const GOOD = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};
const LEAKY_VALUE = 'eyJhbGciOiJIUzI1NiJ9.legacy-jwt-shaped-value';

function stubEnv(env: Record<string, string>) {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
}

// Spec 5: the app refuses to start if a required server variable is missing or malformed.
describe('register (env fail-fast at server start)', () => {
  let exit: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubEnv({ ...GOOD, NEXT_RUNTIME: 'nodejs', NEXT_PHASE: 'phase-production-server' });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('starts normally with a valid env', async () => {
    await register();
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits the process, naming the bad variables but never their values', async () => {
    stubEnv({ SUPABASE_SECRET_KEY: LEAKY_VALUE, NEXT_PUBLIC_SUPABASE_URL: 'http://bad.example' });
    await register();
    expect(exit).toHaveBeenCalledWith(1);
    const printed = error.mock.calls.flat().map(String).join('\n');
    expect(printed).toContain('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY');
    expect(printed).not.toContain(LEAKY_VALUE);
    expect(printed).not.toContain('bad.example');
  });

  it('exits when a variable is missing', async () => {
    stubEnv({ SUPABASE_SECRET_KEY: '' });
    await register();
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('never exits during next build, which has its own error handling', async () => {
    stubEnv({ SUPABASE_SECRET_KEY: '', NEXT_PHASE: 'phase-production-build' });
    await expect(register()).rejects.toThrow('SUPABASE_SECRET_KEY');
    expect(exit).not.toHaveBeenCalled();
  });

  it('does nothing in the edge runtime', async () => {
    stubEnv({ SUPABASE_SECRET_KEY: '', NEXT_RUNTIME: 'edge' });
    await register();
    expect(exit).not.toHaveBeenCalled();
  });
});
