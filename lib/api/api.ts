import { AwilixContainer } from 'awilix';
import { FastifyPluginAsync } from 'fastify';

import { AuthService } from '@/services/AuthService';

import { errorHandler } from './errorHandler';
import { verifySession } from './sessionAuth';
import { changePassword } from './routes/auth/changePassword';
import { findAlbums } from './routes/albums/findAlbums';
import { getAlbum } from './routes/albums/getAlbum';
import { logout } from './routes/auth/logout';
import { getAlbumSongs } from './routes/albums/getAlbumSongs';
import { currentUser } from './routes/auth/currentUser';
import { login } from './routes/auth/login';
import { getArtist } from './routes/artists/getArtist';
import { findArtists } from './routes/artists/findArtists';
import { getArtistSongs } from './routes/artists/getArtistSongs';
import { getArtwork } from './routes/getArtwork';
import { getAudioStream } from './routes/getAudioStream';
import { search } from './routes/search/search';
import { register } from './routes/auth/register';
import { getSessions } from './routes/auth/getSessions';
import { revokeSession } from './routes/auth/revokeSession';
import { getRecentAlbums } from './routes/discover/getRecentAlbums';
import { getRandomAlbums } from './routes/discover/getRandomAlbums';
import { getRandomArtists } from './routes/discover/getRandomArtists';
import { getRandomArtist } from './routes/discover/getRandomArtist';
import { getRandomAlbum } from './routes/discover/getRandomAlbum';
import { createSearchHistoryEntry } from './routes/search/createHistoryEntry';
import { findSearchHistoryEntries } from './routes/search/findHistoryEntries';
import { deleteSearchHistoryEntry } from './routes/search/deleteHistoryEntry';

export function initApi(container: AwilixContainer): FastifyPluginAsync {
  const authService = container.resolve<AuthService>('authService');

  return async server => {
    server.setErrorHandler(errorHandler);

    await server.register(container.build(register));
    await server.register(container.build(login));

    // uses token auth mechanism
    await server.register(container.build(getArtwork));

    await server.register(async authenticated => {
      authenticated.addHook('preHandler', verifySession(authService));

      await authenticated.register(container.build(changePassword));
      await authenticated.register(container.build(currentUser));
      await authenticated.register(container.build(logout));
      await authenticated.register(container.build(getSessions));
      await authenticated.register(container.build(revokeSession));

      await authenticated.register(container.build(getRecentAlbums));
      await authenticated.register(container.build(getRandomAlbums));
      await authenticated.register(container.build(getRandomArtists));
      await authenticated.register(container.build(getRandomArtist));
      await authenticated.register(container.build(getRandomAlbum));

      await authenticated.register(container.build(getArtist));
      await authenticated.register(container.build(findArtists));
      await authenticated.register(container.build(getArtistSongs));

      await authenticated.register(container.build(getAlbum));
      await authenticated.register(container.build(findAlbums));
      await authenticated.register(container.build(getAlbumSongs));

      await authenticated.register(container.build(search));
      await authenticated.register(container.build(findSearchHistoryEntries));
      await authenticated.register(container.build(createSearchHistoryEntry));
      await authenticated.register(container.build(deleteSearchHistoryEntry));

      await authenticated.register(container.build(getAudioStream));
    });
  };
}
