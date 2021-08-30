import { UserSessionsResponseDto } from '@common';
import anyTest, { TestInterface } from 'ava';
import 'module-alias/register';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import { createServerAndInsertTestUserAndLogin } from './testHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

test('when requesting user sessions, do not return session tokens', async t => {
  const { server, sessionToken } = await createServerAndInsertTestUserAndLogin(
    t,
  );

  const response = await server.inject({
    method: 'GET',
    url: `/api/sessions`,
    headers: {
      Cookie: `id=${sessionToken}`,
    },
  });

  const body = response.json<UserSessionsResponseDto>();

  t.is(response.statusCode, 200);
  t.is(
    'token' in body.sessions[0],
    false,
    'expected token to not be included in session response',
  );
});
