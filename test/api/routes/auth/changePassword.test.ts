import td from 'testdouble';

import { mockVerifyPassword } from '../../mockVerifyPassword';
import { MOCK_SESSION_ID, MOCK_USER } from '../../../testdata/mocks';
import { mockSession } from '../../mockSession';
import test from '../../setupTestServer';

import { AuthService } from '~/services/AuthService';
import { changePassword } from '~/api/routes/auth/changePassword';

test('password endpoint should call service', async t => {
  const authService = td.object<AuthService>();

  const { server } = t.context;
  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(mockVerifyPassword());
  await server.register(changePassword({ authService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/password',
    payload: {
      currentPassword: 'supersecret',
      newPassword: 'timeforachange',
    },
  });

  t.is(response.statusCode, 204);
  t.notThrows(() => {
    td.verify(
      authService.changePassword({
        userId: MOCK_USER.id,
        activeSessionId: MOCK_SESSION_ID,
        newPassword: 'timeforachange',
      }),
    );
  });
});
