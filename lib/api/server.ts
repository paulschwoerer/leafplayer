import path from 'path';

import { AwilixContainer } from 'awilix';
import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from 'fastify-static';

import { initApi } from './api';

export async function initServer(
  container: AwilixContainer,
): Promise<FastifyInstance> {
  const server = fastify({ logger: false });

  await server.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
  });

  server.setNotFoundHandler(async (_, reply) => {
    await reply.sendFile('index.html');
  });

  await server.register(initApi(container), {
    prefix: '/api',
  });

  return server;
}
