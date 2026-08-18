import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import ResetPasswordScreen from '@/features/auth/screens/ResetPasswordScreen';
import { setRecoverySession, updatePassword } from '@/features/auth/api/authService';

jest.mock('@/features/auth/api/authService', () => ({
  setRecoverySession: jest.fn(),
  updatePassword: jest.fn(),
}));

const mockReplace = jest.fn();
let mockParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

describe('ResetPasswordScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = {};
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the invalid-link state when there are no tokens in the route params (error case)', async () => {
    mockParams = {};
    render(<ResetPasswordScreen />);

    await waitFor(() => expect(screen.getByTestId('reset-password-invalid')).toBeTruthy());
    expect(setRecoverySession).not.toHaveBeenCalled();
  });

  it('establishes the session and shows the new-password form when tokens are valid (happy path)', async () => {
    mockParams = { access_token: 'abc', refresh_token: 'def' };
    (setRecoverySession as jest.Mock).mockResolvedValue({ ok: true });

    render(<ResetPasswordScreen />);

    await waitFor(() => expect(screen.getByTestId('reset-password-input')).toBeTruthy());
    expect(setRecoverySession).toHaveBeenCalledWith({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('shows the invalid-link state when Supabase rejects the tokens (edge case / expired link)', async () => {
    mockParams = { access_token: 'expired', refresh_token: 'expired' };
    (setRecoverySession as jest.Mock).mockResolvedValue({ ok: false, message: 'invalid token' });

    render(<ResetPasswordScreen />);

    await waitFor(() => expect(screen.getByTestId('reset-password-invalid')).toBeTruthy());
  });

  it('updates the password and shows success (happy path / AC#3)', async () => {
    mockParams = { access_token: 'abc', refresh_token: 'def' };
    (setRecoverySession as jest.Mock).mockResolvedValue({ ok: true });
    (updatePassword as jest.Mock).mockResolvedValue({ ok: true });

    render(<ResetPasswordScreen />);
    await waitFor(() => expect(screen.getByTestId('reset-password-input')).toBeTruthy());

    fireEvent.changeText(screen.getByTestId('reset-password-input'), 'new-strong-password');
    await act(async () => {
      fireEvent.press(screen.getByTestId('reset-password-submit'));
    });

    expect(updatePassword).toHaveBeenCalledWith('new-strong-password');
    expect(screen.getByTestId('reset-password-success')).toBeTruthy();
  });
});
