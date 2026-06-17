import { type UserSession } from 'leafplayer-common';

import { NotAuthorizedError } from '../../lib/errors/NotAuthorizedError.ts';
import { ValidationError } from '../../lib/errors/ValidationError.ts';
import { comparePasswords } from '../../lib/helpers/passwords.ts';
import createAuthService, {
  type AuthService,
} from '../../lib/services/AuthService.ts';
import createPasswordService from '../../lib/services/PasswordService.ts';
import createSessionsService from '../../lib/services/SessionsService.ts';
import createUsersService from '../../lib/services/UsersService.ts';
import { type DB } from '../../lib/database/index.ts';
import { generateUuid } from '../../lib/helpers/uuid.ts';
import { getCurrentUnixTimestamp } from '../../lib/helpers/time.ts';
import test from '../setupTestDB.ts';
import { createLeafplayerConfig } from '../testHelpers.ts';

function setupService(db: DB): AuthService {
  const config = createLeafplayerConfig();
  return createAuthService({
    config,
    usersService: createUsersService({ db }),
    sessionsService: createSessionsService({ db }),
    passwordService: createPasswordService({ db, config }),
  });
}

test('login() should throw when given invalid credentials', t => {
  const { db } = t.context;

  createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const authService = setupService(db);

  const cases = [
    {
      username: 'admin',
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
  ];

  for (const c of cases) {
    t.throws(
      () =>
        authService.login(c, {
          name: 'unknown',
          os: 'unknown',
        }),
      { instanceOf: NotAuthorizedError },
    );
  }
});

test('login() should return user and session token when given valid credentials', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const authService = setupService(db);

  const result = authService.login(
    {
      username: 'admin',
      password: 'supersecret',
    },
    {
      name: 'unknown',
      os: 'unknown',
    },
  );

  const sessions = db
    .prepare<string, UserSession & { token: string }>(
      'SELECT * FROM sessions WHERE userId = ?',
    )
    .all(userId);

  t.deepEqual(result.user, {
    id: userId,
    username: 'admin',
    displayName: 'Admin',
  });
  t.true(typeof result.sessionToken === 'string');
  t.is(sessions.length, 1);
  t.is(result.sessionToken, sessions[0].token);
});

test('logout() should delete active session', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const sessionsService = createSessionsService({ db });
  sessionsService.create({
    userId,
    browser: { name: 'Firefox', os: 'Linux' },
    maxAge: 10000,
  });
  sessionsService.create({
    userId,
    browser: { name: 'Chromium', os: 'Linux' },
    maxAge: 10000,
  });

  const sessionsBefore = sessionsService.findByUserId(userId);

  setupService(db).logout(sessionsBefore[1].id);

  const sessionsAfter = sessionsService.findByUserId(userId);

  t.is(sessionsAfter.length, 1);
  t.is(sessionsAfter[0].id, sessionsBefore[0].id);
});

test('changePassword() should reject an insecure new password', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const authService = setupService(db);

  t.throws(
    () =>
      authService.changePassword({
        userId,
        activeSessionId: 'notRelevant',
        newPassword: 'pw',
      }),
    { instanceOf: ValidationError },
  );
});

test('changePassword() should change the users password and invalidate non-active sessions', t => {
  const { db } = t.context;

  const usersService = createUsersService({ db });
  const userId = usersService.create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const sessionsService = createSessionsService({ db });
  sessionsService.create({
    userId,
    browser: { name: 'Firefox', os: 'Linux' },
    maxAge: 10000,
  });
  sessionsService.create({
    userId,
    browser: { name: 'Chromium', os: 'Linux' },
    maxAge: 10000,
  });

  const sessionsBefore = sessionsService.findByUserId(userId);

  setupService(db).changePassword({
    userId,
    activeSessionId: sessionsBefore[1].id,
    newPassword: 'timeforachange',
  });

  const updatedUser = usersService.findWithPasswordByUsername('admin');
  const sessionsAfter = sessionsService.findByUserId(userId);

  t.plan(3);
  t.is(sessionsAfter.length, 1);
  t.is(sessionsAfter[0].id, sessionsBefore[1].id);
  if (updatedUser) {
    t.true(comparePasswords('timeforachange', updatedUser.password));
  }
});

test('authenticate() should throw when given invalid session token', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  createSessionsService({ db }).create({
    userId,
    browser: { name: 'Firefox', os: 'Linux' },
    maxAge: 10000,
  });

  const authService = setupService(db);

  t.throws(() => authService.authenticate('notatoken'), {
    instanceOf: NotAuthorizedError,
  });
});

test('authenticate() should return session with user when given a valid token', t => {
  const { db } = t.context;

  const userId = createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const sessionId = generateUuid();
  db.prepare(
    `INSERT INTO sessions (id, userId, token, lastUsedAt, expiresAt) VALUES (:id, :userId, :token, :lastUsedAt, :expiresAt)`,
  ).run({
    id: sessionId,
    userId,
    token: 'thetoken',
    lastUsedAt: getCurrentUnixTimestamp(),
    expiresAt: getCurrentUnixTimestamp() + 10000,
  });

  const sessionWithUser = setupService(db).authenticate('thetoken');

  t.deepEqual(sessionWithUser, {
    id: sessionId,
    user: {
      id: userId,
      username: 'admin',
      displayName: 'Admin',
    },
  });
});
