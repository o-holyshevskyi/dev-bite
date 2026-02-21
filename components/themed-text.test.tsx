import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedText } from './themed-text';

describe('ThemedText', () => {
  it('renders children', () => {
    render(<ThemedText>Hello</ThemedText>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with type title', () => {
    render(<ThemedText type="title">Title</ThemedText>);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('renders with type subtitle', () => {
    render(<ThemedText type="subtitle">Subtitle</ThemedText>);
    expect(screen.getByText('Subtitle')).toBeTruthy();
  });

  it('renders with type link', () => {
    render(<ThemedText type="link">Link</ThemedText>);
    expect(screen.getByText('Link')).toBeTruthy();
  });

  it('renders with type defaultSemiBold', () => {
    render(<ThemedText type="defaultSemiBold">Bold</ThemedText>);
    expect(screen.getByText('Bold')).toBeTruthy();
  });

  it('forwards testID', () => {
    render(
      <ThemedText testID="themed-header">Header</ThemedText>
    );
    expect(screen.getByTestId('themed-header')).toBeTruthy();
  });
});
