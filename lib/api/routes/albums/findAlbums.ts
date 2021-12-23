import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { withTimestamps } from '@/helpers/sort';
import { AlbumsService } from '@/services/AlbumsService';

type Injects = {
  albumsService: AlbumsService;
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

export function findAlbums({ albumsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Querystring: { sort?: string } }>(
      '/albums',
      {
        schema,
        preHandler: [
          server.auth([server.verifySession]),
          server.sortParam(withTimestamps('name', 'year')),
        ],
      },
      async request => {
        const albums = await albumsService.find(request.sort);

        return { albums };
      },
    );
  });
}
