import td from 'testdouble';

import { UserSession, UserSessionsResponseDto } from '~/common';
import { SessionsService } from '~/services/SessionsService';
import { getSessions } from '~/api/routes/auth/getSessions';

import { MOCK_SESSION_ID, MOCK_USER } from '../../../testdata/mocks';
import { mockSession } from '../../mockSession';
import test from '../../setupTestServer';

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

test('endpoint should return user sessions', async t => {
  const sessionsService = td.object<SessionsService>();
  td.when(sessionsService.findByUserId(MOCK_USER.id)).thenResolve(
    MOCK_SESSIONS,
  );

  const { server } = t.context;
  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(getSessions({ sessionsService }));

  const response = await server.inject({
    method: 'GET',
    path: '/auth/sessions',
  });

  const body = response.json<UserSessionsResponseDto>();
  t.is(response.statusCode, 200);
  t.deepEqual(body, {
    sessions: MOCK_SESSIONS,
    currentSessionId: MOCK_SESSION_ID,
  });
});
