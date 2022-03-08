import fastify, { FastifyInstance } from 'fastify';
import anyTest, { TestFn } from 'ava';
import fastifyAuth from 'fastify-auth';

import { errorHandler } from '~/api/errorHandler';

const test = anyTest as TestFn<{
  server: FastifyInstance;
}>;

test.beforeEach(async t => {
  t.context.server = await createTestServer();
});
test.afterEach(async t => {
  await t.context.server.close();
});

async function createTestServer(): Promise<FastifyInstance> {
  const server = fastify({ logger: process.env.TEST_DEBUG === 'true' });

  server.setErrorHandler(errorHandler);

  await server.register(fastifyAuth);

  return server;
}

export default test;
