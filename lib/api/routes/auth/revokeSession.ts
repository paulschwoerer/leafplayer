import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { SessionsService } from '../../../services/SessionsService.ts';

type Injects = {
  sessionsService: SessionsService;
};

export function revokeSession({
  sessionsService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.delete<{ Params: { id: string } }>(
      '/auth/sessions/:id',
      async ({ params: { id } }, reply) => {
        sessionsService.deleteById(id);

        return reply.status(204).send();
      },
    );
  });
}
