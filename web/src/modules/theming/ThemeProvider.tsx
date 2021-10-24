import { useMediaQuery } from 'helpers/mediaQuery';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { ThemeContext } from './ThemeContext';

const LOCAL_STORAGE_KEY = 'is-dark-mode';

const saved = localStorage.getItem(LOCAL_STORAGE_KEY);

export function ThemeProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [isNightMode, setIsNightMode] = useState(saved === 'false');
  const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    if (saved === null) {
      setIsNightMode(prefersDarkScheme);
    }
  }, [prefersDarkScheme]);

  useEffect(() => {
    if (isNightMode) {
      document.body.setAttribute('data-theme', 'night');
    } else {
      document.body.setAttribute('data-theme', 'day');
    }
  }, [isNightMode]);

  function setIsNightModePersistent(value: boolean) {
    setIsNightMode(value);
    localStorage.setItem(LOCAL_STORAGE_KEY, isNightMode ? 'true' : 'false');
  }

  return (
    <ThemeContext.Provider
      value={{
        isNightMode,
        setIsNightMode: setIsNightModePersistent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
