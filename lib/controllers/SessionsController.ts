import { RevokeSessionRequestDto, UserSessionsResponseDto } from '@common';
import { SessionsService } from '@services/SessionsService';
import { FastifyPluginAsync } from 'fastify';
import {
  sendNotAuthorizedError,
  sendNotFoundError,
} from '../helpers/responses';
import RevokeSessionSchema from '../schemas/revokeSession.json';

type Injects = {
  sessionsService: SessionsService;
};

export function SessionsController({
  sessionsService: sessionsService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get(
      '/',
      async (request): Promise<UserSessionsResponseDto> => {
        const currentSessionId = request.auth.getSessionId();
        const sessions = await sessionsService.findAllByUserId(
          request.auth.getUserId(),
        );

        return {
          sessions: sessions.map(({ id, os, browser, lastUsedAt }) => ({
            id,
            os,
            browser,
            lastUsedAt,
          })),
          currentSessionId,
        };
      },
    );

    router.delete<{ Params: { id: string }; Body: RevokeSessionRequestDto }>(
      '/:id',
      {
        schema: RevokeSessionSchema,
      },
      async (request, reply) => {
        const { id } = request.params;
        const { password } = request.body;
        const userId = request.auth.getUserId();

        if (!request.auth.isValidPassword(password)) {
          return sendNotAuthorizedError(reply, 'Invalid password given');
        }

        const session = await sessionsService.findByIdAndUserId({
          id,
          userId,
        });

        if (!session) {
          return sendNotFoundError(reply);
        }

        await sessionsService.deleteById(id);

        return reply.status(204).send();
      },
    );
  };
}
