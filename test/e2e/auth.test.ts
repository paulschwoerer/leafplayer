import jwt from 'jsonwebtoken';

import { UserResponseDto, UserSessionsResponseDto } from '@/common';

import createUsersService from '../../lib/services/UsersService.ts';

import { performLogin } from './performLogin.ts';
import test from './setupE2ETest.ts';

test('Login and logout flow', async t => {
  const { config, server, db } = t.context;

  createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'validPa$$word',
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

  const sessionToken = await performLogin(server, 'admin', 'validPa$$word');

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  const { user, artworkToken } = response.json<UserResponseDto>();
  t.is(response.statusCode, 200);
  t.is(user.username, 'admin');
  t.notThrows(() => jwt.verify(artworkToken, config.security.secret));

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
  const authCookie = response.cookies.find(c => c.name === 'id');
  t.is(authCookie?.expires?.getFullYear(), 1970);

  response = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(response.statusCode, 401);
});

test('login should set session cookie correctly including maxAge when asking to stay logged in', async t => {
  const { server, db } = t.context;

  createUsersService({ db }).create({
    username: 'admin',
    displayName: 'Admin',
    password: 'validPa$$word',
  });

  const response = await server.inject({
    method: 'POST',
    path: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'validPa$$word',
      stayLoggedIn: true,
    },
  });

  t.is(response.statusCode, 200);

  const authCookie = response.cookies.find(c => c.name === 'id');
  t.is(authCookie?.sameSite, 'Lax');
  t.is(authCookie?.httpOnly, true);
  t.is(authCookie?.path, '/api');
  t.is(authCookie?.maxAge, 4);
});
