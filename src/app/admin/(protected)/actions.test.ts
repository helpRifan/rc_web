// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Spec 9.3 item 3: every admin mutation re-checks admin status on the server, before any write.
const state = vi.hoisted(() => ({ dbCalls: 0 }));
vi.mock('@/lib/auth/admin', () => ({ requireAdmin: vi.fn(async () => Promise.reject(new Error('NEXT_REDIRECT'))) }));
vi.mock('@/lib/supabase/admin', () => ({
  db: () => {
    state.dbCalls++;
    throw new Error('the database must not be touched');
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/admin/image-size', () => ({ imageSize: vi.fn(async () => null) }));

import * as events from './events/actions';
import * as gallery from './gallery/actions';
import * as members from './members/actions';
import * as partners from './partners/actions';
import * as settings from './settings/actions';

const actions = { ...events, ...gallery, ...members, ...partners, ...settings } as Record<string, (state: object, form: FormData) => Promise<unknown>>;

beforeEach(() => {
  state.dbCalls = 0;
});

describe('admin actions', () => {
  it.each(Object.keys(actions))('%s refuses a non-admin before touching the database', async name => {
    const form = new FormData();
    form.set('id', '00000000-0000-4000-8000-000000000001');
    form.set('title', 'Anything');
    await expect(actions[name]({}, form)).rejects.toThrow('NEXT_REDIRECT');
    expect(state.dbCalls).toBe(0);
  });

  it('covers every exported action', () => {
    expect(Object.keys(actions).sort()).toEqual(
      ['deleteEvent', 'deletePartner', 'deletePhoto', 'saveDivisionLines', 'saveEvent', 'saveMember', 'savePartner', 'savePhoto', 'saveRecruitment'].sort(),
    );
  });
});
