import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text as MockText } from 'react-native';

import Index from '@/app/index';
import { hasActiveSession } from '@/features/auth/api/authService';
import { getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/features/auth/api/authService', () => ({
  hasActiveSession: jest.fn(),
}));

jest.mock('@/features/company/api/companyService', () => ({
  getCompanyMembership: jest.fn(),
}));

jest.mock('@/features/home/screens/HomeScreen', () => {
  return function MockHomeScreen() {
    return <MockText>Home</MockText>;
  };
});

const mockRedirect = jest.fn((_props: { href: string }) => null);
jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
}));

describe('Index gate (B1/B2)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects to /welcome when there is no session (happy path / B1)', async () => {
    (hasActiveSession as jest.Mock).mockResolvedValue(false);

    render(<Index />);

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith({ href: '/welcome' }));
    expect(getCompanyMembership).not.toHaveBeenCalled();
  });

  it('redirects to /onboarding when there is a session but no company yet (edge case / B2)', async () => {
    (hasActiveSession as jest.Mock).mockResolvedValue(true);
    (getCompanyMembership as jest.Mock).mockResolvedValue(undefined);

    render(<Index />);

    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith({ href: '/onboarding' }));
  });

  it('renders Home when there is a session and a company (happy path / B2 AC#3)', async () => {
    (hasActiveSession as jest.Mock).mockResolvedValue(true);
    (getCompanyMembership as jest.Mock).mockResolvedValue({ id: 'm1' });

    render(<Index />);

    await waitFor(() => expect(screen.getByText('Home')).toBeTruthy());
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
