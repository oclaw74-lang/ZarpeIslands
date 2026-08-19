import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import CompanyOnboardingScreen from '@/features/company/screens/CompanyOnboardingScreen';
import { bootstrapCompany } from '@/features/company/api/companyService';

jest.mock('@/features/company/api/companyService', () => ({
  bootstrapCompany: jest.fn(),
}));

const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('CompanyOnboardingScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('bootstraps automatically using the pending company name from signup (happy path / B2 AC#1)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'owner@example.com', user_metadata: { pending_company_name: 'Zarpe Charters' } } },
    });
    (bootstrapCompany as jest.Mock).mockResolvedValue({ ok: true, member: {} });

    render(<CompanyOnboardingScreen />);

    await waitFor(() =>
      expect(bootstrapCompany).toHaveBeenCalledWith('Zarpe Charters', 'owner')
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('asks for the company name manually when there is no pending name (edge case — e.g. Google sign-in)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'owner@example.com', user_metadata: {} } },
    });

    render(<CompanyOnboardingScreen />);

    await waitFor(() => expect(screen.getByTestId('onboarding-company-name')).toBeTruthy());
    expect(bootstrapCompany).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByTestId('onboarding-company-name'), 'Manual Charters');
    (bootstrapCompany as jest.Mock).mockResolvedValue({ ok: true, member: {} });
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-submit'));
    });

    expect(bootstrapCompany).toHaveBeenCalledWith('Manual Charters', 'owner');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows an error state when the bootstrap RPC fails (error case)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'owner@example.com', user_metadata: { pending_company_name: 'Zarpe Charters' } } },
    });
    (bootstrapCompany as jest.Mock).mockResolvedValue({ ok: false, message: 'boom' });

    render(<CompanyOnboardingScreen />);

    await waitFor(() => expect(screen.getByTestId('onboarding-error')).toBeTruthy());
  });
});
