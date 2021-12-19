import { buildApiUrl } from 'modules/api';
import { AuthContext } from 'modules/auth';
import { ThemeContext } from 'modules/theming/ThemeContext';
import { useContext, useMemo } from 'react';

type UseArtworkUrlProps = {
  type: 'album' | 'artist';
  id: string;
  size: number;
};

export function buildArtworkUrl(
  { type, id, size }: UseArtworkUrlProps,
  authToken: string,
): string {
  return buildApiUrl(`artwork/${type}/${id}?size=${size}&token=${authToken}`);
}

export function useThemedUrl(dayUrl: string, nightUrl: string): string {
  const { isNightMode } = useContext(ThemeContext);

  const url = useMemo(() => (isNightMode ? nightUrl : dayUrl), [
    isNightMode,
    dayUrl,
    nightUrl,
  ]);

  return url;
}

export function useArtworkUrl(params: UseArtworkUrlProps): string {
  const auth = useContext(AuthContext);

  const url = useMemo(
    () => (auth.artworkToken ? buildArtworkUrl(params, auth.artworkToken) : ''),
    [auth.artworkToken, params],
  );

  return url;
}
