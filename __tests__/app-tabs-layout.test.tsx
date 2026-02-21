import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TabLayout from '@/app/(tabs)/_layout';

describe('TabLayout', () => {
  it('renders without crashing', () => {
    render(<TabLayout />);
  });

  it('renders tab labels', () => {
    render(<TabLayout />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Path')).toBeTruthy();
    expect(screen.getByText('Explore')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });
});
