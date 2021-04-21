import {
  ArtistWithAlbumsResponseDto,
  ArtistsResponseDto,
  SongsResponseDto,
} from '@common';
import { FastifyPluginAsync } from 'fastify';
import { sendNotFoundApiError } from '../helpers/responses';
import { ArtistsService } from '../services/ArtistsService';

type Injects = {
  artistsService: ArtistsService;
};

export function ArtistsController({
  artistsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get(
      '/',
      async (): Promise<ArtistsResponseDto> => {
        const artists = await artistsService.findAll();

        return { artists };
      },
    );

    router.get<{ Params: { artistId: string } }>(
      '/:artistId',
      async (request, reply): Promise<ArtistWithAlbumsResponseDto> => {
        const { artistId } = request.params;

        const data = await artistsService.findByIdWithAlbums(artistId);

        if (!data) {
          return sendNotFoundApiError(reply);
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
