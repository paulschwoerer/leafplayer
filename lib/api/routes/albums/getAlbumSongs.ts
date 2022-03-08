import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SongsResponseDto } from '~/common';
import { AlbumsService } from '~/services/AlbumsService';

type Injects = {
  albumsService: AlbumsService;
};

export function getAlbumSongs({ albumsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { albumId: string } }>(
      '/albums/:albumId/songs',
      { preHandler: server.auth([server.verifySession]) },
      async (request): Promise<SongsResponseDto> => {
        const { albumId } = request.params;

        const songs = await albumsService.findSongsOfAlbum(albumId);

        return {
          songs,
        };
      },
    );
  });
}
