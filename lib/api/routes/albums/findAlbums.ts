import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { withTimestamps } from '../../../helpers/sort.ts';
import { AlbumsService } from '../../../services/AlbumsService.ts';
import { getSortParam } from '../../sort.ts';

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
      { schema },
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
