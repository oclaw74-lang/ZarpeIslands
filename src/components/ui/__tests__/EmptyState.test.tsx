import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders the title text', () => {
    render(<EmptyState icon="boat-outline" title="No boats yet" testID="empty" />);
    expect(screen.getByText('No boats yet')).toBeTruthy();
    expect(screen.getByTestId('empty')).toBeTruthy();
  });
});
