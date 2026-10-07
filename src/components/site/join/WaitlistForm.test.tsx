import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WaitlistForm } from './WaitlistForm';

const DOMAINS = ['vitstudent.ac.in'];

afterEach(() => vi.unstubAllGlobals());

function respond(status: number, body: unknown = { ok: true }) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fill(name: string, email: string) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText('Your name'), name);
  if (email) await user.type(screen.getByLabelText('VIT email'), email);
  return user;
}

describe('WaitlistForm', () => {
  it('uses the closed-state button and the domain hint', () => {
    render(<WaitlistForm domains={DOMAINS} open={false} />);
    expect(screen.getByRole('button', { name: 'Tell me when it opens' })).toBeInTheDocument();
    expect(screen.getByText('Use your @vitstudent.ac.in address.')).toBeInTheDocument();
  });

  it('checks fields before sending and focuses the first problem', async () => {
    const fetchMock = respond(201);
    render(<WaitlistForm domains={DOMAINS} open />);
    const user = await fill('', 'asha@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Add me to the list' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Use your VIT email. It ends in @vitstudent.ac.in.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveFocus();
    expect(screen.getByLabelText('VIT email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the success state and the same answer for duplicates', async () => {
    for (const status of [201, 200]) {
      respond(status);
      const { unmount } = render(<WaitlistForm domains={DOMAINS} open />);
      const user = await fill('Asha Rao', 'asha@vitstudent.ac.in');
      await user.click(screen.getByRole('button', { name: 'Add me to the list' }));
      expect(await screen.findByRole('heading', { name: 'You’re on the list.' })).toBeInTheDocument();
      expect(screen.getByText('We’ll email you when intake opens.')).toBeInTheDocument();
      unmount();
    }
  });

  it('explains a rate limit and keeps what was typed', async () => {
    respond(429, { error: 'Too many requests' });
    render(<WaitlistForm domains={DOMAINS} open />);
    const user = await fill('Asha Rao', 'asha@vitstudent.ac.in');
    await user.click(screen.getByRole('button', { name: 'Add me to the list' }));
    expect(await screen.findByText('Too many attempts from this network. Wait a few minutes, then try again.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveValue('Asha Rao');
  });

  it('puts a server field error on its field', async () => {
    respond(400, { error: 'invalid', field: 'email', code: 'email-domain' });
    render(<WaitlistForm domains={DOMAINS} open />);
    const user = await fill('Asha Rao', 'asha@vitstudent.ac.in');
    await user.click(screen.getByRole('button', { name: 'Add me to the list' }));
    expect(await screen.findByText('Use your VIT email. It ends in @vitstudent.ac.in.')).toBeInTheDocument();
  });

  it('keeps the honeypot out of reach', () => {
    render(<WaitlistForm domains={DOMAINS} open />);
    const trap = document.getElementById('join-website')!;
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
