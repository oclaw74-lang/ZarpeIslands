import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import { signIn } from '@/features/auth/api/authService';

jest.mock('@/features/auth/api/authService', () => ({
  signIn: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

describe('LoginScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('redirects to Home on successful login (happy path / AC#1)', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), 'owner@example.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'correct-password');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-submit'));
    });

    expect(signIn).toHaveBeenCalledWith('owner@example.com', 'correct-password');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows a generic error message on invalid credentials, without navigating (error case / AC#2)', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: false, message: 'invalid-credentials' });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), 'owner@example.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'wrong-password');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-submit'));
    });

    expect(screen.getByTestId('login-error')).toHaveTextContent('Incorrect email or password.');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('navigates to forgot-password when the link is pressed (edge case)', () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('login-forgot-password'));

    expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  });
});
