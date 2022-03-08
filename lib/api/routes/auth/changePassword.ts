import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ChangePasswordRequestDto } from '~/common';
import { AuthService } from '~/services/AuthService';

type Injects = {
  authService: AuthService;
};

const schema = {
  body: {
    type: 'object',
    properties: {
      currentPassword: {
        type: 'string',
      },
      newPassword: {
        type: 'string',
      },
    },
    required: ['currentPassword', 'newPassword'],
  },
};

export function changePassword({ authService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: ChangePasswordRequestDto }>(
      '/auth/password',
      {
        preHandler: server.auth([server.verifySession, server.verifyPassword], {
          relation: 'and',
        }),
        schema,
      },
      async (
        { currentUser, currentSessionId, body: { newPassword } },
        reply,
      ) => {
        await authService.changePassword({
          userId: currentUser.id,
          activeSessionId: currentSessionId,
          newPassword,
        });

        return reply.status(204).send();
      },
    );
  });
}
