import { type UserResponseDto } from 'leafplayer-common';

import { getCurrentUnixTimestamp } from '../../lib/helpers/time.ts';

import { performLogin } from './performLogin.ts';
import test from './setupE2ETest.ts';

test('registration flow', async t => {
  const { server, db } = t.context;

  const invitationInsert = db.prepare<{ code: string; expiresAt: number }>(
    `INSERT INTO invitations (code, expiresAt) VALUES (:code, :expiresAt)`,
  );

  invitationInsert.run({
    code: 'supersecret_invitation',
    expiresAt: getCurrentUnixTimestamp() + 10000,
  });
  invitationInsert.run({
    code: 'expired_invitation',
    expiresAt: getCurrentUnixTimestamp() - 10000,
  });

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
