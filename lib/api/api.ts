import { type AwilixContainer } from 'awilix';
import { type FastifyPluginAsync } from 'fastify';

import { type AuthService } from '../services/AuthService.ts';

import { errorHandler } from './errorHandler.ts';
import { verifySession } from './sessionAuth.ts';
import { changePassword } from './routes/auth/changePassword.ts';
import { findAlbums } from './routes/albums/findAlbums.ts';
import { getAlbum } from './routes/albums/getAlbum.ts';
import { logout } from './routes/auth/logout.ts';
import { getAlbumSongs } from './routes/albums/getAlbumSongs.ts';
import { currentUser } from './routes/auth/currentUser.ts';
import { login } from './routes/auth/login.ts';
import { getArtist } from './routes/artists/getArtist.ts';
import { findArtists } from './routes/artists/findArtists.ts';
import { getArtistSongs } from './routes/artists/getArtistSongs.ts';
import { getArtwork } from './routes/getArtwork.ts';
import { getAudioStream } from './routes/getAudioStream.ts';
import { search } from './routes/search/search.ts';
import { register } from './routes/auth/register.ts';
import { getSessions } from './routes/auth/getSessions.ts';
import { revokeSession } from './routes/auth/revokeSession.ts';
import { getRecentAlbums } from './routes/discover/getRecentAlbums.ts';
import { getRandomAlbums } from './routes/discover/getRandomAlbums.ts';
import { getRandomArtists } from './routes/discover/getRandomArtists.ts';
import { getRandomArtist } from './routes/discover/getRandomArtist.ts';
import { getRandomAlbum } from './routes/discover/getRandomAlbum.ts';
import { createSearchHistoryEntry } from './routes/search/createHistoryEntry.ts';
import { findSearchHistoryEntries } from './routes/search/findHistoryEntries.ts';
import { deleteSearchHistoryEntry } from './routes/search/deleteHistoryEntry.ts';

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
