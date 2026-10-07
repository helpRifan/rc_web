import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('runs component tests in jsdom with jest-dom matchers', () => {
  document.body.innerHTML = '<p>ready</p>';
  expect(screen.getByText('ready')).toBeInTheDocument();
});
