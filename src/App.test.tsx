import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  isAuthorizedStudentEmail: vi.fn().mockReturnValue(true),
}));

import App from './App';

describe('App', () => {
  it('renders the home view by default with no loading spinner', () => {
    render(<App />);
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
