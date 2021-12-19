import { AwilixContainer } from 'awilix';
import { FastifyPluginAsync } from 'fastify';
import fastifyAuth from 'fastify-auth';

import { errorHandler } from './errorHandler';
import { createSessionAuthPlugin } from './plugins/sessionAuth';
import { sortPlugin } from './plugins/sort';
import { createTokenAuthPlugin } from './plugins/tokenAuth';
import { createVerifyPasswordPlugin } from './plugins/verifyPassword';
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
import { search } from './routes/search';
import { register } from './routes/auth/register';
import { getSessions } from './routes/auth/getSessions';
import { revokeSession } from './routes/auth/revokeSession';
import { getRecentAlbums } from './routes/discover/getRecentAlbums';
import { getRandomAlbums } from './routes/discover/getRandomAlbums';
import { getRandomArtists } from './routes/discover/getRandomArtists';
import { getRandomArtist } from './routes/discover/getRandomArtist';
import { getRandomAlbum } from './routes/discover/getRandomAlbum';

export function initApi(container: AwilixContainer): FastifyPluginAsync {
  const authPlugin = container.build(createSessionAuthPlugin);
  const tokenAuthPlugin = container.build(createTokenAuthPlugin);
  const verifyPasswordPlugin = container.build(createVerifyPasswordPlugin);

  return async server => {
    await server.register(fastifyAuth);
    await server.register(authPlugin);
    await server.register(tokenAuthPlugin);
    await server.register(sortPlugin);
    await server.register(verifyPasswordPlugin);

    server.setErrorHandler(errorHandler);

    await server.register(container.build(register));
    await server.register(container.build(login));
    await server.register(container.build(changePassword));
    await server.register(container.build(currentUser));
    await server.register(container.build(logout));
    await server.register(container.build(getSessions));
    await server.register(container.build(revokeSession));

    await server.register(container.build(getRecentAlbums));
    await server.register(container.build(getRandomAlbums));
    await server.register(container.build(getRandomArtists));
    await server.register(container.build(getRandomArtist));
    await server.register(container.build(getRandomAlbum));

    await server.register(container.build(getArtist));
    await server.register(container.build(findArtists));
    await server.register(container.build(getArtistSongs));

    await server.register(container.build(getAlbum));
    await server.register(container.build(findAlbums));
    await server.register(container.build(getAlbumSongs));

    await server.register(container.build(search));

    await server.register(container.build(getArtwork));
    await server.register(container.build(getAudioStream));
  };
}
