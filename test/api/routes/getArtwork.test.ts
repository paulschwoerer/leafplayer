import { Readable } from 'stream';

import { FastifyInstance } from 'fastify';
import td from 'testdouble';

import { getArtwork } from '~/api/routes/getArtwork';
import { ArtworksService } from '~/services/ArtworksService';

import { mockToken } from '../mockToken';
import test from '../setupTestServer';

async function setup(server: FastifyInstance): Promise<ArtworksService> {
  const artworksService = td.object<ArtworksService>();

  await server.register(mockToken());
  await server.register(getArtwork({ artworksService }));

  return artworksService;
}

test('it should return an error when given an invalid artwork type', async t => {
  await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/artwork/invalid/a3347ad5-8374-4e18-8d94-257b3ca802bb',
  });

  t.is(response.statusCode, 404);
});

test('it should return an error when given an invalid uuid', async t => {
  await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/artwork/album/a3347ad5',
  });

  t.is(response.statusCode, 400);
});

test('it should return an error when given an invalid size', async t => {
  await setup(t.context.server);

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '645',
    },
  });

  t.is(response.statusCode, 400);
});

test('it should return an error when artwork cannot be found', async t => {
  const artworksService = await setup(t.context.server);

  td.when(
    artworksService.createArtworkStream(
      'album',
      'a3347ad5-8374-4e18-8d94-257b3ca802bb',
      96,
    ),
  ).thenResolve(Error('not found'));

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '96',
    },
  });

  t.is(response.statusCode, 404);
});

test('it should return a stream', async t => {
  const artworksService = await setup(t.context.server);

  async function* generate() {
    yield 'hello ';
    yield 'world';
  }
  const readable = Readable.from(generate());

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

  const response = await t.context.server.inject({
    method: 'GET',
    path: '/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      size: '96',
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.headers['content-type'], 'image/jpeg');
  t.is(response.headers['content-length'], 11);
  t.is(response.body, 'hello world');
});
