import { SearchResponseDto } from '@common';
import { FastifyPluginAsync } from 'fastify';
import { SearchService } from '../services/SearchService';

type Injects = {
  searchService: SearchService;
};

export function SearchController({
  searchService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get<{ Querystring: { q: string } }>(
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
