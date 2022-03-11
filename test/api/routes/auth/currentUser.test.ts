import td from 'testdouble';
import { UserResponseDto } from 'common/dtos';

import { currentUser } from '@/api/routes/auth/currentUser';
import { JwtService } from '@/services/JwtService';

import {
  MOCK_SESSION_ID,
  MOCK_USER,
  MOCK_SESSION_TOKEN,
} from '../../../testdata/mocks';
import { mockSession } from '../../mockSession';
import test from '../../setupTestServer';

const MOCK_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

test('user endpoint should return the current user', async t => {
  const jwtService = td.object<JwtService>();
  td.when(jwtService.makeJwtToken()).thenReturn(MOCK_JWT_TOKEN);

  const { server } = t.context;
  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(currentUser({ jwtService }));

  const response = await server.inject({
    method: 'GET',
    path: '/auth/user',
    cookies: {
      id: MOCK_SESSION_TOKEN,
    },
  });

  const body = response.json<UserResponseDto>();
  t.is(response.statusCode, 200);
  t.deepEqual(body.user, MOCK_USER);
  t.is(body.artworkToken, MOCK_JWT_TOKEN);
});
