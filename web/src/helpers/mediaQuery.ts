import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    function onChange(m: MediaQueryListEvent | MediaQueryList) {
      setMatches(m.matches);
    }

    const watcher = window.matchMedia(query);
    watcher.addEventListener('change', onChange);
    onChange(watcher);

    return () => watcher.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
