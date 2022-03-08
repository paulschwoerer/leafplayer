import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SongsResponseDto } from '~/common';
import { ArtistsService } from '~/services/ArtistsService';

type Injects = {
  artistsService: ArtistsService;
};

export function getArtistSongs({
  artistsService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { artistId: string } }>(
      '/artists/:artistId/songs',
      { preHandler: server.auth([server.verifySession]) },
      async (request): Promise<SongsResponseDto> => {
        const { artistId } = request.params;

        const songs = await artistsService.findAllSongsByArtist(artistId);

        return { songs };
      },
    );
  });
}
