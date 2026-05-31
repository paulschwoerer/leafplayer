import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { withTimestamps } from '@/helpers/sort';
import { AlbumsService } from '@/services/AlbumsService';
import { getSortParam } from '@/api/sort';

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
        preHandler: server.verifySession,
      },
      async request => {
        const sort = getSortParam(
          request.query,
          withTimestamps('name', 'year'),
        );
        const albums = albumsService.find(sort);

        return { albums };
      },
    );
  });
}
