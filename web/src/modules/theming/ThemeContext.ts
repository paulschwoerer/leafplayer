import { throwNotImplemented } from 'helpers/context';
import { createContext } from 'react';

type ThemeContextProps = {
  isNightMode: boolean;
  setIsNightMode: (value: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextProps>({
  isNightMode: false,
  setIsNightMode: throwNotImplemented,
});
