import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type AlbumResponseDto } from 'leafplayer-common';

import { NotFoundError } from '../../../errors/NotFoundError.ts';
import { type DiscoverService } from '../../../services/DiscoverService.ts';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomAlbum({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get('/discover/album', async (): Promise<AlbumResponseDto> => {
      const [album] = discoverService.findRandomAlbums(1);

      if (!album) {
        throw new NotFoundError('The library seems to be empty');
      }

      return {
        album,
      };
    });
  });
}
