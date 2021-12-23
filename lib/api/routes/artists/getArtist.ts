import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ArtistWithAlbumsResponseDto } from 'common/dtos';

import { NotFoundError } from '@/errors/NotFoundError';
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

        const data = await artistsService.findByIdWithAlbums(artistId);

        if (!data) {
          throw new NotFoundError();
        }

        return data;
      },
    );
  });
}
