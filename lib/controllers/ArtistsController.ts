import { FastifyPluginAsync } from 'fastify';
import {
  ArtistResponseDto,
  ArtistsResponseDto,
  SongsResponseDto,
} from '@common';
import { sendNotFoundApiError } from '../helpers/responses';
import { ArtistsService } from '../services/ArtistsService';
import GetRandomArtistsSchema from '../schemas/getRandomArtists.json';

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
      async (request, reply): Promise<ArtistResponseDto> => {
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

    router.get<{ Querystring: { count?: number } }>(
      '/random',
      { schema: GetRandomArtistsSchema },
      async (request): Promise<ArtistsResponseDto> => {
        const { count } = request.query;

        const artists = await artistsService.findRandomArtists(count || 5);

        return { artists };
      },
    );
  };
}
