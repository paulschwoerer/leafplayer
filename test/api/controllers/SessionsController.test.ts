import { FastifyInstance } from 'fastify';
import td from 'testdouble';

import { createSessionsController } from '@/api/controllers/SessionsController';
import { UserSession, UserSessionsResponseDto } from '@/common';
import { SessionsService } from '@/services/SessionsService';

import { MOCK_SESSION_ID, MOCK_USER } from '../../testdata/mocks';
import { mockAuth } from '../mockAuth';
import test from '../setupTestServer';
import { mockVerifyPassword } from '../mockVerifyPassword';

const MOCK_SESSIONS: UserSession[] = [
  {
    id: 'd67f709d-b932-4ca9-a85c-9969d4599197',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    browser: 'Firefox',
    os: 'Linux',
  },
  {
    id: '91651965-e140-486a-9158-aa8fa17df111',
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    browser: 'Chromium',
    os: 'Linux',
  },
];

async function setup(server: FastifyInstance): Promise<{
  sessionsService: SessionsService;
}> {
  const sessionsService = td.object<SessionsService>();

  await server.register(mockAuth(MOCK_SESSION_ID, MOCK_USER));
  await server.register(mockVerifyPassword());
  await server.register(
    createSessionsController({
      sessionsService,
    }),
  );

  return { sessionsService };
}

test('endpoint should return user sessions', async t => {
  const { sessionsService } = await setup(t.context.server);

  td.when(sessionsService.findByUserId(MOCK_USER.id)).thenResolve(
    MOCK_SESSIONS,
  );

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/',
  });

  const body = response.json<UserSessionsResponseDto>();
  t.is(response.statusCode, 200);
  t.deepEqual(body, {
    sessions: MOCK_SESSIONS,
    currentSessionId: MOCK_SESSION_ID,
  });
});

test('revoke session endpoint should call SessionsService service when invoked correctly', async t => {
  const { sessionsService } = await setup(t.context.server);

  td.when(
    sessionsService.get({
      userId: MOCK_USER.id,
      id: MOCK_SESSION_ID,
    }),
  ).thenResolve({
    id: MOCK_SESSION_ID,
    userId: MOCK_USER.id,
    lastUsedAt: 0,
    browser: 'unknown',
    os: 'unknown',
  });

  const response = await t.context.server.inject({
    method: 'DELETE',
    url: `/${MOCK_SESSION_ID}`,
    payload: {
      password: 'validPassword',
    },
  });

  t.is(response.statusCode, 204);
  t.notThrows(() => td.verify(sessionsService.deleteById(MOCK_SESSION_ID)));
});
