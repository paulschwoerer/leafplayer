import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type UserSessionsResponseDto } from 'leafplayer-common';

import { type SessionsService } from '../../../services/SessionsService.ts';

type Injects = {
  sessionsService: SessionsService;
};

export function getSessions({ sessionsService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/auth/sessions',
      async ({
        currentUser,
        currentSessionId,
      }): Promise<UserSessionsResponseDto> => {
        const sessions = sessionsService.findByUserId(currentUser.id);

        return {
          sessions,
          currentSessionId,
        };
      },
    );
  });
}
