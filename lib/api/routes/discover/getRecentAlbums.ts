import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type AlbumsResponseDto } from 'leafplayer-common';

import { type DiscoverService } from '../../../services/DiscoverService.ts';

type Injects = {
  discoverService: DiscoverService;
};

export function getRecentAlbums({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get('/discover/recent', async (): Promise<AlbumsResponseDto> => {
      const albums = discoverService.findRecentlyAddedAlbums(8);

      return {
        albums,
      };
    });
  });
}
