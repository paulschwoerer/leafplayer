import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ArtistResponseDto } from 'leafplayer-common';

import { NotFoundError } from '../../../errors/NotFoundError.ts';
import { DiscoverService } from '../../../services/DiscoverService.ts';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomArtist({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get('/discover/artist', async (): Promise<ArtistResponseDto> => {
      const [artist] = discoverService.findRandomArtists(1);

      if (!artist) {
        throw new NotFoundError('The library seems to be empty');
      }

      return {
        artist,
      };
    });
  });
}
