import { getCurrentUnixTimestamp } from '../../lib/helpers/time.ts';
import createSessionsService from '../../lib/services/SessionsService.ts';
import createUsersService from '../../lib/services/UsersService.ts';
import { generateUuid } from '../../lib/helpers/uuid.ts';
import test from '../setupTestDB.ts';

const USER = {
  username: 'admin',
  displayName: '',
  password: 'supersecret',
};

test('getByToken -> it should not return expired session', ({
  context: { db },
  ...t
}) => {
  const userId = createUsersService({ db }).create(USER);

  db.prepare(
    `INSERT INTO sessions (id, userId, token, lastUsedAt, expiresAt) VALUES (:id, :userId, :token, :lastUsedAt, :expiresAt)`,
  ).run({
    id: generateUuid(),
    userId,
    token: 'supersecret',
    lastUsedAt: getCurrentUnixTimestamp(),
    expiresAt: getCurrentUnixTimestamp() - 1000,
  });

  const sessionsService = createSessionsService({ db });

  const session = sessionsService.getByToken('supersecret');

  t.is(session, undefined);
});

test('getByToken -> it should not return session token', ({
  context: { db },
  ...t
}) => {
  const userId = createUsersService({ db }).create(USER);

  db.prepare(
    `INSERT INTO sessions (id, userId, token, lastUsedAt, expiresAt) VALUES (:id, :userId, :token, :lastUsedAt, :expiresAt)`,
  ).run({
    id: generateUuid(),
    userId,
    token: 'supersecret',
    lastUsedAt: getCurrentUnixTimestamp(),
    expiresAt: getCurrentUnixTimestamp() + 1000,
  });

  const sessionsService = createSessionsService({ db });

  const session = sessionsService.getByToken('supersecret');

  t.false(JSON.stringify(session).includes('supersecret'));
});

test('findByUserId -> it should not return expired sessions', ({
  context: { db },
  ...t
}) => {
  const userId = createUsersService({ db }).create(USER);

  const sessionId = generateUuid();
  db.prepare(
    `INSERT INTO sessions (id, userId, token, lastUsedAt, expiresAt) VALUES (:id, :userId, :token, :lastUsedAt, :expiresAt)`,
  ).run({
    id: sessionId,
    userId,
    token: 'supersecret',
    lastUsedAt: getCurrentUnixTimestamp(),
    expiresAt: getCurrentUnixTimestamp() - 1000,
  });

  const sessionsService = createSessionsService({ db });

  t.is(sessionsService.findByUserId(userId).length, 0);
});

test('deleteById -> it should delete a given session', ({
  context: { db },
  ...t
}) => {
  const userId = createUsersService({ db }).create(USER);

  const sessionId = generateUuid();
  db.prepare(
    `INSERT INTO sessions (id, userId, token, lastUsedAt, expiresAt) VALUES (:id, :userId, :token, :lastUsedAt, :expiresAt)`,
  ).run({
    id: sessionId,
    userId,
    token: 'supersecret',
    lastUsedAt: getCurrentUnixTimestamp(),
    expiresAt: getCurrentUnixTimestamp() - 1000,
  });

  const sessionsService = createSessionsService({ db });

  sessionsService.deleteById(sessionId);

  t.is(sessionsService.findByUserId(userId).length, 0);
});
