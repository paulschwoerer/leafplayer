import { LightMyRequestResponse } from 'fastify';

import { UserResponseDto, UserSessionsResponseDto } from '@/common';
import { createPasswordHash } from '@/helpers/passwords';
import { generateUuid } from '@/helpers/uuid';

import test from './setupE2ETest';

test('Login and logout process should work', async t => {
  const { server, db } = t.context;

  await db('users').insert({
    id: generateUuid(),
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('validPa$$word'),
  });

  let response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'invalidPa$$word',
    },
  });

  t.is(response.statusCode, 401);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'validPa$$word',
    },
  });

  t.is(response.statusCode, 200);

  const sessionToken = extractSessionTokenFromResponse(response);
  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  const { user } = response.json<UserResponseDto>();
  t.is(response.statusCode, 200);
  t.is(user.username, 'admin');

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/sessions',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 200);

  const { sessions, currentSessionId } =
    response.json<UserSessionsResponseDto>();

  t.is(sessions.length, 1);
  t.is(sessions[0].id, currentSessionId);

  response = await server.inject({
    method: 'POST',
    url: '/api/auth/logout',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 204);

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 401);
});

function extractSessionTokenFromResponse(
  response: LightMyRequestResponse,
): string | null {
  type Cookie = {
    name: string;
    value: string;
  };

  const cookies = response.cookies as Cookie[];

  const sessionCookie = cookies.find(cookie => cookie.name === 'id');

  return sessionCookie?.value || null;
}
