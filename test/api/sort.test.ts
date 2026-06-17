import { FastifyInstance } from 'fastify';

import { getSortParam } from '../../lib/api/sort.ts';
import { SortParam } from '../../lib/typings/SortParam.ts';

import test from './setupTestServer.ts';

async function setup(server: FastifyInstance): Promise<void> {
  server.get<{ Querystring: { sort?: string } }>(
    '/',
    async (request, reply) => {
      const sort = getSortParam(request.query, ['name', 'createdAt']);

      return reply.send(sort);
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
