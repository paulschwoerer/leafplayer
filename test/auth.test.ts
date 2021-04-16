import 'module-alias/register';
import anyTest, { TestInterface } from 'ava';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import {
  createServerAndInsertTestUserAndLogin,
  createServerFromTestContext,
  extractSessionTokenFromCookie,
  insertValidTestUser,
  waitFor,
} from './testHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

test('Login -> When sending invalid credentials, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'test1',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 401);
});

test('Login -> When sending valid credentials, expect the logged in user', async t => {
  const server = await createServerFromTestContext(t);
  const userId = await insertValidTestUser(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'validPa$$word',
    },
  });

  t.is(response.statusCode, 200);

  const sessionToken = extractSessionTokenFromCookie(response);
  t.is(typeof sessionToken, 'string');

  const json = response.json();
  t.is(typeof json.artworkToken, 'string');
  t.deepEqual(json.user, {
    id: userId,
    username: 'admin',
    displayName: 'Admin',
  });
});

test('Login -> When sending invalid credentials, expect the same error message when providing an invalid user and when providing only an invalid password', async t => {
  const server = await createServerFromTestContext(t);
  await insertValidTestUser(t);

  const firstResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'invalidPa$$word',
    },
  });

  const secondResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'invalidUser',
      password: 'validPa$$word',
    },
  });

  t.is(firstResponse.statusCode, 401);
  t.truthy(firstResponse.json());

  t.is(secondResponse.statusCode, 401);

  t.deepEqual(firstResponse.json(), secondResponse.json());
});

test('Login -> Usernames should be case-insensitive', async t => {
  const server = await createServerFromTestContext(t);
  await insertValidTestUser(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'Admin',
      password: 'validPa$$word',
    },
  });

  t.is(response.statusCode, 200);
});

test('Current user -> Without logging in, expect an error', async t => {
  const server = await createServerFromTestContext(t);
  await insertValidTestUser(t);

  const response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
  });

  t.is(response.statusCode, 401);
});

test('Current user -> With an empty session cookie, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: '',
    },
  });

  t.is(response.statusCode, 401);
});

test('Current user -> With an invalid session cookie, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    headers: {
      Cookie:
        'id=iKrzgqDoxhiv0KGzbOHudAqh36zVSOLK.Xx05m+jzeVDRBr03HykdsbLGDgX8jYT3KK3Iq/q6IEY',
    },
  });

  t.is(response.statusCode, 401);
});

test('Current user -> After logging in, when requesting the current user, expect the user', async t => {
  const {
    sessionToken,
    server,
    userId,
  } = await createServerAndInsertTestUserAndLogin(t);

  const response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response.statusCode, 200);
  const json = response.json();
  t.is(typeof json.artworkToken, 'string');
  t.deepEqual(json.user, {
    id: userId,
    username: 'admin',
    displayName: 'Admin',
  });
});

test('Current user -> After waiting for the session max age, when requesting the current user, expect an error', async t => {
  t.context.config.security.sessionMaxAge = 0;

  const { sessionToken, server } = await createServerAndInsertTestUserAndLogin(
    t,
  );

  await waitFor(1000);

  const response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response.statusCode, 401);
});

test('Logout -> After logging out, when requesting the current user, expect an error', async t => {
  const { sessionToken, server } = await createServerAndInsertTestUserAndLogin(
    t,
  );

  const response1 = await server.inject({
    method: 'POST',
    url: '/api/auth/logout',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response1.statusCode, 204);

  const response2 = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response2.statusCode, 401);
});

test('Sessions -> After logging in, when retrieving the current users sessions, expect only the current session to be included', async t => {
  const { sessionToken, server } = await createServerAndInsertTestUserAndLogin(
    t,
  );

  const response = await server.inject({
    method: 'GET',
    url: '/api/sessions',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response.statusCode, 200);
  const json = response.json();
  t.is(json.sessions.length, 1);
});
