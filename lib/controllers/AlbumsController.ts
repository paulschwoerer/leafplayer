import { AlbumsService } from './../services/AlbumsService';
import { FastifyPluginAsync } from 'fastify';
import { AlbumResponseDto, AlbumsResponseDto, SongsResponseDto } from '@common';
import { sendNotFoundApiError } from '../helpers/responses';
import GetRandomAlbumsSchema from '../schemas/getRandomAlbums.json';

type Injects = {
  albumsService: AlbumsService;
};

export function AlbumsController({
  albumsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get('/', async () => {
      const albums = await albumsService.findAll();

      return { albums };
    });

    router.get<{ Params: { albumId: string } }>(
      '/:albumId',
      async (request, reply): Promise<AlbumResponseDto> => {
        const { albumId } = request.params;

        const album = await albumsService.findById(albumId);

        if (!album) {
          return sendNotFoundApiError(reply);
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

    router.get<{ Querystring: { count?: number } }>(
      '/random',
      { schema: GetRandomAlbumsSchema },
      async (request): Promise<AlbumsResponseDto> => {
        const { count } = request.query;

        const albums = await albumsService.findRandomAlbums(count || 5);

        return { albums };
      },
    );
  };
}
