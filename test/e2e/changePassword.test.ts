import createUsersService from '../../lib/services/UsersService.ts';

import { performLogin } from './performLogin.ts';
import test from './setupE2ETest.ts';

test('password changing flow', async t => {
  const { server, db } = t.context;

  createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'validPa$$word',
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
