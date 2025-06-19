import { Knex } from 'knex';
import { createLeafplayerConfig } from 'test/testHelpers';

import createSongsService from '@/services/SongsService';
import createSharesService from '@/services/SharesService';
import createAlbumsService from '@/services/AlbumsService';
import createArtistsService from '@/services/ArtistsService';
import { generateUuid } from '@/helpers/uuid';

import test from '../setupTestDB';

function setupService(db: Knex) {
  const songsService = createSongsService({ db });
  const albumsService = createAlbumsService({ db, songsService });

  return createSharesService({
    config: createLeafplayerConfig(),
    db,
    albumsService,
    artistsService: createArtistsService({ db, songsService, albumsService }),
    songsService,
  });
}

test('find -> it should return all shares by the given user', async t => {
  const { db } = t.context;

  const artistId = generateUuid();
  const albumId = generateUuid();
  await db('artists').insert({
    id: artistId,
    name: 'An Artist',
  });
  await db('albums').insert({
    id: albumId,
    artistId,
    name: 'An Artist',
    year: 1999,
  });

  const firstUserId = generateUuid();
  await db('users').insert({
    id: firstUserId,
    displayName: 'The User',
    username: 'the-user',
    password: 'the-password',
  });
  const secondUserId = generateUuid();
  await db('users').insert({
    id: secondUserId,
    displayName: 'Another User',
    username: 'another-user',
    password: 'another-password',
  });

  await db('shares').insert([
    {
      id: generateUuid(),
      userId: firstUserId,
      artistId,
      note: 'The share',
    },
    {
      id: generateUuid(),
      userId: firstUserId,
      albumId,
      note: 'Another share',
    },
    {
      id: generateUuid(),
      userId: secondUserId,
      artistId,
      note: 'And yet another share',
    },
  ]);

  const sharesService = setupService(db);

  const shares = await sharesService.find(firstUserId);

  t.is(shares.length, 2);
  const shareNotes = shares.map(share => share.note);
  t.true(shareNotes.includes('The share'));
  t.true(shareNotes.includes('Another share'));
});

test('find -> it should only return non-expired shares', async t => {
  const { db } = t.context;

  const artistId = generateUuid();
  await db('artists').insert({
    id: artistId,
    name: 'An Artist',
  });
  const albumId = generateUuid();
  await db('albums').insert({
    id: albumId,
    artistId,
    name: 'An Album',
    year: 2000,
  });
  const userId = generateUuid();
  await db('users').insert({
    id: userId,
    displayName: 'The User',
    username: 'the-user',
    password: 'the-password',
  });

  const thirtyOneDaysAgo = new Date(new Date().setDate(new Date().getDate() - 31));
  await db('shares').insert([
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: new Date(2000, 1, 1).toISOString(),
      note: 'Really old share',
    },
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: thirtyOneDaysAgo.toISOString(),
      note: 'Just expired share',
    },
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: new Date().toISOString(),
      note: 'Valid share',
    },
  ]);

  const sharesService = setupService(db);

  const shares = await sharesService.find(userId);

  t.is(shares.length, 1);
  t.is(shares[0].note, 'Valid share');
});

test('findForTypeAndId -> it should return only shares by the given user and associated with the given item', async t => {
  const { db } = t.context;

  const firstArtistId = generateUuid();
  const secondArtistId = generateUuid();
  await db('artists').insert([
    {
      id: firstArtistId,
      name: 'An Artist',
    },
    {
      id: secondArtistId,
      name: 'Another Artist',
    },
  ]);

  const firstUserId = generateUuid();
  await db('users').insert({
    id: firstUserId,
    displayName: 'The User',
    username: 'the-user',
    password: 'the-password',
  });
  const secondUserId = generateUuid();
  await db('users').insert({
    id: secondUserId,
    displayName: 'Another User',
    username: 'another-user',
    password: 'another-password',
  });

  await db('shares').insert([
    {
      id: generateUuid(),
      userId: firstUserId,
      artistId: firstArtistId,
      note: 'The share',
    },
    {
      id: generateUuid(),
      userId: secondUserId,
      artistId: firstArtistId,
      note: 'Another share',
    },
    {
      id: generateUuid(),
      userId: firstUserId,
      artistId: secondArtistId,
      note: 'And yet another share',
    },
  ]);

  const sharesService = setupService(db);

  const shares = await sharesService.findForTypeAndId(
    firstUserId,
    'artist',
    firstArtistId,
  );

  t.is(shares.length, 1);
  t.is(shares[0].note, 'The share');
});

test('findForTypeAndId -> it should only return non-expired shares', async t => {
  const { db } = t.context;

  const artistId = generateUuid();
  await db('artists').insert({
    id: artistId,
    name: 'An Artist',
  });
  const albumId = generateUuid();
  await db('albums').insert({
    id: albumId,
    artistId,
    name: 'An Album',
    year: 2000,
  });
  const userId = generateUuid();
  await db('users').insert({
    id: userId,
    displayName: 'The User',
    username: 'the-user',
    password: 'the-password',
  });

  const thirtyOneDaysAgo = new Date(new Date().setDate(new Date().getDate() - 31));
  await db('shares').insert([
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: new Date(2000, 1, 1).toISOString(),
      note: 'Really old share',
    },
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: thirtyOneDaysAgo.toISOString(),
      note: 'Just expired share',
    },
    {
      id: generateUuid(),
      userId,
      albumId,
      createdAt: new Date().toISOString(),
      note: 'Valid share',
    },
  ]);

  const sharesService = setupService(db);

  const shares = await sharesService.findForTypeAndId(userId, 'album', albumId);

  t.is(shares.length, 1);
  t.is(shares[0].note, 'Valid share');
});
