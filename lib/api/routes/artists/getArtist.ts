import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ArtistWithAlbumsResponseDto } from 'common/dtos';

import { ArtistsService } from '../../../services/ArtistsService.ts';

type Injects = {
  artistsService: ArtistsService;
};

export function getArtist({ artistsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { artistId: string } }>(
      '/artists/:artistId',
      async (request): Promise<ArtistWithAlbumsResponseDto> => {
        const { artistId } = request.params;

        return artistsService.findByIdWithAlbums(artistId);
      },
    );
  });
}
