import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import BoatFormScreen from '@/features/boats/screens/BoatFormScreen';
import { createBoat, getBoat, updateBoat } from '@/features/boats/api/boatService';
import { getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/features/boats/api/boatService', () => ({
  createBoat: jest.fn(),
  updateBoat: jest.fn(),
  getBoat: jest.fn(),
}));

jest.mock('@/features/company/api/companyService', () => ({
  getCompanyMembership: jest.fn(),
}));

const mockBack = jest.fn();
let mockParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

describe('BoatFormScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = {};
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('creates a boat scoped to the current company (happy path / AC#1)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ companyId: 'company-1' });
    (createBoat as jest.Mock).mockResolvedValue({ ok: true, boat: {} });

    render(<BoatFormScreen />);

    fireEvent.changeText(screen.getByTestId('boat-name'), 'Sea Breeze');
    await act(async () => {
      fireEvent.press(screen.getByTestId('boat-form-submit'));
    });

    expect(createBoat).toHaveBeenCalledWith(
      'company-1',
      expect.objectContaining({ name: 'Sea Breeze', boatType: 'excursion', status: 'active' })
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('loads and pre-fills the boat when editing (happy path)', async () => {
    mockParams = { id: 'b1' };
    (getBoat as jest.Mock).mockResolvedValue({
      id: 'b1',
      name: 'Sea Breeze',
      registrationNumber: 'REG-001',
      boatType: 'rental',
      capacity: 8,
      status: 'in_maintenance',
      notes: 'engine check',
    });

    render(<BoatFormScreen />);

    await waitFor(() => expect(screen.getByDisplayValue('Sea Breeze')).toBeTruthy());
    expect(screen.getByDisplayValue('REG-001')).toBeTruthy();
  });

  it('updates the boat when editing (happy path)', async () => {
    mockParams = { id: 'b1' };
    (getBoat as jest.Mock).mockResolvedValue({
      id: 'b1',
      name: 'Sea Breeze',
      registrationNumber: null,
      boatType: 'excursion',
      capacity: null,
      status: 'active',
      notes: null,
    });
    (updateBoat as jest.Mock).mockResolvedValue({ ok: true, boat: {} });

    render(<BoatFormScreen />);
    await waitFor(() => expect(screen.getByDisplayValue('Sea Breeze')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByTestId('boat-status-inactive'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('boat-form-submit'));
    });

    expect(updateBoat).toHaveBeenCalledWith('b1', expect.objectContaining({ status: 'inactive' }));
  });

  it('shows an error message when the create fails, e.g. RLS rejects a non owner/manager (error case / AC#3)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ companyId: 'company-1' });
    (createBoat as jest.Mock).mockResolvedValue({ ok: false, message: 'RLS violation' });

    render(<BoatFormScreen />);

    fireEvent.changeText(screen.getByTestId('boat-name'), 'Sea Breeze');
    await act(async () => {
      fireEvent.press(screen.getByTestId('boat-form-submit'));
    });

    expect(screen.getByTestId('boat-form-error')).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
