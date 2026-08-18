import { fireEvent, render, screen } from '@testing-library/react-native';
import { act } from 'react';

import i18n from '@/lib/i18n';
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('WelcomeScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the brand tagline and value subtitle before asking for credentials (happy path)', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText('Smooth sailing, every day.')).toBeTruthy();
    expect(
      screen.getByText(
        'Boat maintenance, crew shifts, time-clock and tips — all in one place for your island operation.'
      )
    ).toBeTruthy();
  });

  it('navigates to login when "Get started" is pressed (edge case)', () => {
    render(<WelcomeScreen />);

    fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
