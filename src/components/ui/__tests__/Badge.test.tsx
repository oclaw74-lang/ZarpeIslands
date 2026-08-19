import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders the label text', () => {
    render(<Badge label="Active" tone="success" />);
    expect(screen.getByText('Active')).toBeTruthy();
  });
});
