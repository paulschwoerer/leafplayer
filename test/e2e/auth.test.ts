import { FastifyInstance, LightMyRequestResponse } from 'fastify';
import anyTest, { TestInterface } from 'ava';
import {
  AwilixContainer,
  createContainer,
  asValue,
  asFunction,
  Lifetime,
} from 'awilix';
import { Knex } from 'knex';

import { generateUuid } from '@/helpers/uuid';
import { UserResponseDto, UserSessionsResponseDto } from '@/common';
import { createPasswordHash } from '@/helpers/passwords';
import { initServer } from '@/api/server';

import { createLeafplayerConfig, setupInMemorySQLiteDB } from '../testHelpers';

const test = anyTest as TestInterface<{
  db: Knex;
  server: FastifyInstance;
  container: AwilixContainer;
}>;

test.beforeEach(async t => {
  const config = createLeafplayerConfig();
  const db = await setupInMemorySQLiteDB();
  const container = createContainer();

  container.register({
    config: asValue(config),
    db: asValue(db),
  });

  container.loadModules(['lib/services/*.ts'], {
    resolverOptions: {
      register: asFunction,
      lifetime: Lifetime.SINGLETON,
    },
    formatName: 'camelCase',
  });

  const server = await initServer(container);

  t.context = {
    db,
    server,
    container,
  };
});

test.afterEach(async t => {
  const { db, server, container } = t.context;

  await db.destroy();
  await server.close();
  await container.dispose();
});

test('Login and logout process should work', async t => {
  const { server, db } = t.context;

  await db('users').insert({
    id: generateUuid(),
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('validPa$$word'),
  });

  const invalidLoginResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'invalidPa$$word',
    },
  });

  t.is(invalidLoginResponse.statusCode, 401);

  const loginResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'validPa$$word',
    },
  });

  t.is(loginResponse.statusCode, 200);

  const sessionToken = extractSessionTokenFromResponse(loginResponse);
  const userResponse = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  const { user } = userResponse.json<UserResponseDto>();
  t.is(userResponse.statusCode, 200);
  t.is(user.username, 'admin');

  const sessionsResponse = await server.inject({
    method: 'GET',
    url: '/api/sessions',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(sessionsResponse.statusCode, 200);

  const { sessions, currentSessionId } =
    sessionsResponse.json<UserSessionsResponseDto>();

  t.is(sessions.length, 1);
  t.is(sessions[0].id, currentSessionId);

  const logoutResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/logout',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(logoutResponse.statusCode, 204);

  const invalidUserResponse = await server.inject({
    method: 'GET',
    url: '/api/auth/user',
    cookies: {
      id: sessionToken || '',
    },
  });

  t.is(invalidUserResponse.statusCode, 401);
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
