import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import JobPositionsListScreen from '@/features/job-positions/screens/JobPositionsListScreen';
import { listJobPositions } from '@/features/job-positions/api/jobPositionService';
import { getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/features/job-positions/api/jobPositionService', () => ({
  listJobPositions: jest.fn(),
}));

jest.mock('@/features/company/api/companyService', () => ({
  getCompanyMembership: jest.fn(),
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

const position = {
  id: 'jp1',
  name: 'Captain/Skipper',
  isRequiredPerShift: true,
  rotationRepeatAllowed: true,
};

describe('JobPositionsListScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the create button for an owner and lists the seeded defaults (happy path / AC#1)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'owner' });
    (listJobPositions as jest.Mock).mockResolvedValue([position]);

    render(<JobPositionsListScreen />);

    await waitFor(() => expect(screen.getByText('Captain/Skipper')).toBeTruthy());
    expect(screen.getByTestId('job-positions-create')).toBeTruthy();
    expect(screen.getByText('Required every shift')).toBeTruthy();
    expect(screen.getByText('Can repeat in rotation')).toBeTruthy();
  });

  it('hides the create button for a crew member (edge case)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'crew' });
    (listJobPositions as jest.Mock).mockResolvedValue([position]);

    render(<JobPositionsListScreen />);

    await waitFor(() => expect(screen.getByText('Captain/Skipper')).toBeTruthy());
    expect(screen.queryByTestId('job-positions-create')).toBeNull();
  });

  it('shows an empty state when there are no positions (error/edge case)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ accessRole: 'owner' });
    (listJobPositions as jest.Mock).mockResolvedValue([]);

    render(<JobPositionsListScreen />);

    await waitFor(() => expect(screen.getByTestId('job-positions-empty')).toBeTruthy());
  });
});
