import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LevelCompleteModal } from './level-complete-modal';

describe('LevelCompleteModal', () => {
  it('renders nothing when level is null', () => {
    render(<LevelCompleteModal level={null} onDismiss={jest.fn()} />);
  });

  it('renders when level is set', () => {
    render(
      <LevelCompleteModal
        level={{ category: 'TypeScript', difficulty: 'easy' }}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByTestId('level-complete-modal')).toBeTruthy();
  });
});
