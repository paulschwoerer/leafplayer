import td from 'testdouble';
import { FastifyInstance } from 'fastify';

import test from '../setupTestServer';

import { createTokenAuthPlugin } from '~/api/plugins/tokenAuth';
import { JwtService } from '~/services/JwtService';

async function setup(server: FastifyInstance): Promise<{
  jwtService: JwtService;
}> {
  const jwtService = td.object<JwtService>();

  await server.register(
    createTokenAuthPlugin({
      jwtService,
    }),
  );

  server.get(
    '/',
    { preHandler: server.auth([server.verifyToken]) },
    async (request, reply) => {
      return reply.send('hello world');
    },
  );

  return { jwtService };
}

test('when omiting token, expect an error', async t => {
  await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'GET',
    url: '/',
  });

  t.is(response.statusCode, 400);
});

test('when supplying empty token, expect an error', async t => {
  await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'GET',
    url: '/?token=',
  });

  t.is(response.statusCode, 400);
});

test('when token validation fails, expect an error', async t => {
  const { jwtService } = await setup(t.context.server);

  td.when(jwtService.isValidJwtToken(td.matchers.anything())).thenReturn(false);

  const response = await t.context.server.inject({
    method: 'GET',
    url: `/?token=eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEb25hbGQgRHVjayJ9.KTJ8DbEQk5nLNZs6tyE4XYv7sNmUxf3U4tFSgIPaXB0`,
  });

  t.is(response.statusCode, 401);
});

test('when token validation succeeds, expect authentication to succeed', async t => {
  const { jwtService } = await setup(t.context.server);

  td.when(jwtService.isValidJwtToken(td.matchers.anything())).thenReturn(true);

  const response = await t.context.server.inject({
    method: 'GET',
    url: `/?token=eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJEb25hbGQgRHVjayJ9.KTJ8DbEQk5nLNZs6tyE4XYv7sNmUxf3U4tFSgIPaXB0`,
  });

  t.is(response.statusCode, 200);
});
