import { createAuthService } from '@/services/AuthService';
import { createSessionsService } from '@/services/SessionsService';
import { createUsersService } from '@/services/UsersService';
import anyTest, { TestInterface } from 'ava';
import Knex from 'knex';
import { LeafplayerConfig } from '../../lib/config';
import {
  comparePasswords,
  createPasswordHash,
} from '../../lib/helpers/passwords';
import { afterEachHook, beforeEachHook, TestContext } from '../testContext';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

function createServiceUnderTest({
  db,
  config,
}: {
  db: Knex;
  config: LeafplayerConfig;
}) {
  const sessionsService = createSessionsService({
    db,
  });

  const usersService = createUsersService({
    db,
  });

  return createAuthService({
    config,
    db,
    sessionsService,
    usersService,
  });
}

const TEST_USER = {
  id: 'e7d6b934-a264-4661-a888-53f3363aefe8',
  username: 'testuser',
  displayName: 'Testuser',
  password: createPasswordHash('supersecret'),
};

test('changeUserPassword -> it should change a users password', async ({
  context: { config, db },
  ...t
}) => {
  await db('users').insert([TEST_USER]);

  const authService = createServiceUnderTest({ db, config });

  await authService.changeUserPassword({
    userId: TEST_USER.id,
    newPassword: 'timeforachange',
    activeSessionId: '',
  });

  const updatedUser = await db('users').where({ id: TEST_USER.id }).first();

  t.true(comparePasswords('timeforachange', updatedUser?.password || ''));
});

test('changeUserPassword -> it should invalidate all sessions except the one issuing the request', async ({
  context: { config, db },
  ...t
}) => {
  await db('users').insert([TEST_USER]);
  await db('sessions').insert([
    {
      id: 'd67f709d-b932-4ca9-a85c-9969d4599197',
      token: 'supersecret1',
      userId: TEST_USER.id,
      lastUsedAt: 0,
      expiresAt: 0,
    },
    {
      id: '91651965-e140-486a-9158-aa8fa17df111',
      token: 'supersecret2',
      userId: TEST_USER.id,
      lastUsedAt: 0,
      expiresAt: 0,
    },
  ]);

  const authService = createServiceUnderTest({ db, config });

  await authService.changeUserPassword({
    userId: TEST_USER.id,
    newPassword: 'timeforachange',
    activeSessionId: 'd67f709d-b932-4ca9-a85c-9969d4599197',
  });

  const sessions = await db('sessions').where(true);

  t.is(sessions.length, 1);
  t.is(sessions[0].id, 'd67f709d-b932-4ca9-a85c-9969d4599197');
});

test('changeUserPassword -> it should reject an insecure password', async ({
  context: { config, db },
  ...t
}) => {
  const authService = createServiceUnderTest({ db, config });

  const maybeError = await authService.changeUserPassword({
    userId: TEST_USER.id,
    newPassword: 'time',
    activeSessionId: '',
  });

  t.true(maybeError instanceof Error);
});
