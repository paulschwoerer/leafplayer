import td from 'testdouble';

import { logout } from '@/api/routes/auth/logout';
import { AuthService } from '@/services/AuthService';

import { mockSession } from '../../mockSession';
import {
  MOCK_SESSION_ID,
  MOCK_SESSION_TOKEN,
  MOCK_USER,
} from '../../../testdata/mocks';
import test from '../../setupTestServer';

test('logout endpoint should set logout cookie', async t => {
  const authService = td.object<AuthService>();

  const { server } = t.context;
  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(logout({ authService }));

  const response = await server.inject({
    method: 'POST',
    path: '/auth/logout',
    cookies: {
      id: MOCK_SESSION_TOKEN,
    },
  });

  t.is(response.statusCode, 204);
  t.is(response.headers['set-cookie'], 'id=; Expires=01 Jan 1970');
  t.notThrows(() => {
    td.verify(authService.logout(MOCK_SESSION_ID));
  });
});
