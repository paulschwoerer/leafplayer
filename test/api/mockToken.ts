import { FastifyPluginAsync } from 'fastify';
import { FastifyAuthFunction } from 'fastify-auth';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyToken: FastifyAuthFunction;
  }
}

export function mockToken(): FastifyPluginAsync {
  return fp(async function (server) {
    server.decorate<FastifyAuthFunction>(
      'verifyToken',
      (request, reply, done) => {
        done();
      },
    );
  });
}
