import { FastifyPluginAsync } from 'fastify';

import { SearchResponseDto } from '@/common';
import { SearchService } from '@/services/SearchService';

type Injects = {
  searchService: SearchService;
};

export function createSearchController({
  searchService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.addHook('preHandler', server.auth([server.verifyAuth]));

    server.get<{ Querystring: { q: string } }>(
      '/',
      async (request): Promise<SearchResponseDto> => {
        const { q } = request.query;

        const results = await searchService.search(q);

        return {
          results,
        };
      },
    );
  };
}
