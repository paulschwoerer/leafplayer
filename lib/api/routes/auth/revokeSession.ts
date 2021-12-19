import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SessionsService } from '@/services/SessionsService';
import { RevokeSessionRequestDto } from '@/common';

type Injects = {
  sessionsService: SessionsService;
};

const schema = {
  body: {
    type: 'object',
    properties: {
      currentPassword: {
        type: 'string',
      },
    },
    required: ['currentPassword'],
  },
};

export function revokeSession({
  sessionsService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.delete<{ Params: { id: string }; Body: RevokeSessionRequestDto }>(
      '/auth/sessions/:id',
      {
        schema,
        preHandler: server.auth([server.verifySession, server.verifyPassword], {
          relation: 'and',
        }),
      },
      async ({ params: { id } }, reply) => {
        await sessionsService.deleteById(id);

        return reply.status(204).send();
      },
    );
  });
}
