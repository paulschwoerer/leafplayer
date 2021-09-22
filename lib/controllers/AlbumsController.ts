import { AlbumWithSongsResponseDto, SongsResponseDto } from '@common';
import { useSortMiddleware, withTimestamps } from '@middlewares/SortMiddleware';
import { AlbumsService } from '@services/AlbumsService';
import { FastifyPluginAsync } from 'fastify';
import { sendNotFoundError } from '../helpers/responses';

type Injects = {
  albumsService: AlbumsService;
};

export function AlbumsController({
  albumsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get(
      '/',
      useSortMiddleware(withTimestamps('name', 'year')),
      async request => {
        const albums = await albumsService.find(request.sort);

        return { albums };
      },
    );

    router.get<{ Params: { albumId: string } }>(
      '/:albumId',
      async (request, reply): Promise<AlbumWithSongsResponseDto> => {
        const { albumId } = request.params;

        const album = await albumsService.findById(albumId);

        if (!album) {
          return sendNotFoundError(reply);
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
