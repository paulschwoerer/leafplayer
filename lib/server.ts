import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';
import { LeafplayerConfig } from './config';
import {
  AlbumsController,
  ArtistsController,
  ArtworksController,
  AuthController,
  DiscoverController,
  SearchController,
  SessionsController,
  StreamController,
} from './controllers';
import { comparePasswords } from './helpers/passwords';
import { AuthMiddleware, TokenAuthMiddleware } from './middlewares';
import { AlbumsService } from './services/AlbumsService';
import { ArtistsService } from './services/ArtistsService';
import { ArtworksService } from './services/ArtworksService';
import { AudioFilesService } from './services/AudioFilesService';
import { AuthService } from './services/AuthService';
import { DiscoverService } from './services/DiscoverService';
import { InvitationsService } from './services/InvitationsService';
import { SearchService } from './services/SearchService';
import { SessionsService } from './services/SessionsService';

type Injects = {
  config: LeafplayerConfig;
  authService: AuthService;
  sessionsService: SessionsService;
  albumsService: AlbumsService;
  artistsService: ArtistsService;
  searchService: SearchService;
  artworksService: ArtworksService;
  audioFilesService: AudioFilesService;
  invitationsService: InvitationsService;
  discoverService: DiscoverService;
};

export async function initServer({
  config,
  authService,
  albumsService,
  artistsService,
  sessionsService,
  searchService,
  artworksService,
  audioFilesService,
  invitationsService,
  discoverService,
}: Injects): Promise<FastifyInstance> {
  const app = fastify({ logger: false });

  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
  });

  app.setNotFoundHandler(async (_: FastifyRequest, reply: FastifyReply) => {
    await reply.sendFile('index.html');
  });

  const authMiddleware = AuthMiddleware({
    sessionsService,
    comparePasswords,
  });

  await app.register(
    async api => {
      await api.register(
        AuthController({
          authService,
          invitationsService,
          authMiddleware,
          config: config.security,
        }),
        {
          prefix: 'auth',
        },
      );

      await api.register(async tokenAuthenticated => {
        tokenAuthenticated.addHook<{ Querystring: { token?: string } }>(
          'preValidation',
          TokenAuthMiddleware(authService),
        );
        await api.register(ArtworksController({ artworksService }), {
          prefix: 'artworks',
        });
      });

      await api.register(async authenticated => {
        authenticated.addHook('preValidation', authMiddleware);

        await authenticated.register(
          SessionsController({
            sessionsService,
          }),
          {
            prefix: 'sessions',
          },
        );

        await authenticated.register(
          DiscoverController({
            discoverService,
          }),
          {
            prefix: 'discover',
          },
        );

        await authenticated.register(
          SearchController({
            searchService,
          }),
          {
            prefix: 'search',
          },
        );

        await authenticated.register(AlbumsController({ albumsService }), {
          prefix: 'albums',
        });
        await authenticated.register(ArtistsController({ artistsService }), {
          prefix: 'artists',
        });
        await authenticated.register(StreamController({ audioFilesService }), {
          prefix: 'stream',
        });
      });
    },
    { prefix: '/api' },
  );

  return app;
}
