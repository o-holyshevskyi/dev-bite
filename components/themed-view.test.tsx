import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedView } from './themed-view';

describe('ThemedView', () => {
  it('renders children', () => {
    render(
      <ThemedView>
        <ThemedView testID="child">Content</ThemedView>
      </ThemedView>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('accepts style and testID', () => {
    render(<ThemedView testID="view" style={{ padding: 10 }} />);
    expect(screen.getByTestId('view')).toBeTruthy();
  });
});
