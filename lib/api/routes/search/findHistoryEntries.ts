import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type FindSearchHistoryEntriesResponseDto } from 'leafplayer-common';

import { type SearchHistoryService } from '../../../services/SearchHistoryService.ts';

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
