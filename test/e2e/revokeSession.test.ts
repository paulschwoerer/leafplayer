import { UserSessionsResponseDto } from '@/common';
import { createPasswordHash } from '@/helpers/passwords';
import { generateUuid } from '@/helpers/uuid';

import { performLogin } from './performLogin';
import test from './setupE2ETest';

test('revoke session flow', async t => {
  const { server, db } = t.context;

  await db('users').insert({
    id: generateUuid(),
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('supersecret'),
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
    payload: {
      currentPassword: 'nothepassword',
    },
    cookies: {
      id: sessionToken1 || '',
    },
  });

  t.is(response.statusCode, 401);

  response = await server.inject({
    method: 'DELETE',
    url: `/api/auth/sessions/${sessionId2}`,
    payload: {
      currentPassword: 'supersecret',
    },
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
