import { FastifyInstance } from 'fastify';

import test from '../setupTestServer';

import { sortPlugin } from '~/api/plugins/sort';
import { SortParam } from '~/typings/SortParam';

async function setup(server: FastifyInstance): Promise<void> {
  await server.register(sortPlugin);

  server.get(
    '/',
    {
      preHandler: server.sortParam(['name', 'createdAt']),
    },
    async (request, reply) => {
      return reply.send(request.sort);
    },
  );
}

test('it should accept valid sort param', async t => {
  await setup(t.context.server);

  const values: { param: string; expected: SortParam }[] = [
    {
      expected: {
        field: 'name',
        direction: 'asc',
      },
      param: 'asc(name)',
    },
    {
      expected: {
        field: 'createdAt',
        direction: 'desc',
      },
      param: 'desc(createdAt)',
    },
  ];

  await Promise.all(
    values.map(async v => {
      const response = await t.context.server.inject({
        method: 'GET',
        url: '/',
        query: {
          sort: v.param,
        },
      });

      t.is(response.statusCode, 200);
      t.is(response.body, JSON.stringify(v.expected));
    }),
  );
});

test('it should reject invalid sort params', async t => {
  await setup(t.context.server);

  const values: string[] = [
    'asc(invalidName1)',
    'invalid(name)',
    'desc(notAllowed)',
    '%(name)',
    'desc(__)',
  ];

  await Promise.all(
    values.map(async v => {
      const response = await t.context.server.inject({
        method: 'GET',
        url: '/',
        query: {
          sort: v,
        },
      });

      t.is(response.statusCode, 400);
    }),
  );
});
