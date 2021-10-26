import { FastifyPluginAsync } from 'fastify';

import {
  AlbumResponseDto,
  AlbumsResponseDto,
  ArtistResponseDto,
  ArtistsResponseDto,
} from '@/common';
import { sendNotFoundError } from '@/helpers/responses';
import { DiscoverService } from '@/services/DiscoverService';

type Injects = {
  discoverService: DiscoverService;
};

export function DiscoverController({
  discoverService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get('/recent', async (): Promise<AlbumsResponseDto> => {
      const albums = await discoverService.findRecentlyAddedAlbums(8);

      return {
        albums,
      };
    });

    router.get('/artists', async (): Promise<ArtistsResponseDto> => {
      const artists = await discoverService.findRandomArtists(7);

      return {
        artists,
      };
    });

    router.get('/albums', async (): Promise<AlbumsResponseDto> => {
      const albums = await discoverService.findRandomAlbums(7);

      return {
        albums,
      };
    });

    router.get('/artist', async (_, reply): Promise<ArtistResponseDto> => {
      const [artist] = await discoverService.findRandomArtists(1);

      if (!artist) {
        return sendNotFoundError(reply, 'The library seems to be empty');
      }

      return {
        artist,
      };
    });

    router.get('/album', async (_, reply): Promise<AlbumResponseDto> => {
      const [album] = await discoverService.findRandomAlbums(1);

      if (!album) {
        return sendNotFoundError(reply, 'The library seems to be empty');
      }

      return {
        album,
      };
    });
  };
}
