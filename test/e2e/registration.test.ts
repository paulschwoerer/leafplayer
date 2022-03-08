import { UserResponseDto } from '~/common';
import { getCurrentUnixTimestamp } from '~/helpers/time';

import { performLogin } from './performLogin';
import test from './setupE2ETest';

test('Login and logout flow', async t => {
  const { server, db } = t.context;

  await db('invitations').insert([
    {
      code: 'supersecret_invitation',
      expiresAt: getCurrentUnixTimestamp() + 10000,
    },
    {
      code: 'expired_invitation',
      expiresAt: getCurrentUnixTimestamp() - 10000,
    },
  ]);

  let response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'no_an_invitation',
      username: 'newUser',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 401);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'expired_invitation',
      username: 'newUser',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 401);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      inviteCode: 'supersecret_invitation',
      username: 'newUser',
      password: 'supersecret',
    },
  });

  t.is(response.statusCode, 201);

  const sessionToken = await performLogin(server, 'newUser', 'supersecret');

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken,
    },
  });

  t.is(response.statusCode, 200);
  const { user } = response.json<UserResponseDto>();
  t.is(user.username, 'newuser');
  t.is(user.displayName, 'newUser');
});
