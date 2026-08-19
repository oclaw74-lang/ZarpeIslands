import { fireEvent, render, screen } from '@testing-library/react-native';
import { act } from 'react';

import i18n from '@/lib/i18n';
import CheckEmailScreen from '@/features/auth/screens/CheckEmailScreen';

const mockReplace = jest.fn();
let mockParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

describe('CheckEmailScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = { email: 'owner@example.com' };
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the email the confirmation was sent to (happy path)', () => {
    render(<CheckEmailScreen />);

    expect(screen.getByText(/owner@example.com/)).toBeTruthy();
  });

  it('navigates back to login when pressed (edge case)', () => {
    render(<CheckEmailScreen />);

    fireEvent.press(screen.getByTestId('check-email-back-to-login'));

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
