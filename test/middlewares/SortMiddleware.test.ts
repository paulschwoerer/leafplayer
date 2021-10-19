import test from 'ava';
import fastify, { FastifyInstance } from 'fastify';

import { useSortMiddleware } from '@/middlewares/SortMiddleware';
import { SortParam } from '@/typings/SortParam';

function createServer() {
  const server = fastify({ logger: false });

  server.get(
    '/',
    useSortMiddleware(['name', 'createdAt']),
    async (request, reply) => {
      return reply.send(request.sort);
    },
  );

  return server;
}

let server: FastifyInstance;

test.before(() => {
  server = createServer();
});

test.after(async () => server.close());

test('it should accept valid sort query', async t => {
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

  for (const v of values) {
    // eslint-disable-next-line no-await-in-loop
    const response = await server.inject({
      method: 'GET',
      url: '/',
      query: {
        sort: v.param,
      },
    });
    t.deepEqual(response.statusCode, 200);
    t.deepEqual(response.body, JSON.stringify(v.expected));
  }
});

test('it should reject invalid sort params', async t => {
  const values: string[] = [
    'asc(invalidName1)',
    'invalid(name)',
    'desc(notAllowed)',
    '%(name)',
    'desc(__)',
  ];

  for (const v of values) {
    // eslint-disable-next-line no-await-in-loop
    const response = await server.inject({
      method: 'GET',
      url: '/',
      query: {
        sort: v,
      },
    });
    t.deepEqual(response.statusCode, 400);
  }
});
