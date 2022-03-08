import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { UserSessionsResponseDto } from '~/common';
import { SessionsService } from '~/services/SessionsService';

type Injects = {
  sessionsService: SessionsService;
};

export function getSessions({ sessionsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/auth/sessions',
      { preHandler: server.auth([server.verifySession]) },
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
  });
}
