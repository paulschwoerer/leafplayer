import td from 'testdouble';
import { FastifyInstance } from 'fastify';

import { createSessionAuthPlugin } from '@/api/plugins/sessionAuth';
import { AuthService } from '@/services/AuthService';

import {
  MOCK_USER,
  MOCK_SESSION_ID,
  MOCK_SESSION_TOKEN,
} from '../../testdata/mocks';
import test from '../setupTestServer';

async function setup(server: FastifyInstance): Promise<{
  authService: AuthService;
}> {
  const authService = td.object<AuthService>();

  await server.register(
    createSessionAuthPlugin({
      authService,
    }),
  );

  return { authService };
}

test('auth endpoint should reject a request without session token', async t => {
  const { server } = t.context;
  await setup(server);

  server.get(
    '/auth',
    { preHandler: server.auth([server.verifySession]) },
    async (_, reply) => {
      return reply.send('hello world');
    },
  );

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/auth',
  });

  t.is(response.statusCode, 401);
});

test('auth endpoint should reject a request with an invalid session token', async t => {
  const { server } = t.context;
  await setup(server);

  server.get(
    '/auth',
    { preHandler: server.auth([server.verifySession]) },
    async (_, reply) => {
      return reply.send('hello world');
    },
  );

  const response = await server.inject({
    method: 'GET',
    path: '/auth',
    cookies: {
      id: 'notASessionToken',
    },
  });

  t.is(response.statusCode, 401);
});

test('auth endpoint should register user when authenticated', async t => {
  const { server } = t.context;
  const { authService } = await setup(server);

  td.when(authService.authenticate(MOCK_SESSION_TOKEN)).thenResolve({
    id: MOCK_SESSION_ID,
    user: MOCK_USER,
  });

  t.plan(4);

  server.get(
    '/auth',
    { preHandler: server.auth([server.verifySession]) },
    async (request, reply) => {
      t.is(request.currentSessionId, MOCK_SESSION_ID);
      t.deepEqual(request.currentUser, MOCK_USER);

      return reply.send('hello world');
    },
  );

  const response = await server.inject({
    method: 'GET',
    path: '/auth',
    cookies: {
      id: MOCK_SESSION_TOKEN,
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.body, 'hello world');
});

test('no-auth endpoint should accept an unauthenticated request', async t => {
  const { server } = t.context;
  await setup(server);

  server.get('/no-auth', async (_, reply) => {
    return reply.send('hello world');
  });

  const response = await server.inject({
    method: 'GET',
    path: '/no-auth',
  });

  t.is(response.statusCode, 200);
  t.is(response.body, 'hello world');
});
