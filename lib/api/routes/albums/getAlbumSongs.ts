import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type SongsResponseDto } from 'leafplayer-common';

import { type AlbumsService } from '../../../services/AlbumsService.ts';

type Injects = {
  albumsService: AlbumsService;
};

export function getAlbumSongs({ albumsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { albumId: string } }>(
      '/albums/:albumId/songs',
      async (request): Promise<SongsResponseDto> => {
        const { albumId } = request.params;

        const songs = albumsService.findSongsOfAlbum(albumId);

        return {
          songs,
        };
      },
    );
  });
}
