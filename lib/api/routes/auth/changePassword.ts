import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { type ChangePasswordRequestDto } from 'leafplayer-common';

import { NotAuthorizedError } from '../../../errors/NotAuthorizedError.ts';
import { type AuthService } from '../../../services/AuthService.ts';
import { type UsersService } from '../../../services/UsersService.ts';

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
