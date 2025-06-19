import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { FindSharesResponseDto } from '@/common';
import { SharesService } from '@/services/SharesService';

type Injects = {
  sharesService: SharesService;
};

export function findSharesForTypeAndId({
  sharesService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{
      Params: { forType: 'artist' | 'album' | 'song'; forId: string };
    }>(
      '/shares/:forType/:forId',
      { preHandler: server.auth([server.verifySession]) },
      async ({
        currentUser,
        params: { forType, forId },
      }): Promise<FindSharesResponseDto> => {
        // TODO: validate forType ?
        const shares = await sharesService.findForTypeAndId(
          currentUser.id,
          forType,
          forId,
        );

        return {
          shares,
        };
      },
    );
  });
}
