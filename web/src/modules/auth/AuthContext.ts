import { User } from 'leafplayer-common';
import { createContext } from 'react';
import {
  throwNotImplemented,
  throwNotImplementedPromise,
} from 'helpers/context';

export type AuthContextProps = {
  user: User | null;
  artworkToken: string | null;
  storeUser: (user: User | null) => void;
  storeArtworkToken: (token: string | null) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  artworkToken: null,
  storeUser: throwNotImplemented,
  storeArtworkToken: throwNotImplemented,
  logout: throwNotImplementedPromise,
});
