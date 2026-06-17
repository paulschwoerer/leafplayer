import { UserSessionsResponseDto } from 'leafplayer-common';

import createUsersService from '../../lib/services/UsersService.ts';

import { performLogin } from './performLogin.ts';
import test from './setupE2ETest.ts';

test('revoke session flow', async t => {
  const { server, db } = t.context;

  createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'supersecret',
  });

  const sessionToken1 = await performLogin(server, 'admin', 'supersecret');
  const sessionToken2 = await performLogin(server, 'admin', 'supersecret');

  let response = await server.inject({
    method: 'GET',
    url: '/api/auth/sessions',
    cookies: {
      id: sessionToken2 || '',
    },
  });

  const sessionId2 = response.json<UserSessionsResponseDto>().currentSessionId;

  response = await server.inject({
    method: 'DELETE',
    url: `/api/auth/sessions/${sessionId2}`,
    cookies: {
      id: sessionToken1 || '',
    },
  });

  t.is(response.statusCode, 204);

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken2 || '',
    },
  });

  t.is(response.statusCode, 401);
});
