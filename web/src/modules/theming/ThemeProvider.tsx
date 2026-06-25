import { useMediaQuery } from 'helpers/mediaQuery';
import React, {
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useState,
} from 'react';
import { ThemeContext } from './ThemeContext';

const LOCAL_STORAGE_KEY = 'is-dark-mode';

function getStoredPreference(): boolean | null {
  const val = localStorage.getItem(LOCAL_STORAGE_KEY);
  switch (val) {
    case null:
      return null;
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      console.debug(
        `[ThemeProvider] found invalid value for local storage key ${LOCAL_STORAGE_KEY}: '${val}'`,
      );
      return null;
  }
}

export function ThemeProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const systemPreferNightMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [preferNightMode, setPreferNightMode] = useState(getStoredPreference());

  const isNightMode =
    preferNightMode === null ? systemPreferNightMode : preferNightMode;

  useEffect(() => {
    if (isNightMode) {
      document.body.setAttribute('data-theme', 'night');
    } else {
      document.body.setAttribute('data-theme', 'day');
    }
  }, [isNightMode]);

  function persistNightModePreference(value: boolean) {
    setPreferNightMode(value);
    localStorage.setItem(LOCAL_STORAGE_KEY, isNightMode ? 'true' : 'false');
  }

  return (
    <ThemeContext.Provider
      value={{
        isNightMode,
        setIsNightMode: persistNightModePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
