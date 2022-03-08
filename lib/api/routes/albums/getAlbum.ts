import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AlbumWithSongsResponseDto } from '~/common';
import { AlbumsService } from '~/services/AlbumsService';

type Injects = {
  albumsService: AlbumsService;
};

export function getAlbum({ albumsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { albumId: string } }>(
      '/albums/:albumId',
      { preHandler: server.auth([server.verifySession]) },
      async (request): Promise<AlbumWithSongsResponseDto> => {
        const { albumId } = request.params;

        const album = await albumsService.findById(albumId);

        const songs = await albumsService.findSongsOfAlbum(albumId);

        return {
          album,
          songs,
        };
      },
    );
  });
}
