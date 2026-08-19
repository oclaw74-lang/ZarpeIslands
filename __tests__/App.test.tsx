import { render, screen } from '@testing-library/react-native';
import React from 'react';

import HomeScreen from '@/features/home/screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders the app title', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Zarpe Islands')).toBeTruthy();
  });
});
