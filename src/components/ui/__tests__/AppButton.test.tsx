import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { AppButton } from '@/components/ui/AppButton';

describe('AppButton', () => {
  it('renders the label and fires onPress', () => {
    const onPress = jest.fn();
    render(<AppButton label="Save" onPress={onPress} testID="save-button" />);

    fireEvent.press(screen.getByTestId('save-button'));

    expect(screen.getByText('Save')).toBeTruthy();
    expect(onPress).toHaveBeenCalled();
  });
});
