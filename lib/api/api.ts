import { AwilixContainer } from 'awilix';
import { FastifyPluginAsync } from 'fastify';
import fastifyAuth from 'fastify-auth';

import { createAlbumsController } from './controllers/AlbumsController';
import { createArtistsController } from './controllers/ArtistsController';
import { createArtworksController } from './controllers/ArtworksController';
import { createAuthController } from './controllers/AuthController';
import { createDiscoverController } from './controllers/DiscoverController';
import { createRegistrationController } from './controllers/RegistrationController';
import { createSearchController } from './controllers/SearchController';
import { createSessionsController } from './controllers/SessionsController';
import { createStreamController } from './controllers/StreamController';
import { errorHandler } from './errorHandler';
import { createAuthPlugin } from './plugins/auth';
import { sortPlugin } from './plugins/sort';
import { createTokenAuthPlugin } from './plugins/tokenAuth';
import { createVerifyPasswordPlugin } from './plugins/verifyPassword';

export function initApi(container: AwilixContainer): FastifyPluginAsync {
  const authPlugin = container.build(createAuthPlugin);
  const tokenAuthPlugin = container.build(createTokenAuthPlugin);
  const verifyPasswordPlugin = container.build(createVerifyPasswordPlugin);

  const authController = container.build(createAuthController);
  const registrationController = container.build(createRegistrationController);
  const sessionsController = container.build(createSessionsController);
  const albumsController = container.build(createAlbumsController);
  const artistsController = container.build(createArtistsController);
  const discoverController = container.build(createDiscoverController);
  const searchController = container.build(createSearchController);
  const streamController = container.build(createStreamController);

  const artworksController = container.build(createArtworksController);

  return async server => {
    await server.register(fastifyAuth);
    await server.register(authPlugin);
    await server.register(tokenAuthPlugin);
    await server.register(sortPlugin);
    await server.register(verifyPasswordPlugin);

    server.setErrorHandler(errorHandler);

    await server.register(authController, { prefix: 'auth' });
    await server.register(registrationController, { prefix: 'auth' });
    await server.register(sessionsController, { prefix: 'sessions' });
    await server.register(artworksController, { prefix: 'artworks' });
    await server.register(albumsController, { prefix: 'albums' });
    await server.register(artistsController, { prefix: 'artists' });
    await server.register(discoverController, { prefix: 'discover' });
    await server.register(searchController, { prefix: 'search' });
    await server.register(streamController, { prefix: 'stream' });
  };
}
