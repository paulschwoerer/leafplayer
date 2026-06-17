import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SearchResponseDto } from 'leafplayer-common';

import { SearchService } from '../../../services/SearchService.ts';

type Injects = {
  searchService: SearchService;
};

const schema = {
  querystring: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
      },
    },
    required: ['q'],
  },
};

export function search({ searchService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Querystring: { q: string } }>(
      '/search',
      { schema },
      async (request): Promise<SearchResponseDto> => {
        const { q } = request.query;

        const results = searchService.search(q);

        return {
          results,
        };
      },
    );
  });
}
