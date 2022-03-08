import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ArtistsResponseDto } from 'common/dtos';

import { ArtistsService } from '~/services/ArtistsService';
import { withTimestamps } from '~/helpers/sort';

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
      {
        schema,
        preHandler: [
          server.auth([server.verifySession]),
          server.sortParam(withTimestamps('name', 'year')),
        ],
      },
      async (request): Promise<ArtistsResponseDto> => {
        const artists = await artistsService.find(request.sort);

        return { artists };
      },
    );
  });
}
