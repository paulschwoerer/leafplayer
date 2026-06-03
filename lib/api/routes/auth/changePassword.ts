import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ChangePasswordRequestDto } from '@/common';
import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { AuthService } from '@/services/AuthService';
import { UsersService } from '@/services/UsersService';

type Injects = {
  authService: AuthService;
  usersService: UsersService;
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

export function changePassword({
  authService,
  usersService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: ChangePasswordRequestDto }>(
      '/auth/password',
      { schema },
      async (
        {
          currentUser,
          currentSessionId,
          body: { currentPassword, newPassword },
        },
        reply,
      ) => {
        const isCurrentPasswordCorrect = usersService.isCorrectPassword({
          userId: currentUser.id,
          password: currentPassword,
        });

        if (!isCurrentPasswordCorrect) {
          throw new NotAuthorizedError('Invalid password given');
        }

        authService.changePassword({
          userId: currentUser.id,
          activeSessionId: currentSessionId,
          newPassword,
        });

        return reply.status(204).send();
      },
    );
  });
}
