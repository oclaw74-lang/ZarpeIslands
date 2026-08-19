import { render } from '@testing-library/react-native';
import React from 'react';

import { IconCircle } from '@/components/ui/IconCircle';

describe('IconCircle', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<IconCircle name="boat" />);
    expect(toJSON()).toBeTruthy();
  });
});
