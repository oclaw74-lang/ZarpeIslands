import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import i18n from '@/lib/i18n';
import LanguageToggle from '@/features/home/components/LanguageToggle';

describe('LanguageToggle', () => {
  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('renders the current language label in English by default (happy path)', () => {
    render(<LanguageToggle />);

    expect(screen.getByText('Current language: English')).toBeTruthy();
  });

  it('switches the rendered text to Spanish when pressed, without remounting (edge case)', async () => {
    render(<LanguageToggle />);

    await act(async () => {
      fireEvent.press(screen.getByText('Switch language'));
    });

    expect(screen.getByText('Idioma actual: Español')).toBeTruthy();
  });

  it('cycles back to English after two presses (edge case)', async () => {
    render(<LanguageToggle />);

    await act(async () => {
      fireEvent.press(screen.getByText('Switch language'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Cambiar idioma'));
    });

    expect(screen.getByText('Current language: English')).toBeTruthy();
  });
});
