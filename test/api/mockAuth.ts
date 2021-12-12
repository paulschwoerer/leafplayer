import fastifyAuth, { FastifyAuthFunction } from 'fastify-auth';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { User } from '@/common';

declare module 'fastify' {
  interface FastifyInstance {
    verifyAuth: FastifyAuthFunction;
  }

  interface FastifyRequest {
    currentSessionId: string;
    currentUser: User;
  }
}

export function mockAuth(sessionId: string, user: User): FastifyPluginAsync {
  return fp(async server => {
    server.decorateRequest('currentSessionId', '');
    server.decorateRequest('currentUser', null);

    await server.register(fastifyAuth);

    server.decorate<FastifyAuthFunction>('verifyAuth', async request => {
      request.currentSessionId = sessionId;
      request.currentUser = user;
    });
  });
}
