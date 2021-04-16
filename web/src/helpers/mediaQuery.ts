import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    function onUpdate(m: MediaQueryListEvent | MediaQueryList) {
      setMatches(m.matches);
    }

    const watcher = window.matchMedia(query);
    watcher.addListener(onUpdate);
    onUpdate(watcher);
  }, [query]);

  return matches;
}
