import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ArtistResponseDto } from '~/common';
import { NotFoundError } from '~/errors/NotFoundError';
import { DiscoverService } from '~/services/DiscoverService';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomArtist({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/discover/artist',
      { preHandler: server.auth([server.verifySession]) },
      async (): Promise<ArtistResponseDto> => {
        const [artist] = await discoverService.findRandomArtists(1);

        if (!artist) {
          throw new NotFoundError('The library seems to be empty');
        }

        return {
          artist,
        };
      },
    );
  });
}
