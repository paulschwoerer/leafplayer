import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SharesService } from '@/services/SharesService';

type Injects = {
  sharesService: SharesService;
};

export function deleteShare({ sharesService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.delete<{ Params: { id: string } }>(
      '/shares/:id',
      { preHandler: server.auth([server.verifySession]) },
      async ({ params, currentUser }, reply): Promise<void> => {
        await sharesService.delete({
          userId: currentUser.id,
          id: params.id,
        });

        return reply.status(204).send();
      },
    );
  });
}
