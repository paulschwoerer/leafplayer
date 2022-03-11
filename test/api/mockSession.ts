import { FastifyAuthFunction } from 'fastify-auth';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { User } from '@/common';

declare module 'fastify' {
  interface FastifyInstance {
    verifySession: FastifyAuthFunction;
  }

  interface FastifyRequest {
    currentSessionId: string;
    currentUser: User;
  }
}

export function mockSession(sessionId: string, user: User): FastifyPluginAsync {
  return fp(async server => {
    server.decorateRequest('currentSessionId', '');
    server.decorateRequest('currentUser', null);

    server.decorate<FastifyAuthFunction>('verifySession', async request => {
      request.currentSessionId = sessionId;
      request.currentUser = user;
    });
  });
}
