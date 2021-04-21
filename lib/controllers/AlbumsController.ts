import { AlbumWithSongsResponseDto, SongsResponseDto } from '@common';
import { FastifyPluginAsync } from 'fastify';
import { sendNotFoundApiError } from '../helpers/responses';
import { AlbumsService } from './../services/AlbumsService';

type Injects = {
  albumsService: AlbumsService;
};

export function AlbumsController({
  albumsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get('/', async () => {
      const albums = await albumsService.findAll();

      return { albums };
    });

    router.get<{ Params: { albumId: string } }>(
      '/:albumId',
      async (request, reply): Promise<AlbumWithSongsResponseDto> => {
        const { albumId } = request.params;

        const album = await albumsService.findById(albumId);

        if (!album) {
          return sendNotFoundApiError(reply);
        }

        const songs = await albumsService.findSongsOfAlbum(albumId);

        return {
          album,
          songs,
        };
      },
    );

    router.get<{ Params: { albumId: string } }>(
      '/:albumId/songs',
      async (request): Promise<SongsResponseDto> => {
        const { albumId } = request.params;

        const songs = await albumsService.findSongsOfAlbum(albumId);

        return {
          songs,
        };
      },
    );
  };
}
