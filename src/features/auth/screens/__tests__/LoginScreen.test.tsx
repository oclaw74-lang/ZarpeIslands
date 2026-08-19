import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import { signIn, signInWithGoogle } from '@/features/auth/api/authService';

jest.mock('@/features/auth/api/authService', () => ({
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'zarpeislands://login'),
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

  it('redirects to Home after a successful Google sign-in (happy path / B7 AC#2)', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('login-google'));
    });

    expect(signInWithGoogle).toHaveBeenCalledWith('zarpeislands://login');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not show an error when the Google flow is cancelled (edge case / B7 AC#3)', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValue({ ok: false, message: 'cancelled' });
    render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('login-google'));
    });

    expect(screen.queryByTestId('login-error')).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows a generic error when the Google flow fails for another reason (error case / B7)', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValue({ ok: false, message: 'oauth-failed' });
    render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('login-google'));
    });

    expect(screen.getByTestId('login-error')).toHaveTextContent('Something went wrong. Please try again.');
  });
});
