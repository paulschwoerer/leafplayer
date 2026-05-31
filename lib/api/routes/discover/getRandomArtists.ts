import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ArtistsResponseDto } from '@/common';
import { DiscoverService } from '@/services/DiscoverService';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomArtists({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/discover/artists',
      { preHandler: server.verifySession },
      async (): Promise<ArtistsResponseDto> => {
        const artists = discoverService.findRandomArtists(7);

        return {
          artists,
        };
      },
    );
  });
}
