import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AlbumWithSongsResponseDto } from 'leafplayer-common';

import { AlbumsService } from '../../../services/AlbumsService.ts';

type Injects = {
  albumsService: AlbumsService;
};

export function getAlbum({ albumsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { albumId: string } }>(
      '/albums/:albumId',
      async (request): Promise<AlbumWithSongsResponseDto> => {
        const { albumId } = request.params;

        const album = albumsService.findById(albumId);

        const songs = albumsService.findSongsOfAlbum(albumId);

        return {
          album,
          songs,
        };
      },
    );
  });
}
