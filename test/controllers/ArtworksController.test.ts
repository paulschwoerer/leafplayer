import { Readable } from 'stream';

import anyTest, { TestInterface } from 'ava';
import { FastifyInstance } from 'fastify';
import td from 'testdouble';

import { ArtworksController } from '@/controllers';
import { ArtworksService } from '@/services/ArtworksService';

import { createMinimalServer } from '../testHelpers';

const test = anyTest as TestInterface<{
  server: FastifyInstance;
}>;

test.beforeEach(t => {
  t.context.server = createMinimalServer();
});
test.afterEach(async t => t.context.server.close());

test('it should return an error when given an invalid artwork type', async t => {
  const { server } = t.context;
  const artworksService = td.object<ArtworksService>();

  const controller = createController(artworksService);

  await server.register(controller);

  const response = await server.inject({
    method: 'GET',
    path: '/invalid/a3347ad5-8374-4e18-8d94-257b3ca802bb',
  });

  t.is(response.statusCode, 404);
});

test('it should return an error when given an invalid uuid', async t => {
  const { server } = t.context;
  const artworksService = td.object<ArtworksService>();

  const controller = createController(artworksService);

  await server.register(controller);

  const response = await server.inject({
    method: 'GET',
    path: '/album/a3347ad5',
  });

  t.is(response.statusCode, 400);
});

test('it should return an error when given an invalid size', async t => {
  const { server } = t.context;
  const artworksService = td.object<ArtworksService>();

  const controller = createController(artworksService);

  await server.register(controller);

  const response = await server.inject({
    method: 'GET',
    path: '/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '645',
    },
  });

  t.is(response.statusCode, 400);
});

test('it should return an error when artwork cannot be found', async t => {
  const { server } = t.context;
  const artworksService = td.object<ArtworksService>();
  td.when(
    artworksService.createArtworkStream(
      'album',
      'a3347ad5-8374-4e18-8d94-257b3ca802bb',
      96,
    ),
  ).thenResolve(Error('not found'));

  const controller = createController(artworksService);

  await server.register(controller);

  const response = await server.inject({
    method: 'GET',
    path: '/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '96',
    },
  });

  t.is(response.statusCode, 404);
});

test('it should return a stream', async t => {
  const { server } = t.context;

  async function* generate() {
    yield 'hello ';
    yield 'world';
  }
  const readable = Readable.from(generate());

  const artworksService = td.object<ArtworksService>();
  td.when(
    artworksService.createArtworkStream(
      'album',
      'a3347ad5-8374-4e18-8d94-257b3ca802bb',
      96,
    ),
  ).thenResolve({
    stream: readable,
    size: 11,
  });

  const controller = createController(artworksService);

  await server.register(controller);

  const response = await server.inject({
    method: 'GET',
    path: '/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '96',
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.headers['content-type'], 'image/jpeg');
  t.is(response.headers['content-length'], 11);
  t.is(response.body, 'hello world');
});

function createController(artworksService: ArtworksService) {
  return ArtworksController({
    artworksService,
  });
}
