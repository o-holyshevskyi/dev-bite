import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Header from './header';

describe('Header', () => {
  it('exports a component', () => {
    expect(typeof Header).toBe('function');
  });

  it.skip('renders without crashing', () => {
    render(<Header />);
  });

  it.skip('renders greeting with profile name', () => {
    render(<Header />);
    expect(screen.getByText(/Good Morning,/)).toBeTruthy();
  });
});
