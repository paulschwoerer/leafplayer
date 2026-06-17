import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AlbumsResponseDto } from '@/common';
import { DiscoverService } from '../../../services/DiscoverService.ts';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomAlbums({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get('/discover/albums', async (): Promise<AlbumsResponseDto> => {
      const albums = discoverService.findRandomAlbums(7);

      return {
        albums,
      };
    });
  });
}
