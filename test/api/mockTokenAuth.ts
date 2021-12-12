import { FastifyPluginAsync } from 'fastify';
import fastifyAuth, { FastifyAuthFunction } from 'fastify-auth';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyTokenAuth: FastifyAuthFunction;
  }
}

export function mockTokenAuth(): FastifyPluginAsync {
  return fp(async function (server) {
    await server.register(fastifyAuth);

    server.decorate<FastifyAuthFunction>(
      'verifyTokenAuth',
      (request, reply, done) => {
        done();
      },
    );
  });
}
