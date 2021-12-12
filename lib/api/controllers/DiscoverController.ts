import { FastifyPluginAsync } from 'fastify';

import {
  AlbumResponseDto,
  AlbumsResponseDto,
  ArtistResponseDto,
  ArtistsResponseDto,
} from '@/common';
import { DiscoverService } from '@/services/DiscoverService';
import { NotFoundError } from '@/errors/NotFoundError';

type Injects = {
  discoverService: DiscoverService;
};

export function createDiscoverController({
  discoverService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.addHook('preHandler', server.auth([server.verifyAuth]));

    server.get('/recent', async (): Promise<AlbumsResponseDto> => {
      const albums = await discoverService.findRecentlyAddedAlbums(8);

      return {
        albums,
      };
    });

    server.get('/artists', async (): Promise<ArtistsResponseDto> => {
      const artists = await discoverService.findRandomArtists(7);

      return {
        artists,
      };
    });

    server.get('/albums', async (): Promise<AlbumsResponseDto> => {
      const albums = await discoverService.findRandomAlbums(7);

      return {
        albums,
      };
    });

    server.get('/artist', async (): Promise<ArtistResponseDto> => {
      const [artist] = await discoverService.findRandomArtists(1);

      if (!artist) {
        throw new NotFoundError('The library seems to be empty');
      }

      return {
        artist,
      };
    });

    server.get('/album', async (): Promise<AlbumResponseDto> => {
      const [album] = await discoverService.findRandomAlbums(1);

      if (!album) {
        throw new NotFoundError('The library seems to be empty');
      }

      return {
        album,
      };
    });
  };
}
