import td from 'testdouble';
import { FastifyInstance } from 'fastify';

import { createVerifyPasswordPlugin } from '@/api/plugins/verifyPassword';
import { UsersService } from '@/services/UsersService';

import test from '../setupTestServer';
import { mockAuth } from '../mockAuth';
import { MOCK_SESSION_ID, MOCK_USER } from '../../testdata/mocks';

async function setup(
  server: FastifyInstance,
): Promise<{ usersService: UsersService }> {
  const usersService = td.object<UsersService>();

  await server.register(mockAuth(MOCK_SESSION_ID, MOCK_USER));
  await server.register(createVerifyPasswordPlugin({ usersService }));

  server.post(
    '/',
    {
      preHandler: server.auth([server.verifyAuth, server.verifyPassword], {
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
      password: 'notthepassword',
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
      password: 'thepassword',
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.body, 'hello world');
});
