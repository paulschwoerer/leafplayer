import fastify, { FastifyInstance } from 'fastify';
import anyTest, { TestInterface } from 'ava';

import { errorHandler } from '@/api/errorHandler';

const test = anyTest as TestInterface<{
  server: FastifyInstance;
}>;

test.beforeEach(t => {
  t.context.server = createTestServer();
});
test.afterEach(async t => {
  await t.context.server.close();
});

function createTestServer(): FastifyInstance {
  const server = fastify({ logger: process.env.TEST_DEBUG === 'true' });

  server.setErrorHandler(errorHandler);

  return server;
}

export default test;
