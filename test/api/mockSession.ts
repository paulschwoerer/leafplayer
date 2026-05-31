import {
  preHandlerAsyncHookHandler,
  FastifyPluginAsync,
  FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';

import { User } from '@/common';

declare module 'fastify' {
  interface FastifyInstance {
    verifySession: preHandlerAsyncHookHandler;
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

    server.decorate('verifySession', async (request: FastifyRequest) => {
      request.currentSessionId = sessionId;
      request.currentUser = user;
    });
  });
}
