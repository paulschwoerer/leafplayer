import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { FastifyAuthFunction } from 'fastify-auth';

import { NotAuthorizedError } from '~/errors/NotAuthorizedError';
import { UsersService } from '~/services/UsersService';

declare module 'fastify' {
  interface FastifyInstance {
    verifyPassword: FastifyAuthFunction;
  }
}

type Injects = {
  usersService: UsersService;
};

export function createVerifyPasswordPlugin({
  usersService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.decorate(
      'verifyPassword',
      async ({
        currentUser,
        body: { currentPassword },
      }: FastifyRequest<{ Body: { currentPassword: string } }>) => {
        const isCorrect = await usersService.isCorrectPassword({
          userId: currentUser.id,
          password: currentPassword,
        });

        if (!isCorrect) {
          throw new NotAuthorizedError('Invalid password given');
        }
      },
    );
  });
}
