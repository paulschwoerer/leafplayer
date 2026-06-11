import td from 'testdouble';

import { SessionsService } from '@/services/SessionsService';
import { revokeSession } from '@/api/routes/auth/revokeSession';

import { mockVerifyPassword } from '../../mockVerifyPassword';
import { MOCK_SESSION_ID, MOCK_USER } from '../../../testdata/mocks';
import { mockSession } from '../../mockSession';
import test from '../../setupTestServer';

test('revoke session endpoint should call SessionsService service when invoked correctly', async t => {
  const sessionsService = td.object<SessionsService>();

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
