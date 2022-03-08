import td from 'testdouble';

import { login } from '~/api/routes/auth/login';
import { LeafplayerConfig } from '~/config';
import { NotAuthorizedError } from '~/errors/NotAuthorizedError';
import { AuthService } from '~/services/AuthService';
import { JwtService } from '~/services/JwtService';

import test from '../../setupTestServer';
import { MOCK_SESSION_TOKEN, MOCK_USER } from '../../../testdata/mocks';

const MOCK_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

test('login endpoint should send an unauthorized error when providing invalid credentials', async t => {
  const config = td.object<LeafplayerConfig>();
  const authService = td.object<AuthService>();
  const jwtService = td.object<JwtService>();
  td.when(
    authService.login(
      {
        username: 'testuser',
        password: 'supersecret',
      },
      td.matchers.anything(),
    ),
  ).thenReject(new NotAuthorizedError('invalid credentials'));

  const { server } = t.context;
  await server.register(login({ config, authService, jwtService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/login',
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
  const config = td.object<LeafplayerConfig>();
  const authService = td.object<AuthService>();
  const jwtService = td.object<JwtService>();
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

  const { server } = t.context;
  await server.register(login({ config, authService, jwtService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/login',
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

test('login endpoint should set the session cookie correctly when asking to stay logged in', async t => {
  const config = td.object<LeafplayerConfig>();
  const authService = td.object<AuthService>();
  const jwtService = td.object<JwtService>();
  config.security.sessionMaxAge = 3600;
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

  const { server } = t.context;
  await server.register(login({ config, authService, jwtService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/login',
    payload: {
      username: 'testuser',
      password: 'supersecret',
      stayLoggedIn: true,
    },
  });

  const body = response.json();
  t.is(response.statusCode, 200);
  t.is(
    response.headers['set-cookie'],
    `id=${MOCK_SESSION_TOKEN}; SameSite=Lax; HttpOnly; Path=/api; Max-Age=3600`,
  );
  t.deepEqual(body.user, MOCK_USER);
  t.is(body.artworkToken, MOCK_JWT_TOKEN);
});
