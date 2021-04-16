import { FastifyPluginAsync } from 'fastify';
import { SearchResponseDto } from '@common';
import { AlbumsService } from '../services/AlbumsService';
import { ArtistsService } from '../services/ArtistsService';
import { SongsService } from '../services/SongsService';

type Injects = {
  albumsService: AlbumsService;
  artistsService: ArtistsService;
  songsService: SongsService;
};

export function SearchController({
  albumsService,
  artistsService,
  songsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get<{ Querystring: { q: string } }>(
      '/',
      async (request): Promise<SearchResponseDto> => {
        const { q } = request.query;

        const albums = await albumsService.search(q, 5);
        const artists = await artistsService.search(q, 5);
        const songs = await songsService.search(q, 10);

        return {
          results: {
            albums,
            artists,
            songs,
          },
        };
      },
    );
  };
}
