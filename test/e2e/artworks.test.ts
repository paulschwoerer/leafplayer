import fs from 'fs';
import path from 'path';
import { TextDecoder } from 'util';

import jwt from 'jsonwebtoken';

import createJwtService from '@/services/JwtService';
import createAlbumsService from '@/services/AlbumsService';
import createArtistsService from '@/services/ArtistsService';

import test from './setupE2ETest';

test('when omiting token, expect an error', async t => {
  const { server } = t.context;

  const response = await server.inject({
    method: 'GET',
    url: '/api/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
  });

  t.is(response.statusCode, 400);
});

test('when supplying empty token, expect an error', async t => {
  const { server } = t.context;

  const response = await server.inject({
    method: 'GET',
    url: '/api/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      token: '',
    },
  });

  t.is(response.statusCode, 400);
});

test('when token validation fails, expect an error', async t => {
  const { server } = t.context;

  const notAuthorizedToken = jwt.sign({}, 'secret');

  const response = await server.inject({
    method: 'GET',
    url: '/api/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      token: notAuthorizedToken,
    },
  });

  t.is(response.statusCode, 401);
});

test('return an error when given an invalid artwork type', async t => {
  const { config, server } = t.context;

  const token = createJwtService({ config }).makeJwtToken();

  const response = await server.inject({
    method: 'GET',
    path: '/api/artwork/invalid/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      token,
    },
  });

  t.is(response.statusCode, 404);
});

test('return an error when given an invalid UUID', async t => {
  const { config, server } = t.context;

  const token = createJwtService({ config }).makeJwtToken();

  const response = await server.inject({
    method: 'GET',
    path: '/api/artwork/album/a3347ad5',
    query: {
      token,
    },
  });

  t.is(response.statusCode, 400);
});

test('return an error when given an invalid size', async t => {
  const { config, server } = t.context;

  const token = createJwtService({ config }).makeJwtToken();

  const response = await server.inject({
    method: 'GET',
    path: '/api/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      token,
      size: '645',
    },
  });

  t.is(response.statusCode, 400);
});

test('return an error when artwork cannot be found', async t => {
  const { config, server } = t.context;

  const token = createJwtService({ config }).makeJwtToken();

  const response = await server.inject({
    method: 'GET',
    path: '/api/artwork/album/a3347ad5-8374-4e18-8d94-257b3ca802bb',
    query: {
      token,
      size: '96',
    },
  });

  t.is(response.statusCode, 404);
});

test('return an artwork', async t => {
  const { config, server, db } = t.context;

  const token = createJwtService({ config }).makeJwtToken();

  const artworkSize = '96';

  const albumsService = createAlbumsService({ db });
  const artistId = createArtistsService({ db, albumsService }).create({
    name: 'Any Artist',
  });
  const albumId = albumsService.createAlbum({
    artistId,
    name: 'Any Artist',
  });

  const artworkPath = path.join(
    config.storageDir,
    'thumbnails',
    `album-${albumId}-${artworkSize}.jpg`,
  );

  const fakeImageData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

  fs.mkdirSync(path.join(config.storageDir, 'thumbnails'));
  fs.writeFileSync(artworkPath, fakeImageData);

  const response = await server.inject({
    method: 'GET',
    path: `/api/artwork/album/${albumId}`,
    query: {
      token,
      size: artworkSize,
    },
  });

  t.is(response.statusCode, 200);
  t.is(response.headers['content-type'], 'image/jpeg');
  t.is(response.headers['content-length'], fakeImageData.length);
  t.is(response.body, new TextDecoder().decode(fakeImageData));
});
