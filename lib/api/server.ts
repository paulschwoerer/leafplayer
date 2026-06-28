import path from 'path';

import { type AwilixContainer } from 'awilix';
import fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';

import { initApi } from './api.ts';

export async function initServer(
  container: AwilixContainer,
): Promise<FastifyInstance> {
  const server = fastify({ logger: false });

  await server.register(fastifyStatic, {
    root: path.join(import.meta.dirname, '../../public'),
  });

  server.setNotFoundHandler(async (_, reply) => {
    await reply.sendFile('index.html');
  });

  await server.register(initApi(container), {
    prefix: '/api',
  });

  return server;
}
