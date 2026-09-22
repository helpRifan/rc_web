import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    // HomeView's fetchEvents/fetchGallery both chain .select() (and fetchEvents also
    // chains .eq()) before terminating on .order(), which they await. Resolving .order()
    // with a non-empty "gallery" row avoids HomeView's fallback `fetch("/api/gallery")`
    // path, which would otherwise throw in jsdom (no network) and log to stderr.
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue(
        table === 'gallery'
          ? { data: [{ id: 1, title: 'Test Gallery Item', category: 'Ops' }], error: null }
          : { data: [], error: null },
      ),
    })),
  },
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  isAuthorizedStudentEmail: vi.fn().mockReturnValue(true),
}));

import App from './App';

describe('App', () => {
  it('renders the home view by default with no loading spinner', async () => {
    render(<App />);
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    // HomeView's fetchGallery effect resolves the mocked supabase data asynchronously;
    // wait for the resulting state update so it lands under `act` instead of firing
    // (and warning) after this test has already finished.
    await screen.findByText('Test Gallery Item');
  });
});
