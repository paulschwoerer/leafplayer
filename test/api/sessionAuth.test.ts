import td from 'testdouble';

import { verifySession } from '../../lib/api/sessionAuth.ts';
import { type AuthService } from '../../lib/services/AuthService.ts';
import { NotAuthorizedError } from '../../lib/errors/NotAuthorizedError.ts';
import {
  MOCK_USER,
  MOCK_SESSION_ID,
  MOCK_SESSION_TOKEN,
} from '../testdata/mocks.ts';

import test from './setupTestServer.ts';

test('auth endpoint should reject a request without session token', async t => {
  const { server } = t.context;
  const authService = td.object<AuthService>();

  server.get(
    '/auth',
    { preHandler: verifySession(authService) },
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
  const authService = td.object<AuthService>();

  td.when(authService.authenticate('notASessionToken')).thenThrow(
    new NotAuthorizedError(),
  );

  server.get(
    '/auth',
    { preHandler: verifySession(authService) },
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
  const authService = td.object<AuthService>();

  td.when(authService.authenticate(MOCK_SESSION_TOKEN)).thenReturn({
    id: MOCK_SESSION_ID,
    user: MOCK_USER,
  });

  t.plan(4);

  server.get(
    '/auth',
    { preHandler: verifySession(authService) },
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
