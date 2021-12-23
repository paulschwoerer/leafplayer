import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AuthService } from '@/services/AuthService';

type Injects = {
  authService: AuthService;
};

export function logout({ authService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post(
      '/auth/logout',
      { preHandler: server.auth([server.verifySession]) },
      async ({ currentSessionId }, reply) => {
        await authService.logout(currentSessionId);

        return reply
          .status(204)
          .header('Set-Cookie', bakeLogoutCookie())
          .send();
      },
    );
  });
}

function bakeLogoutCookie(): string {
  return `id=; Expires=01 Jan 1970`;
}
