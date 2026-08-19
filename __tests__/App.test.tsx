import { render, screen } from '@testing-library/react-native';
import React from 'react';

import HomeScreen from '@/features/home/screens/HomeScreen';
import { listBoats } from '@/features/boats/api/boatService';
import { listJobPositions } from '@/features/job-positions/api/jobPositionService';

jest.mock('@/features/boats/api/boatService', () => ({
  listBoats: jest.fn(),
}));

jest.mock('@/features/job-positions/api/jobPositionService', () => ({
  listJobPositions: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (callback: () => void) => {
    // jest.mock() factories can't reference outer-scope imports (hoisting) — require() is the escape hatch.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useEffect } = require('react');
    useEffect(callback, [callback]);
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (listBoats as jest.Mock).mockResolvedValue([]);
    (listJobPositions as jest.Mock).mockResolvedValue([]);
  });

  it('renders the app title', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Zarpe Islands')).toBeTruthy();
  });
});
