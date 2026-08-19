import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import BoatsListScreen from '@/features/boats/screens/BoatsListScreen';
import { listBoats } from '@/features/boats/api/boatService';
import { getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/features/boats/api/boatService', () => ({
  listBoats: jest.fn(),
}));

jest.mock('@/features/company/api/companyService', () => ({
  getCompanyMembership: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => {
    // jest.mock() factories can't reference outer-scope imports (hoisting) — require() is the escape hatch.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useEffect } = require('react');
    useEffect(callback, [callback]);
  },
}));

const boat = {
  id: 'b1',
  name: 'Sea Breeze',
  registrationNumber: 'REG-001',
  boatType: 'excursion' as const,
  capacity: 12,
  status: 'active' as const,
  notes: null,
};

describe('BoatsListScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the create button for an owner and lists boats (happy path / AC#1, AC#3)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'owner' });
    (listBoats as jest.Mock).mockResolvedValue([boat]);

    render(<BoatsListScreen />);

    await waitFor(() => expect(screen.getByText('Sea Breeze')).toBeTruthy());
    expect(screen.getByTestId('boats-create')).toBeTruthy();
  });

  it('hides the create button for a crew member (edge case / AC#3)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'crew' });
    (listBoats as jest.Mock).mockResolvedValue([boat]);

    render(<BoatsListScreen />);

    await waitFor(() => expect(screen.getByText('Sea Breeze')).toBeTruthy());
    expect(screen.queryByTestId('boats-create')).toBeNull();
  });

  it('re-fetches with includeInactive when the toggle is pressed (edge case / AC#2)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'owner' });
    (listBoats as jest.Mock).mockResolvedValue([]);

    render(<BoatsListScreen />);

    await waitFor(() => expect(listBoats).toHaveBeenCalledWith({ includeInactive: false }));

    await act(async () => {
      fireEvent.press(screen.getByTestId('boats-toggle-inactive'));
    });

    await waitFor(() => expect(listBoats).toHaveBeenCalledWith({ includeInactive: true }));
  });

  it('shows an empty state when there are no boats (error/edge case)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'owner' });
    (listBoats as jest.Mock).mockResolvedValue([]);

    render(<BoatsListScreen />);

    await waitFor(() => expect(screen.getByTestId('boats-empty')).toBeTruthy());
  });
});
