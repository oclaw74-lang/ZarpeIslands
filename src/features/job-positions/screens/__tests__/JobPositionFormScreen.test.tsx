import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import JobPositionFormScreen from '@/features/job-positions/screens/JobPositionFormScreen';
import {
  createJobPosition,
  getJobPosition,
  updateJobPosition,
} from '@/features/job-positions/api/jobPositionService';
import { getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/features/job-positions/api/jobPositionService', () => ({
  createJobPosition: jest.fn(),
  updateJobPosition: jest.fn(),
  getJobPosition: jest.fn(),
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

describe('JobPositionFormScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = {};
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('creates a position scoped to the current company (happy path / AC#1)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ companyId: 'company-1' });
    (createJobPosition as jest.Mock).mockResolvedValue({ ok: true, jobPosition: {} });

    render(<JobPositionFormScreen />);

    fireEvent.changeText(screen.getByTestId('job-position-name'), 'Bartender');
    await act(async () => {
      fireEvent.press(screen.getByTestId('job-position-form-submit'));
    });

    expect(createJobPosition).toHaveBeenCalledWith(
      'company-1',
      expect.objectContaining({ name: 'Bartender', isRequiredPerShift: false, rotationRepeatAllowed: false })
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('loads and pre-fills the position when editing, then updates it (happy path / AC#3)', async () => {
    mockParams = { id: 'jp1' };
    (getJobPosition as jest.Mock).mockResolvedValue({
      id: 'jp1',
      name: 'Captain/Skipper',
      isRequiredPerShift: true,
      rotationRepeatAllowed: true,
    });
    (updateJobPosition as jest.Mock).mockResolvedValue({ ok: true, jobPosition: {} });

    render(<JobPositionFormScreen />);
    await waitFor(() => expect(screen.getByDisplayValue('Captain/Skipper')).toBeTruthy());

    await act(async () => {
      fireEvent(screen.getByTestId('job-position-required-per-shift'), 'valueChange', false);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('job-position-form-submit'));
    });

    expect(updateJobPosition).toHaveBeenCalledWith('jp1', expect.objectContaining({ isRequiredPerShift: false }));
  });

  it('shows an error message when the create fails, e.g. RLS rejects a non owner/manager (error case)', async () => {
    (getCompanyMembership as jest.Mock).mockResolvedValue({ companyId: 'company-1' });
    (createJobPosition as jest.Mock).mockResolvedValue({ ok: false, message: 'RLS violation' });

    render(<JobPositionFormScreen />);

    fireEvent.changeText(screen.getByTestId('job-position-name'), 'Bartender');
    await act(async () => {
      fireEvent.press(screen.getByTestId('job-position-form-submit'));
    });

    expect(screen.getByTestId('job-position-form-error')).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
