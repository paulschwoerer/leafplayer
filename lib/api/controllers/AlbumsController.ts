import { FastifyPluginAsync } from 'fastify';

import { AlbumWithSongsResponseDto, SongsResponseDto } from '@/common';
import { AlbumsService } from '@/services/AlbumsService';
import { NotFoundError } from '@/errors/NotFoundError';
import { withTimestamps } from '@/helpers/sort';

type Injects = {
  albumsService: AlbumsService;
};

export function createAlbumsController({
  albumsService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.addHook('preHandler', server.auth([server.verifyAuth]));

    server.get(
      '/',
      {
        preHandler: server.sortParam(withTimestamps('name', 'year')),
      },
      async request => {
        const albums = await albumsService.find(request.sort);

        return { albums };
      },
    );

    server.get<{ Params: { albumId: string } }>(
      '/:albumId',
      async (request): Promise<AlbumWithSongsResponseDto> => {
        const { albumId } = request.params;

        const album = await albumsService.findById(albumId);

        if (!album) {
          throw new NotFoundError();
        }

        const songs = await albumsService.findSongsOfAlbum(albumId);

        return {
          album,
          songs,
        };
      },
    );

    server.get<{ Params: { albumId: string } }>(
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
