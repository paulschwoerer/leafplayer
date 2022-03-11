import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AlbumsResponseDto } from '@/common';
import { DiscoverService } from '@/services/DiscoverService';

type Injects = {
  discoverService: DiscoverService;
};

export function getRecentAlbums({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/discover/recent',
      { preHandler: server.auth([server.verifySession]) },
      async (): Promise<AlbumsResponseDto> => {
        const albums = await discoverService.findRecentlyAddedAlbums(8);

        return {
          albums,
        };
      },
    );
  });
}
