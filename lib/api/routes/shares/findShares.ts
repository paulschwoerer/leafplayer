import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { FindSharesResponseDto } from '@/common';
import { SharesService } from '@/services/SharesService';

type Injects = {
  sharesService: SharesService;
};

export function findShares({ sharesService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/shares',
      { preHandler: server.auth([server.verifySession]) },
      async ({ currentUser }): Promise<FindSharesResponseDto> => {
        const shares = await sharesService.find(currentUser.id);

        return {
          shares,
        };
      },
    );
  });
}
