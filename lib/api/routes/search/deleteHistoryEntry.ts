import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { type SearchHistoryService } from '../../../services/SearchHistoryService.ts';

type Injects = {
  searchHistoryService: SearchHistoryService;
};

export function deleteSearchHistoryEntry({
  searchHistoryService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.delete<{ Params: { entryId: string } }>(
      '/search/history/:entryId',
      async ({ params, currentUser }, reply): Promise<void> => {
        searchHistoryService.deleteEntry({
          userId: currentUser.id,
          id: params.entryId,
        });

        return reply.status(204).send();
      },
    );
  });
}
