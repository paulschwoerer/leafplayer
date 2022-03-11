import { getCurrentUnixTimestamp } from '@/helpers/time';
import createSessionsService from '@/services/SessionsService';
import { createPasswordHash } from '@/helpers/passwords';

import test from '../setupTestDB';
import { MOCK_USER, MOCK_SESSION_ID } from '../testdata/mocks';

const USER = {
  ...MOCK_USER,
  password: createPasswordHash('supersecret'),
};

test('get -> it should not return expired session', async ({
  context: { db },
  ...t
}) => {
  await db('users').insert(USER);
  await db('sessions').insert({
    id: MOCK_SESSION_ID,
    token: 'supersecret',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    expiresAt: getCurrentUnixTimestamp() - 1000,
  });

  const sessionsService = createSessionsService({ db });

  const session = await sessionsService.get({
    id: MOCK_SESSION_ID,
    userId: MOCK_USER.id,
  });

  t.is(session, undefined);
});

test('get -> it should not return session token', async ({
  context: { db },
  ...t
}) => {
  await db('users').insert(USER);
  await db('sessions').insert({
    id: MOCK_SESSION_ID,
    token: 'supersecret',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    expiresAt: getCurrentUnixTimestamp() + 1000,
  });

  const sessionsService = createSessionsService({ db });

  const session = await sessionsService.get({
    id: MOCK_SESSION_ID,
    userId: MOCK_USER.id,
  });

  t.false(JSON.stringify(session).includes('supersecret'));
});

test('findByUserId -> it should not return expired sessions', async ({
  context: { db },
  ...t
}) => {
  await db('users').insert(USER);
  await db('sessions').insert([
    {
      id: '9ce18269-e92b-499c-93e3-0962ce2c6257',
      token: 'supersecret1',
      userId: MOCK_USER.id,
      lastUsedAt: 0,
      expiresAt: getCurrentUnixTimestamp() - 1000,
    },
    {
      id: '58e9bded-05fe-4d67-8f53-e71d48741bc4',
      token: 'supersecret2',
      userId: MOCK_USER.id,
      lastUsedAt: 0,
      expiresAt: getCurrentUnixTimestamp() - 1000,
    },
  ]);

  const sessionsService = createSessionsService({ db });

  const session = await sessionsService.findByUserId(MOCK_USER.id);

  t.false(JSON.stringify(session).includes('supersecret'));
});

test('deleteById -> it should delete a given session', async ({
  context: { db },
  ...t
}) => {
  await db('users').insert(USER);
  await db('sessions').insert({
    id: '58e9bded-05fe-4d67-8f53-e71d48741bc4',
    token: 'supersecret2',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    expiresAt: getCurrentUnixTimestamp() - 1000,
  });

  const sessionsService = createSessionsService({ db });

  await sessionsService.deleteById('58e9bded-05fe-4d67-8f53-e71d48741bc4');

  const deletedSession = await db('sessions')
    .where({
      id: '58e9bded-05fe-4d67-8f53-e71d48741bc4',
    })
    .first();

  t.is(deletedSession, undefined);
});
