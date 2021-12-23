import { FastifyPluginAsync } from 'fastify';
import { FastifyAuthFunction } from 'fastify-auth';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyPassword: FastifyAuthFunction;
  }
}

export function mockVerifyPassword(): FastifyPluginAsync {
  return fp(async server => {
    server.decorate('verifyPassword', async () => {
      return undefined;
    });
  });
}
