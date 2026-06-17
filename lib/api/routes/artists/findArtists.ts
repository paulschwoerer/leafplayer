import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type ArtistsResponseDto } from 'leafplayer-common';

import { type ArtistsService } from '../../../services/ArtistsService.ts';
import { getSortParam } from '../../sort.ts';
import { withTimestamps } from '../../../helpers/sort.ts';

type Injects = {
  artistsService: ArtistsService;
};

const schema = {
  querystring: {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
      },
    },
  },
};

export function findArtists({ artistsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Querystring: { sort?: string } }>(
      '/artists',
      { schema },
      async (request): Promise<ArtistsResponseDto> => {
        const sort = getSortParam(request.query, withTimestamps('name'));
        const artists = artistsService.find(sort);

        return { artists };
      },
    );
  });
}
