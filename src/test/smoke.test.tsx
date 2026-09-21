import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function Hello() {
  return <p>hello rc web</p>;
}

describe('test harness', () => {
  it('renders a component and finds it by text', () => {
    render(<Hello />);
    expect(screen.getByText('hello rc web')).toBeInTheDocument();
  });
});
