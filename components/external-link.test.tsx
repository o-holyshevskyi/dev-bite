import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ExternalLink } from './external-link';

describe('ExternalLink', () => {
  it('renders children', () => {
    render(
      <ExternalLink href="https://example.com">Click me</ExternalLink>
    );
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(
      <ExternalLink href="https://example.com" testID="ext-link">
        Example
      </ExternalLink>
    );
    expect(screen.getByTestId('ext-link')).toBeTruthy();
    expect(screen.getByText('Example')).toBeTruthy();
  });
});
