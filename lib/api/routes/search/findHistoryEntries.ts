import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { FindSearchHistoryEntriesResponseDto } from '@/common';
import { SearchHistoryService } from '@/services/SearchHistoryService';

type Injects = {
  searchHistoryService: SearchHistoryService;
};

export function findSearchHistoryEntries({
  searchHistoryService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/search/history',
      async ({ currentUser }): Promise<FindSearchHistoryEntriesResponseDto> => {
        const entries = searchHistoryService.findEntries(currentUser.id);

        return {
          entries,
        };
      },
    );
  });
}
