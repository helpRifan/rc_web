import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
const data = vi.hoisted(() => ({ adminCounts: vi.fn() }));
vi.mock('@/lib/auth/admin', () => auth);
vi.mock('@/lib/admin/data', () => data);
vi.mock('@/lib/email/send', () => ({ emailReady: () => false }));

import AdminHomePage from './page';

beforeEach(() => {
  auth.requireAdmin.mockReset();
  data.adminCounts.mockReset();
});

// The layout's check doesn't protect a page: Next can render a page without running its layout.
it('re-checks admin status itself and reads nothing for a non-admin', async () => {
  auth.requireAdmin.mockRejectedValue(new Error('NEXT_REDIRECT'));
  await expect(Promise.resolve().then(() => AdminHomePage())).rejects.toThrow('NEXT_REDIRECT');
  expect(auth.requireAdmin).toHaveBeenCalledTimes(1);
  expect(data.adminCounts).not.toHaveBeenCalled();
});

it('renders real counts for an admin, and says when email is off', async () => {
  auth.requireAdmin.mockResolvedValue({ id: 'a', email: 'owner@example.com', name: null, is_owner: true });
  data.adminCounts.mockResolvedValue({ events: 5, eventsPublished: 3, photos: 9, photosPublished: 9, members: 18, membersPublished: 1, partners: 0, waitlist: 1, certificates: 321 });
  render(await AdminHomePage());
  expect(screen.getByRole('heading', { level: 1, name: 'Admin' })).toBeInTheDocument();
  expect(screen.getByText('3 of 5 published')).toBeInTheDocument();
  expect(screen.getByText('1 person')).toBeInTheDocument();
  expect(screen.getByText(/321 certificates are in the database/)).toBeInTheDocument();
  expect(screen.getByText(/Email is off/)).toBeInTheDocument();
});
