import { Knex } from 'knex';

import { NotAuthorizedError } from '~/errors/NotAuthorizedError';
import { ValidationError } from '~/errors/ValidationError';
import { comparePasswords, createPasswordHash } from '~/helpers/passwords';
import { getCurrentUnixTimestamp } from '~/helpers/time';
import createAuthService, { AuthService } from '~/services/AuthService';
import createPasswordService from '~/services/PasswordService';
import createSessionsService from '~/services/SessionsService';
import createUsersService from '~/services/UsersService';

import test from '../setupTestDB';
import { createLeafplayerConfig } from '../testHelpers';
import { MOCK_USER } from '../testdata/mocks';

const MOCK_SESSIONS = [
  {
    id: 'd67f709d-b932-4ca9-a85c-9969d4599197',
    token: 'supersecret1',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    expiresAt: getCurrentUnixTimestamp() + 10000,
    browser: 'Firefox',
    os: 'Linux',
  },
  {
    id: '91651965-e140-486a-9158-aa8fa17df111',
    token: 'supersecret2',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    expiresAt: getCurrentUnixTimestamp() + 10000,
    browser: 'Chromium',
    os: 'Linux',
  },
];

function setupService(db: Knex): AuthService {
  const config = createLeafplayerConfig();
  return createAuthService({
    config,
    usersService: createUsersService({ db }),
    sessionsService: createSessionsService({ db }),
    passwordService: createPasswordService({ db, config }),
  });
}

test('login() should throw when given invalid credentials', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });

  const authService = setupService(db);

  await Promise.all(
    [
      {
        username: MOCK_USER.username,
        password: 'notthepassword',
      },
      {
        username: 'nottheuser',
        password: 'supersecret',
      },
      {
        username: 'admin',
        password: 'admin',
      },
    ].map(c =>
      t.throwsAsync(
        () =>
          authService.login(c, {
            name: 'unknown',
            os: 'unknown',
          }),
        { instanceOf: NotAuthorizedError },
      ),
    ),
  );
});

test('login() should return user and session token when given valid credentials', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });

  const authService = setupService(db);

  const result = await authService.login(
    {
      username: MOCK_USER.username,
      password: 'supersecret',
    },
    {
      name: 'unknown',
      os: 'unknown',
    },
  );

  const sessions = await db('sessions').where({
    userId: MOCK_USER.id,
  });

  t.deepEqual(result.user, MOCK_USER);
  t.true(typeof result.sessionToken === 'string');
  t.is(sessions.length, 1);
  t.is(result.sessionToken, sessions[0].token);
});

test('logout() should delete active session', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });
  await db('sessions').insert(MOCK_SESSIONS);

  const authService = setupService(db);

  await authService.logout(MOCK_SESSIONS[1].id);

  const sessions = await db('sessions').where({
    userId: MOCK_USER.id,
  });

  t.is(sessions.length, 1);
  t.is(sessions[0].id, MOCK_SESSIONS[0].id);
});

test('changePassword() should reject an insecure new password', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });

  const authService = setupService(db);

  await t.throwsAsync(
    () =>
      authService.changePassword({
        userId: MOCK_USER.id,
        activeSessionId: 'notRelevant',
        newPassword: 'pw',
      }),
    { instanceOf: ValidationError },
  );
});

test('changePassword() should change the users password and invalidate non-active sessions', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });
  await db('sessions').insert(MOCK_SESSIONS);

  const authService = setupService(db);

  await authService.changePassword({
    userId: MOCK_USER.id,
    activeSessionId: MOCK_SESSIONS[1].id,
    newPassword: 'timeforachange',
  });

  const updatedUser = await db('users').where({ id: MOCK_USER.id }).first();
  const sessions = await db('sessions').where({
    userId: MOCK_USER.id,
  });
  t.plan(3);
  t.is(sessions.length, 1);
  t.is(sessions[0].id, MOCK_SESSIONS[1].id);
  if (updatedUser) {
    t.true(comparePasswords('timeforachange', updatedUser.password));
  }
});

test('authenticate() should throw when given invalid session token', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });
  await db('sessions').insert(MOCK_SESSIONS);

  const authService = setupService(db);

  await t.throwsAsync(() => authService.authenticate('notatoken'), {
    instanceOf: NotAuthorizedError,
  });
});

test('authenticate() should return session with user when given a valid token', async t => {
  const { db } = t.context;
  await db('users').insert({
    ...MOCK_USER,
    password: createPasswordHash('supersecret'),
  });
  await db('sessions').insert(MOCK_SESSIONS);

  const authService = setupService(db);

  const sessionWithUser = await authService.authenticate(
    MOCK_SESSIONS[0].token,
  );

  t.deepEqual(sessionWithUser, {
    id: MOCK_SESSIONS[0].id,
    user: MOCK_USER,
  });
});
