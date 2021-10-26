import anyTest, { TestInterface } from 'ava';
import { FastifyInstance } from 'fastify';

import { createTokenAuthMiddleware } from '@/middlewares/TokenAuthMiddleware';

import { createMinimalServer } from '../testHelpers';

const test = anyTest as TestInterface<{
  server: FastifyInstance;
}>;

function createServer() {
  const server = createMinimalServer();

  server.get('/', async (request, reply) => {
    return reply.send('hello world');
  });

  return server;
}

test.beforeEach(t => {
  t.context.server = createServer();
});
test.afterEach(async t => t.context.server.close());

test('when omiting token, expect an error', async t => {
  const { server } = t.context;

  server.addHook(
    'preValidation',
    createTokenAuthMiddleware({
      isValidJwtToken: () => false,
    }),
  );

  const response = await server.inject({
    method: 'GET',
    url: '/',
  });

  t.is(response.statusCode, 400);
});

test('when supplying empty token, expect an error', async t => {
  const { server } = t.context;

  server.addHook(
    'preValidation',
    createTokenAuthMiddleware({
      isValidJwtToken: () => false,
    }),
  );

  const response = await server.inject({
    method: 'GET',
    url: '/?token=',
  });

  t.is(response.statusCode, 400);
});

test('when token validation fails, expect an error', async t => {
  const { server } = t.context;

  server.addHook(
    'preValidation',
    createTokenAuthMiddleware({
      isValidJwtToken: () => false,
    }),
  );

  const response = await server.inject({
    method: 'GET',
    url: `/?token=eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEb25hbGQgRHVjayJ9.KTJ8DbEQk5nLNZs6tyE4XYv7sNmUxf3U4tFSgIPaXB0`,
  });

  t.is(response.statusCode, 401);
});

test('when token validation succeeds, expect authentication to succeed', async t => {
  const { server } = t.context;

  server.addHook(
    'preValidation',
    createTokenAuthMiddleware({
      isValidJwtToken: () => true,
    }),
  );

  const response = await server.inject({
    method: 'GET',
    url: `/?token=eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEb25hbGQgRHVjayJ9.KTJ8DbEQk5nLNZs6tyE4XYv7sNmUxf3U4tFSgIPaXB0`,
  });

  t.is(response.statusCode, 200);
});
