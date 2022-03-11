import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ArtistWithAlbumsResponseDto } from 'common/dtos';

import { ArtistsService } from '@/services/ArtistsService';

type Injects = {
  artistsService: ArtistsService;
};

export function getArtist({ artistsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { artistId: string } }>(
      '/artists/:artistId',
      { preHandler: server.auth([server.verifySession]) },
      async (request): Promise<ArtistWithAlbumsResponseDto> => {
        const { artistId } = request.params;

        return artistsService.findByIdWithAlbums(artistId);
      },
    );
  });
}
