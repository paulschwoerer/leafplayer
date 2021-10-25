import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeContext } from 'modules/theming/ThemeContext';
import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('calls funtion in ThemeContext', async () => {
    const setIsNightMode = jest.fn();

    render(
      <ThemeContext.Provider
        value={{
          isNightMode: false,
          setIsNightMode,
        }}
      >
        <ThemeSwitcher />
      </ThemeContext.Provider>,
    );

    const toggleButton = await screen.findByRole('button');

    fireEvent.click(toggleButton);

    await waitFor(() => expect(setIsNightMode).toHaveBeenCalledWith(true));
  });
});
