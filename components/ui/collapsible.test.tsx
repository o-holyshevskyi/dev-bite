import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Collapsible } from './collapsible';

describe('Collapsible', () => {
  it('renders title', () => {
    render(<Collapsible title="Section">Content</Collapsible>);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('hides content by default', () => {
    render(<Collapsible title="Section">Hidden content</Collapsible>);
    expect(screen.queryByText('Hidden content')).toBeNull();
  });

  it('shows content when title is pressed', () => {
    render(<Collapsible title="Section">Visible content</Collapsible>);
    fireEvent.press(screen.getByText('Section'));
    const content = screen.getByTestId('collapsible-content');
    expect(content.props.children).toBe('Visible content');
  });

  it('toggles content on second press', () => {
    render(<Collapsible title="Section">Toggle me</Collapsible>);
    const trigger = screen.getByText('Section');
    fireEvent.press(trigger);
    expect(screen.getByTestId('collapsible-content').props.children).toBe('Toggle me');
    fireEvent.press(trigger);
    expect(screen.queryByTestId('collapsible-content')).toBeNull();
  });
});
