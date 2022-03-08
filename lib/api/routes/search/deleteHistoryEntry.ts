import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SearchHistoryService } from '~/services/SearchHistoryService';

type Injects = {
  searchHistoryService: SearchHistoryService;
};

export function deleteSearchHistoryEntry({
  searchHistoryService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.delete<{ Params: { entryId: string } }>(
      '/search/history/:entryId',
      { preHandler: server.auth([server.verifySession]) },
      async ({ params, currentUser }, reply): Promise<void> => {
        await searchHistoryService.deleteEntry({
          userId: currentUser.id,
          id: params.entryId,
        });

        return reply.send(204);
      },
    );
  });
}
