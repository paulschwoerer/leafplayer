import { FastifyPluginAsync } from 'fastify';
import {
  RevokeSessionRequestDto,
  UserSession,
  UserSessionsResponseDto,
} from '@common';
import RevokeSessionSchema from '../schemas/revokeSession.json';

interface SessionsService {
  findByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<UserSession | undefined>;
  findAllByUserId(userId: string): Promise<UserSession[]>;
  deleteById(id: string): Promise<Error | undefined>;
}

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
          return reply.status(401).send();
        }

        const session = await sessionsService.findByIdAndUserId({
          id,
          userId,
        });

        if (!session) {
          return reply.status(404).send();
        }

        await sessionsService.deleteById(id);

        return reply.status(204).send();
      },
    );
  };
}
