import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import React from 'react';

import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders its children', () => {
    render(
      <Card testID="card">
        <Text>Inside card</Text>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeTruthy();
    expect(screen.getByText('Inside card')).toBeTruthy();
  });
});
