import { FastifyInstance } from 'fastify';
import td from 'testdouble';

import { createAuthController } from '@/api/controllers/AuthController';
import { UserResponseDto } from '@/common';
import { LeafplayerConfig } from '@/config';
import { AuthService } from '@/services/AuthService';
import { JwtService } from '@/services/JwtService';
import { NotAuthorizedError } from '@/errors/NotAuthorizedError';

import {
  MOCK_USER,
  MOCK_SESSION_ID,
  MOCK_SESSION_TOKEN,
} from '../../testdata/mocks';
import test from '../setupTestServer';
import { mockAuth } from '../mockAuth';
import { mockVerifyPassword } from '../mockVerifyPassword';

const MOCK_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

async function setup(server: FastifyInstance): Promise<{
  authService: AuthService;
  jwtService: JwtService;
}> {
  const authService = td.object<AuthService>();
  const jwtService = td.object<JwtService>();

  await server.register(mockAuth(MOCK_SESSION_ID, MOCK_USER));
  await server.register(mockVerifyPassword());
  await server.register(
    createAuthController({
      authService,
      jwtService,
      config: td.object<LeafplayerConfig>(),
    }),
  );

  return { authService, jwtService };
}

test('user endpoint should return the current user', async t => {
  const { jwtService } = await setup(t.context.server);

  td.when(jwtService.makeJwtToken()).thenReturn(MOCK_JWT_TOKEN);

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/user',
    cookies: {
      id: MOCK_SESSION_TOKEN,
    },
  });

  const body = response.json<UserResponseDto>();
  t.is(response.statusCode, 200);
  t.deepEqual(body.user, MOCK_USER);
  t.is(body.artworkToken, MOCK_JWT_TOKEN);
});

test('login endpoint should send an unauthorized error when providing invalid credentials', async t => {
  const { authService } = await setup(t.context.server);

  td.when(
    authService.login(
      {
        username: 'testuser',
        password: 'supersecret',
      },
      td.matchers.anything(),
    ),
  ).thenReject(new NotAuthorizedError('invalid credentials'));

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/login',
    payload: {
      username: 'testuser',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 401);
  t.deepEqual(response.json(), {
    statusCode: 401,
    error: 'Unauthorized',
    message: 'invalid credentials',
  });
});

test('login endpoint should send the user and tokens when providing valid credentials', async t => {
  const { authService, jwtService } = await setup(t.context.server);

  td.when(
    authService.login(
      {
        username: 'testuser',
        password: 'supersecret',
      },
      td.matchers.anything(),
    ),
  ).thenResolve({
    user: MOCK_USER,
    sessionToken: MOCK_SESSION_TOKEN,
  });
  td.when(jwtService.makeJwtToken()).thenReturn(MOCK_JWT_TOKEN);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/login',
    payload: {
      username: 'testuser',
      password: 'supersecret',
    },
  });

  const body = response.json();
  t.is(response.statusCode, 200);
  t.is(
    response.headers['set-cookie'],
    `id=${MOCK_SESSION_TOKEN}; SameSite=Lax; HttpOnly; Path=/api`,
  );
  t.deepEqual(body.user, MOCK_USER);
  t.is(body.artworkToken, MOCK_JWT_TOKEN);
});

test('logout endpoint should set logout cookie', async t => {
  const { authService } = await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/logout',
    cookies: {
      id: MOCK_SESSION_TOKEN,
    },
  });

  t.is(response.statusCode, 204);
  t.is(response.headers['set-cookie'], 'id=; Expires=01 Jan 1970');
  t.notThrows(() => {
    td.verify(authService.logout(MOCK_SESSION_ID));
  });
});

test('password endpoint should call service', async t => {
  const { authService } = await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'POST',
    path: '/password',
    payload: {
      currentPassword: 'supersecret',
      newPassword: 'timeforachange',
    },
  });

  t.is(response.statusCode, 204);
  t.notThrows(() => {
    td.verify(
      authService.changePassword({
        userId: MOCK_USER.id,
        activeSessionId: MOCK_SESSION_ID,
        newPassword: 'timeforachange',
      }),
    );
  });
});
