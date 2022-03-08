import td from 'testdouble';
import { FastifyInstance } from 'fastify';

import test from '../setupTestServer';
import { mockSession } from '../mockSession';
import { MOCK_SESSION_ID, MOCK_USER } from '../../testdata/mocks';

import { UsersService } from '~/services/UsersService';
import { createVerifyPasswordPlugin } from '~/api/plugins/verifyPassword';

async function setup(
  server: FastifyInstance,
): Promise<{ usersService: UsersService }> {
  const usersService = td.object<UsersService>();

  await server.register(mockSession(MOCK_SESSION_ID, MOCK_USER));
  await server.register(createVerifyPasswordPlugin({ usersService }));

  server.post(
    '/',
    {
      preHandler: server.auth([server.verifySession, server.verifyPassword], {
        relation: 'and',
      }),
    },
    async (request, reply) => {
      return reply.send('hello world');
    },
  );

  return { usersService };
}

test('it should reject request with incorrect password', async t => {
  const { usersService } = await setup(t.context.server);

  td.when(
    usersService.isCorrectPassword({
      userId: MOCK_USER.id,
      password: 'notthepassword',
    }),
  ).thenResolve(false);

  const response = await t.context.server.inject({
    method: 'POST',
    url: '/',
    payload: {
      currentPassword: 'notthepassword',
    },
  });

  t.is(response.statusCode, 401);
});

test('it should accept request with correct password', async t => {
  const { usersService } = await setup(t.context.server);

  td.when(
    usersService.isCorrectPassword({
      userId: MOCK_USER.id,
      password: 'thepassword',
    }),
  ).thenResolve(true);

  const response = await t.context.server.inject({
    method: 'POST',
    url: '/',
    payload: {
      currentPassword: 'thepassword',
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.body, 'hello world');
});
