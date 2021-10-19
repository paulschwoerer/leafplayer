import anyTest, { ExecutionContext, TestInterface } from 'ava';
import uid from 'uid-safe';
import { getCurrentUnixTimestamp } from '@/helpers/time';
import { generateUuid } from '@/helpers/uuid';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import { createServerAndInsertTestUserAndLogin } from './testHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

test('when requesting to revoke a valid session with an invalid password, expect an error response', async t => {
  const {
    server,
    sessionToken,
    userId,
  } = await createServerAndInsertTestUserAndLogin(t);

  const sessionIdToDelete = await insertValidSession(t, userId);

  const response = await server.inject({
    method: 'DELETE',
    url: `/api/sessions/${sessionIdToDelete}`,
    payload: {
      password: 'invalidPassword',
    },
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response.statusCode, 401);
});

test('when requesting to revoke a valid session, expect a success response', async t => {
  const {
    server,
    sessionToken,
    userId,
  } = await createServerAndInsertTestUserAndLogin(t);

  const sessionIdToDelete = await insertValidSession(t, userId);

  const response = await server.inject({
    method: 'DELETE',
    url: `/api/sessions/${sessionIdToDelete}`,
    payload: {
      password: 'validPa$$word',
    },
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  t.is(response.statusCode, 204);

  const sessionsResponse = await server.inject({
    method: 'GET',
    url: '/api/sessions',
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  const sessions = (await sessionsResponse.json()).sessions;

  t.is(sessions.length, 1);
});

async function insertValidSession(
  t: ExecutionContext<TestContext>,
  userId: string,
): Promise<string> {
  const id = generateUuid();

  await t.context.db('sessions').insert({
    id,
    token: uid.sync(24),
    browser: 'Firefox',
    os: 'Linux',
    expiresAt: getCurrentUnixTimestamp() + 3600,
    userId,
    lastUsedAt: 0,
  });

  return id;
}
