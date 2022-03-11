import td from 'testdouble';

import { revokeSession } from '@/api/routes/auth/revokeSession';
import { SessionsService } from '@/services/SessionsService';

import { mockVerifyPassword } from '../../mockVerifyPassword';
import { MOCK_SESSION_ID, MOCK_USER } from '../../../testdata/mocks';
import { mockSession } from '../../mockSession';
import test from '../../setupTestServer';

test('revoke session endpoint should call SessionsService service when invoked correctly', async t => {
  const sessionsService = td.object<SessionsService>();
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

  const { server } = t.context;
  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(mockVerifyPassword());
  await server.register(revokeSession({ sessionsService }));

  const response = await server.inject({
    method: 'DELETE',
    url: `/auth/sessions/${MOCK_SESSION_ID}`,
    payload: {
      currentPassword: 'validPassword',
    },
  });

  t.is(response.statusCode, 204);
  t.notThrows(() => td.verify(sessionsService.deleteById(MOCK_SESSION_ID)));
});
