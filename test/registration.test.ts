import 'module-alias/register';
import anyTest, { ExecutionContext, TestInterface } from 'ava';
import { getCurrentUnixTimestamp } from '../lib/helpers/time';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import {
  createServerFromTestContext,
  insertValidTestUser,
} from './testHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

function insertInviteCode(
  t: ExecutionContext<TestContext>,
  code: string,
  expiresAt?: number,
): Promise<void> {
  return t.context.db('invitations').insert({
    code,
    expiresAt:
      expiresAt ||
      getCurrentUnixTimestamp() + t.context.config.security.invitationMaxAge,
  });
}

test('Registration -> When sending an invalid invite code, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'invalid',
      username: 'test',
      password: 'test1234',
    },
  });

  t.is(response.statusCode, 400);
});

test('Registration -> When sending no invite code, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      username: 'test',
      password: 'test',
    },
  });

  t.is(response.statusCode, 400);
});

test('Registration -> When trying to use an existing username, expect an error', async t => {
  const server = await createServerFromTestContext(t);
  await insertValidTestUser(t);
  await insertInviteCode(t, 'test123');

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'admin',
      password: 'test1234',
    },
  });

  t.is(response.statusCode, 400);
});

test('Registration -> When trying to use an existing username (case-insensitive), expect an error', async t => {
  const server = await createServerFromTestContext(t);
  await insertValidTestUser(t);
  await insertInviteCode(t, 'test123');

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'Admin',
      password: 'test1234',
    },
  });

  t.is(response.statusCode, 400);
});

test('Registration -> When supplying a valid invite code expect an account to be created and that invite code to be invalid afterwards', async t => {
  const server = await createServerFromTestContext(t);
  await insertInviteCode(t, 'test123');

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'admin',
      password: 'test1234',
    },
  });

  t.is(response.statusCode, 201);

  const response2 = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'admin',
      password: 'test1234',
    },
  });

  t.is(response2.statusCode, 400);
});

test('Registration -> When supplying a valid invite code but a short password expect an error', async t => {
  const server = await createServerFromTestContext(t);
  await insertInviteCode(t, 'test123');

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'admin',
      password: '1234',
    },
  });

  t.is(response.statusCode, 400);
});

test('Registration -> When supplying an exoired invite code expect an error', async t => {
  const server = await createServerFromTestContext(t);
  await insertInviteCode(t, 'test123', getCurrentUnixTimestamp() - 1);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'test123',
      username: 'admin',
      password: 'test1234',
    },
  });

  t.is(response.statusCode, 400);
});
