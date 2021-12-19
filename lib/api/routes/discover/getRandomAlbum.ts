import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AlbumResponseDto } from '@/common';
import { NotFoundError } from '@/errors/NotFoundError';
import { DiscoverService } from '@/services/DiscoverService';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomAlbum({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/discover/album',
      { preHandler: server.auth([server.verifySession]) },
      async (): Promise<AlbumResponseDto> => {
        const [album] = await discoverService.findRandomAlbums(1);

        if (!album) {
          throw new NotFoundError('The library seems to be empty');
        }

        return {
          album,
        };
      },
    );
  });
}
