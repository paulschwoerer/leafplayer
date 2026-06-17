import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SongsResponseDto } from 'leafplayer-common';

import { ArtistsService } from '../../../services/ArtistsService.ts';

type Injects = {
  artistsService: ArtistsService;
};

export function getArtistSongs({
  artistsService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { artistId: string } }>(
      '/artists/:artistId/songs',
      async (request): Promise<SongsResponseDto> => {
        const { artistId } = request.params;

        const songs = artistsService.findAllSongsByArtist(artistId);

        return { songs };
      },
    );
  });
}
