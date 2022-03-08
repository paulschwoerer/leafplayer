import { createPasswordHash } from '~/helpers/passwords';
import { generateUuid } from '~/helpers/uuid';

import { performLogin } from './performLogin';
import test from './setupE2ETest';

test('password changing flow', async t => {
  const { server, db } = t.context;

  await db('users').insert({
    id: generateUuid(),
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('validPa$$word'),
  });

  const sessionToken = await performLogin(server, 'admin', 'validPa$$word');

  let response = await server.inject({
    method: 'POST',
    url: '/api/auth/password',
    payload: {
      currentPassword: 'invalidPa$$word',
      newPassword: 'supersecret',
    },
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 401);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/password',
    payload: {
      currentPassword: 'validPa$$word',
      newPassword: 'short',
    },
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 400);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/password',
    payload: {
      currentPassword: 'validPa$$word',
      newPassword: 'supersecret',
    },
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 204);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 200);
});
