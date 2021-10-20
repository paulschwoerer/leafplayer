import FullPageErrorIndicator from 'components/layout/FullPageErrorIndicator/FullPageErrorIndicator';
import FullPageLoadingIndicator from 'components/layout/FullPageLoadingIndicator/FullPageLoadingIndicator';
import { User, UserResponseDto } from 'leafplayer-common';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { isApiError, makeApiGetRequest, makeApiPostRequest } from '../api';
import { AuthContext } from './AuthContext';

export function AuthProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [artworkToken, setArtworkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const logout = async () => {
    await makeApiPostRequest('auth/logout');

    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      const result = await makeApiGetRequest<UserResponseDto>('auth/user');

      if (isApiError(result)) {
        if (result.statusCode === 401) {
          setUser(null);
          setArtworkToken(null);
        } else {
          setError(result.error);
        }
      } else {
        setUser(result.user);
        setArtworkToken(result.artworkToken);
      }
      setIsLoading(false);
    })().catch(console.error);
  }, []);

  if (isLoading) {
    return <FullPageLoadingIndicator invertColors />;
  }

  if (error) {
    return <FullPageErrorIndicator message={error} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        artworkToken,
        storeUser: setUser,
        storeArtworkToken: setArtworkToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
