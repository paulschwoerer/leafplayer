import { FastifyPluginAsync } from 'fastify';

import {
  ArtistsResponseDto,
  ArtistWithAlbumsResponseDto,
  SongsResponseDto,
} from '@/common';
import {
  useSortMiddleware,
  withTimestamps,
} from '@/middlewares/SortMiddleware';
import { ArtistsService } from '@/services/ArtistsService';
import { sendNotFoundError } from '@/helpers/responses';

type Injects = {
  artistsService: ArtistsService;
};

export function ArtistsController({
  artistsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get(
      '/',
      useSortMiddleware(withTimestamps('name')),
      async (request): Promise<ArtistsResponseDto> => {
        const artists = await artistsService.find(request.sort);

        return { artists };
      },
    );

    router.get<{ Params: { artistId: string } }>(
      '/:artistId',
      async (request, reply): Promise<ArtistWithAlbumsResponseDto> => {
        const { artistId } = request.params;

        const data = await artistsService.findByIdWithAlbums(artistId);

        if (!data) {
          return sendNotFoundError(reply);
        }

        return data;
      },
    );

    router.get<{ Params: { artistId: string } }>(
      '/:artistId/songs',
      async (request): Promise<SongsResponseDto> => {
        const { artistId } = request.params;

        const songs = await artistsService.findAllSongsByArtist(artistId);

        return { songs };
      },
    );
  };
}
