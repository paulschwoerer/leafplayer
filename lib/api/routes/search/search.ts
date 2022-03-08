import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SearchResponseDto } from '~/common';
import { SearchService } from '~/services/SearchService';

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
      { schema, preHandler: server.auth([server.verifySession]) },
      async (request): Promise<SearchResponseDto> => {
        const { q } = request.query;

        const results = await searchService.search(q);

        return {
          results,
        };
      },
    );
  });
}
