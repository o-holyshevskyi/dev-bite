import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Stats from './stats';

describe('Stats', () => {
  it('exports a component', () => {
    expect(typeof Stats).toBe('function');
  });

  it.skip('renders without crashing', () => {
    render(<Stats />);
  });

  it.skip('shows streak or solved label', () => {
    render(<Stats />);
    expect(screen.getByText(/streak|solved|accuracy|global rank/i)).toBeTruthy();
  });
});
