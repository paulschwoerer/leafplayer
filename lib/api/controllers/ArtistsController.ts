import { FastifyPluginAsync } from 'fastify';

import {
  ArtistsResponseDto,
  ArtistWithAlbumsResponseDto,
  SongsResponseDto,
} from '@/common';
import { ArtistsService } from '@/services/ArtistsService';
import { NotFoundError } from '@/errors/NotFoundError';
import { withTimestamps } from '@/helpers/sort';

type Injects = {
  artistsService: ArtistsService;
};

export function createArtistsController({
  artistsService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.addHook('preHandler', server.auth([server.verifyAuth]));

    server.get(
      '/',
      {
        preHandler: server.sortParam(withTimestamps('name', 'year')),
      },
      async (request): Promise<ArtistsResponseDto> => {
        const artists = await artistsService.find(request.sort);

        return { artists };
      },
    );

    server.get<{ Params: { artistId: string } }>(
      '/:artistId',
      async (request): Promise<ArtistWithAlbumsResponseDto> => {
        const { artistId } = request.params;

        const data = await artistsService.findByIdWithAlbums(artistId);

        if (!data) {
          throw new NotFoundError();
        }

        return data;
      },
    );

    server.get<{ Params: { artistId: string } }>(
      '/:artistId/songs',
      async (request): Promise<SongsResponseDto> => {
        const { artistId } = request.params;

        const songs = await artistsService.findAllSongsByArtist(artistId);

        return { songs };
      },
    );
  };
}
