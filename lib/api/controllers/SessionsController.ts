import { FastifyPluginAsync } from 'fastify';

import { RevokeSessionRequestDto, UserSessionsResponseDto } from '@/common';
import RevokeSessionSchema from '@/schemas/revokeSession.json';
import { SessionsService } from '@/services/SessionsService';

type Injects = {
  sessionsService: SessionsService;
};

export function createSessionsController({
  sessionsService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.get(
      '/',
      { preHandler: server.auth([server.verifyAuth]) },
      async ({
        currentUser,
        currentSessionId,
      }): Promise<UserSessionsResponseDto> => {
        const sessions = await sessionsService.findByUserId(currentUser.id);

        return {
          sessions,
          currentSessionId,
        };
      },
    );

    server.delete<{ Params: { id: string }; Body: RevokeSessionRequestDto }>(
      '/:id',
      {
        schema: RevokeSessionSchema,
        preHandler: server.auth([server.verifyAuth, server.verifyPassword], {
          relation: 'and',
        }),
      },
      async ({ params: { id } }, reply) => {
        await sessionsService.deleteById(id);

        return reply.status(204).send();
      },
    );
  };
}
