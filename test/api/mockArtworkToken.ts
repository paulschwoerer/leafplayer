import { FastifyPluginAsync } from 'fastify';
import { FastifyAuthFunction } from 'fastify-auth';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyArtworkToken: FastifyAuthFunction;
  }
}

export function mockArtworkToken(): FastifyPluginAsync {
  return fp(async function (server) {
    server.decorate<FastifyAuthFunction>(
      'verifyArtworkToken',
      (request, reply, done) => {
        done();
      },
    );
  });
}
