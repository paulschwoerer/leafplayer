import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ArtistsResponseDto } from 'leafplayer-common';

import { DiscoverService } from '../../../services/DiscoverService.ts';

type Injects = {
  discoverService: DiscoverService;
};

export function getRandomArtists({
  discoverService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get('/discover/artists', async (): Promise<ArtistsResponseDto> => {
      const artists = discoverService.findRandomArtists(7);

      return {
        artists,
      };
    });
  });
}
