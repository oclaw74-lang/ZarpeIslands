import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import { signUp } from '@/features/auth/api/authService';
import { bootstrapCompany } from '@/features/company/api/companyService';

jest.mock('@/features/auth/api/authService', () => ({
  signUp: jest.fn(),
}));

jest.mock('@/features/company/api/companyService', () => ({
  bootstrapCompany: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('RegisterScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  function fillForm() {
    fireEvent.changeText(screen.getByTestId('register-company-name'), 'Zarpe Charters');
    fireEvent.changeText(screen.getByTestId('register-email'), 'owner@example.com');
    fireEvent.changeText(screen.getByTestId('register-password'), 'StrongPassw0rd!');
  }

  it('navigates to check-email when signup succeeds without an active session (happy path — real project behavior)', async () => {
    (signUp as jest.Mock).mockResolvedValue({ ok: true, sessionActive: false });
    render(<RegisterScreen />);

    fillForm();
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-submit'));
    });

    expect(signUp).toHaveBeenCalledWith('owner@example.com', 'StrongPassw0rd!', 'Zarpe Charters');
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/check-email',
      params: { email: 'owner@example.com' },
    });
    expect(bootstrapCompany).not.toHaveBeenCalled();
  });

  it('bootstraps the company immediately when signup returns an active session (edge case)', async () => {
    (signUp as jest.Mock).mockResolvedValue({ ok: true, sessionActive: true });
    (bootstrapCompany as jest.Mock).mockResolvedValue({ ok: true, member: {} });
    render(<RegisterScreen />);

    fillForm();
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-submit'));
    });

    expect(bootstrapCompany).toHaveBeenCalledWith('Zarpe Charters', 'owner@example.com');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows an error message when signup fails (error case)', async () => {
    (signUp as jest.Mock).mockResolvedValue({ ok: false, message: 'User already registered' });
    render(<RegisterScreen />);

    fillForm();
    await act(async () => {
      fireEvent.press(screen.getByTestId('register-submit'));
    });

    expect(screen.getByTestId('register-error')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
