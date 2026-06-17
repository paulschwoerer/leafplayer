import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SongsResponseDto } from '@/common';

import { AlbumsService } from '../../../services/AlbumsService.ts';

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
