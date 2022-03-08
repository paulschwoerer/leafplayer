import { Knex } from 'knex';

import { generateUuid } from '~/helpers/uuid';
import createAlbumsService from '~/services/AlbumsService';
import createArtistsService from '~/services/ArtistsService';
import createSongsService from '~/services/SongsService';
import createSearchHistoryService from '~/services/SearchHistoryService';
import { NotFoundError } from '~/errors/NotFoundError';

import test from '../setupTestDB';
import { MOCK_USER } from '../testdata/mocks';

function setupService(db: Knex) {
  const songsService = createSongsService({ db });
  const albumsService = createAlbumsService({ db, songsService });
  const artistsService = createArtistsService({
    db,
    albumsService,
    songsService,
  });
  return createSearchHistoryService({
    db,
    artistsService,
    albumsService,
    songsService,
  });
}

test('findEntries -> it should return valid history entries', async t => {
  const { db } = t.context;

  await db('users').insert({
    ...MOCK_USER,
    password: '-',
  });

  await db('artists').insert([
    {
      id: 'ea771b59-b7c7-4054-8b91-ace4a4fd0324',
      name: 'Green Artist',
    },
    {
      id: '97d4df78-6542-4ba8-9cde-0e3263fc6b9e',
      name: 'Yellow Artist',
    },
  ]);

  await db('albums').insert([
    {
      id: 'e7d6b934-a164-4661-a888-53f3e63aefe8',
      artistId: '97d4df78-6542-4ba8-9cde-0e3263fc6b9e',
      name: 'Red Album',
    },
    {
      id: '3ea21f72-c95a-4bcc-8d17-2b07bcf281ed',
      artistId: '97d4df78-6542-4ba8-9cde-0e3263fc6b9e',
      name: 'Green Album',
    },
  ]);

  await db('search_history').insert([
    {
      id: 'accd128e-bec8-496c-8097-388f723f63b2',
      userId: MOCK_USER.id,
      albumId: '3ea21f72-c95a-4bcc-8d17-2b07bcf281ed',
    },
    {
      id: '435d15f6-0d81-4f5e-8228-9a73d6557f44',
      userId: MOCK_USER.id,
      artistId: 'ea771b59-b7c7-4054-8b91-ace4a4fd0324',
    },
  ]);

  const service = setupService(db);

  const entries = await service.findEntries(MOCK_USER.id);

  t.plan(3);
  t.is(entries.length, 2);

  if (entries[0].type === 'album') {
    t.is(entries[0].album.name, 'Green Album');
  }

  if (entries[1].type === 'artist') {
    t.is(entries[1].artist.name, 'Green Artist');
  }
});

test('createEntry -> it should not create an entry for a non-existing entity', async t => {
  const { db } = t.context;

  await db('users').insert({
    ...MOCK_USER,
    password: '',
  });

  const service = setupService(db);

  await t.throwsAsync(
    () =>
      service.createEntry({
        userId: MOCK_USER.id,
        forType: 'album',
        forId: generateUuid(),
      }),
    { instanceOf: NotFoundError },
  );
});

test('createEntry -> it should create a new entry', async t => {
  const { db } = t.context;

  const artistId = generateUuid();

  await db('users').insert({
    ...MOCK_USER,
    password: '',
  });
  await db('artists').insert({
    id: artistId,
    name: 'Yellow Artist',
  });

  const service = setupService(db);

  const entry = await service.createEntry({
    userId: MOCK_USER.id,
    forType: 'artist',
    forId: artistId,
  });

  t.plan(6);
  if (entry.type === 'artist') {
    t.is(entry.artist.id, artistId);
    t.is(entry.artist.name, 'Yellow Artist');
  }

  const dbEntry = await db('search_history').first();
  if (dbEntry) {
    t.is(dbEntry.userId, MOCK_USER.id);
    t.is(dbEntry.artistId, artistId);
    t.is(dbEntry.albumId, null);
    t.is(dbEntry.songId, null);
  }
});

test('deleteEntry -> it should delete a given entry', async t => {
  const { db } = t.context;

  await db('users').insert({
    ...MOCK_USER,
    password: '-',
  });

  await db('artists').insert({
    id: 'ea771b59-b7c7-4054-8b91-ace4a4fd0324',
    name: 'Green Artist',
  });

  await db('search_history').insert({
    id: 'accd128e-bec8-496c-8097-388f723f63b2',
    userId: MOCK_USER.id,
    artistId: 'ea771b59-b7c7-4054-8b91-ace4a4fd0324',
  });

  const service = setupService(db);

  await service.deleteEntry({
    userId: MOCK_USER.id,
    id: 'accd128e-bec8-496c-8097-388f723f63b2',
  });

  t.is((await db('search_history').where(true)).length, 0);
});
